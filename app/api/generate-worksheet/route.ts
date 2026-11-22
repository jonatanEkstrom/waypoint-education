import { goalGuidance } from '@/app/lib/server/goal-guidance'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAccess } from '@/app/lib/server/access'

import { curriculumBand, teachingGuidance } from '@/app/lib/curriculum'

export const maxDuration = 60

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  const guard = await requireAccess()
  if ('response' in guard) return guard.response

  try {
    const { subject, theme, child_id, concept_id } = await request.json()
    const { data: child } = await guard.admin.from('children')
      .select('name, age_group, city').eq('id', child_id).eq('user_id', guard.user.id).maybeSingle()
    if (!child) return NextResponse.json({ error: 'child_not_found' }, { status: 404 })
    const { name, age_group, city } = child
    const difficulty = teachingGuidance(age_group)
    let goal = ''
    if (concept_id) {
      const { data: band } = await guard.admin.from('age_groups').select('id')
        .eq('label', curriculumBand(age_group)).maybeSingle()
      const { data: course } = await guard.admin.from('subjects').select('id').eq('slug', subject).maybeSingle()
      if (!band || !course) return NextResponse.json({ error: 'goal_not_found' }, { status: 404 })
      const { data: concept } = await guard.admin.from('curriculum_concepts')
        .select('concept_key, concept_name, concept_description').eq('id', concept_id)
        .eq('age_group_id', band.id).eq('subject_id', course.id).maybeSingle()
      if (!concept) return NextResponse.json({ error: 'goal_not_found' }, { status: 404 })
      goal = `Use only this learning goal for every question: ${concept.concept_name}. ${concept.concept_description}\n${goalGuidance(concept.concept_key)}`
    }

    const prompt = `Create a worksheet for ${name}, ${age_group}, in ${city}.
Subject: ${subject}
Theme: ${theme || subject}

${goal}

DIFFICULTY LEVEL FOR ${age_group}: ${difficulty}

Use the age guidance for reading load and response format. When a learning goal is supplied, keep the mathematical demand at that goal.

Return ONLY valid JSON, no other text:
{
  "title": "Engaging worksheet title with emoji",
  "subtitle": "One subtitle connecting to ${city}",
  "matching": {
    "instruction": "Match each item with the correct answer!",
    "pairs": [
      { "left": "item 1", "right": "answer 1" },
      { "left": "item 2", "right": "answer 2" },
      { "left": "item 3", "right": "answer 3" },
      { "left": "item 4", "right": "answer 4" },
      { "left": "item 5", "right": "answer 5" }
    ]
  },
  "fillblank": {
    "instruction": "Fill in the missing word!",
    "sentences": [
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" },
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" },
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" },
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" },
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" }
    ]
  },
  "truefalse": {
    "instruction": "True or False?",
    "statements": [
      { "text": "statement 1", "answer": true },
      { "text": "statement 2", "answer": false },
      { "text": "statement 3", "answer": true },
      { "text": "statement 4", "answer": false },
      { "text": "statement 5", "answer": true }
    ]
  },
  "shortanswer": {
    "instruction": "Answer these questions with full sentences!",
    "questions": [
      "Question 1?",
      "Question 2?"
    ]
  }
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const worksheet = JSON.parse(cleaned)

    return NextResponse.json({ worksheet })
  } catch (error: any) {
    console.error('Generate worksheet error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
