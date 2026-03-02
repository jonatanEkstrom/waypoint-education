import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { name, age_group, subjects, curriculum, learn_style, city, country, notes } = await request.json()

    const prompt = `Create a 5-day homeschool week plan. Return ONLY valid JSON, no other text.

Child: ${name}, ${age_group}, in ${city} ${country}
Philosophy: ${curriculum}, Learning style: ${learn_style}
Subjects: ${subjects.slice(0, 3).join(', ')}

Return this exact JSON structure:
{
  "week_theme": "short theme title",
  "days": [
    {
      "day": "Monday",
      "focus": "one sentence",
      "lessons": [
        {
          "subject": "Math",
          "title": "lesson title",
          "duration": "30 min",
          "method": "teaching method",
          "description": "2 sentences max",
          "milestone": "skill name",
          "local_tip": "one sentence about ${city}"
        },
        {
          "subject": "Science",
          "title": "lesson title",
          "duration": "30 min",
          "method": "teaching method",
          "description": "2 sentences max",
          "milestone": "skill name",
          "local_tip": "one sentence about ${city}"
        }
      ]
    }
  ]
}

Create all 5 days (Monday-Friday) with 2 lessons each. Keep descriptions short.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const plan = JSON.parse(cleaned)

    return NextResponse.json({ plan })
  } catch (error: any) {
    console.error('Generate plan error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}