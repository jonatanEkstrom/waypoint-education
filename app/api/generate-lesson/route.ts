import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { subject, title, age_group, city, curriculum } = await request.json()

    const difficultyGuide: Record<string, string> = {
      '4–6 years': 'Very simple words. Short sentences. Like a picture book. Use analogies to toys or animals.',
      '7–9 years': 'Simple sentences. Fun facts. Easy vocabulary. Relatable examples from daily life.',
      '10–12 years': 'Intermediate. 4-5 sentences per section. Introduce new vocabulary. Real-world connections.',
      '13–15 years': 'Advanced. Complex sentences. Historical or scientific context. Cause and effect.',
      '16–18 years': 'University prep. Analytical language. Critical thinking. Multiple perspectives.',
    }

    const difficulty = difficultyGuide[age_group] || difficultyGuide['10–12 years']

    const prompt = `Create a rich, self-contained lesson. Return ONLY valid JSON, no other text.

Lesson: ${title} (${subject})
Child: ${age_group}, in ${city}, Philosophy: ${curriculum}
Difficulty: ${difficulty}

The lesson must be complete enough that a parent does NOT need to look anything up elsewhere.

{
  "reading_title": "Engaging title",
  "reading_text": "4-5 paragraphs of story-like educational text at ${age_group} level. Connect to ${city} where natural.",
  "did_you_know": "One surprising or delightful fact related to the topic. Should make the child say wow.",
  "concept_explanation": "WHY does this work or WHY is this true? Explain the underlying concept in 2-3 sentences using a simple real-world analogy the child can relate to.",
  "real_world_examples": [
    "Concrete example from everyday life, ideally something a child in ${city} might see or experience",
    "Second example from a different context (nature, food, sports, technology)",
    "Third example that connects to history or a fun fact"
  ],
  "step_by_step": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ..."
  ],
  "quiz": [
    { "question": "Question testing understanding?", "options": ["A", "B", "C", "D"], "correct": 0 },
    { "question": "Question testing understanding?", "options": ["A", "B", "C", "D"], "correct": 2 },
    { "question": "Question testing understanding?", "options": ["A", "B", "C", "D"], "correct": 1 },
    { "question": "Question testing understanding?", "options": ["A", "B", "C", "D"], "correct": 3 }
  ],
  "activity": "One hands-on activity the child can do alone using simple materials. 2-3 sentences.",
  "parent_tip": "Practical tip for the parent on how to deepen this lesson in conversation or daily life. 2 sentences."
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const material = JSON.parse(cleaned)

    return NextResponse.json({ material })
  } catch (error: any) {
    console.error('Generate lesson error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
