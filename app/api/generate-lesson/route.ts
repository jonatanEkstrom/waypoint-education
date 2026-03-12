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
      '4–6 years': 'Very simple words. 2-3 short sentences. Like a picture book.',
      '7–9 years': 'Simple sentences. Fun facts. Easy vocabulary.',
      '10–12 years': 'Intermediate. 4-5 sentences. Some new vocabulary words.',
      '13–15 years': 'Advanced. Complex sentences. Historical or scientific context.',
      '16–18 years': 'University prep. Analytical language. Cause and effect. Critical thinking.',
    }

    const difficulty = difficultyGuide[age_group] || difficultyGuide['10–12 years']

    const prompt = `Create an interactive reading lesson. Return ONLY valid JSON, no other text.

Lesson: ${title} (${subject})
Child: ${age_group}, in ${city}, Philosophy: ${curriculum}
Difficulty: ${difficulty}

{
  "reading_title": "Engaging title for the reading",
  "reading_text": "4-5 paragraphs of educational text at exactly ${age_group} level. Connect to ${city} where natural. Make it engaging and story-like.",
  "quiz": [
    { "question": "Question directly from the text?", "options": ["A", "B", "C", "D"], "correct": 0 },
    { "question": "Question directly from the text?", "options": ["A", "B", "C", "D"], "correct": 2 },
    { "question": "Question directly from the text?", "options": ["A", "B", "C", "D"], "correct": 1 },
    { "question": "Question directly from the text?", "options": ["A", "B", "C", "D"], "correct": 3 }
  ],
  "activity": "One hands-on activity the child can do alone. 2 sentences.",
  "parent_tip": "One practical tip for the parent. 2 sentences."
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
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