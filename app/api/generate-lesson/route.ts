import { goalGuidance } from '@/app/lib/server/goal-guidance'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { nextGoal } from '@/app/lib/server/next-goal'
import { requireAccess } from '@/app/lib/server/access'

import { curriculumBand, teachingGuidance } from '@/app/lib/curriculum'

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const guard = await requireAccess()
  if ('response' in guard) return guard.response

  try {
    const { child_id, subject_slug, city, country } = await request.json()

    const supabase = guard.admin

    // Service role bypasses RLS, so ownership must be checked explicitly.
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('name, age_group, focus_time, reading_level')
      .eq('id', child_id)
      .eq('user_id', guard.user.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'child_not_found' }, { status: 404 })
    }

    const { data: ageGroup, error: ageGroupError } = await supabase
      .from('age_groups')
      .select('id')
      .eq('label', curriculumBand(child.age_group))
      .single()

    if (ageGroupError || !ageGroup) {
      return NextResponse.json({ error: 'age_group_not_found' }, { status: 200 })
    }

    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', subject_slug)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'subject_not_found' }, { status: 404 })
    }

    const { concept, needsReview } = await nextGoal(supabase, child_id, ageGroup.id, subject.id)
    if (!concept) return NextResponse.json({ error: 'all_complete' }, { status: 200 })

    const systemPrompt = `You are a children's lesson writer. Write a lesson that teaches EXACTLY one concept, and no other:

Concept: ${concept.concept_name}
Description: ${concept.concept_description}
${goalGuidance(concept.concept_key)}
Learner: ${child.age_group}
Teaching guidance: ${teachingGuidance(child.age_group)}
${needsReview ? 'This learner needs more support on this goal. Start with a simpler worked example and one scaffolded action, then fade the support for the check.' : ''}
Reading level: ${child.reading_level || "unspecified"}
Preferred focus time: ${child.focus_time || "unspecified"}. Use the shorter of this and the teaching guidance; split longer work into steps with movement breaks.

Do not introduce, explain, or drift into any other topic or concept, even if it seems related. The child's city (${city}, ${country}) may only be used as a backdrop or setting for examples — it must never change the subject matter or pull in unrelated topics. Stay strictly within the bounds of the concept above for the entire lesson.`

    const userPrompt = `Create a short lesson for ${child.name} on the concept "${concept.concept_name}". Return ONLY valid JSON, no markdown.

OUTPUT this exact JSON:
{
  "concept_id": "${concept.id}",
  "reading_title": "Specific lesson title",
  "introduction": "Exactly 2 sentences introducing the topic. Reference ${city} as a backdrop.",
  "main_content": "Point 1 in 1 sentence.\\n\\nPoint 2 in 1 sentence.\\n\\nPoint 3 in 1 sentence.",
  "example": "One concrete example illustrating the concept.",
  "activity": {
    "title": "Activity name",
    "materials": "Materials or 'None needed'",
    "time": "Short duration consistent with the teaching guidance",
    "description": "3-4 sentences describing what to do."
  },
  "discussion_questions": ["One open-ended question about the topic."],
  "check_for_understanding": "One quick task or question the learner can answer orally, with objects, or in writing.",
  "parent_success_criterion": "What the learner must independently show or explain before moving on.",
  "fun_fact": "One surprising fact in 1 sentence.",
  "parent_tip": "One practical tip for the parent."
}`

    const stream = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPrompt,
      stream: true,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error: any) {
    console.error('Generate lesson error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
