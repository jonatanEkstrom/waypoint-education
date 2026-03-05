import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { subject, title, description, age_group, city, curriculum } = await request.json()

    const prompt = `Create learning material for this homeschool lesson. Return ONLY valid JSON, no other text.

Lesson: ${title} (${subject})
Description: ${description}
Child age: ${age_group}, Location: ${city}, Philosophy: ${curriculum}

{
  "reading": "3-4 sentence educational text for ${age_group} about this topic. Engaging and age-appropriate.",
  "questions": [
    "Discussion question 1?",
    "Discussion question 2?",
    "Discussion question 3?"
  ],
  "activity": "Specific hands-on activity using simple materials. 2-3 sentences.",
  "parent_tip": "Practical tip for parent on HOW to teach this. 2-3 sentences.",
  "quiz": [
    { "question": "Question?", "options": ["A", "B", "C", "D"], "correct": 0 },
    { "question": "Question?", "options": ["A", "B", "C", "D"], "correct": 2 },
    { "question": "Question?", "options": ["A", "B", "C", "D"], "correct": 1 }
  ]
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
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