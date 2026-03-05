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
          "description": "2 sentences describing the lesson",
          "milestone": "skill name",
          "local_tip": "one sentence connecting lesson to ${city}",
          "reading": "A short 3-4 sentence educational text written for ${age_group} about the lesson topic. Make it engaging and age-appropriate.",
          "questions": [
            "Discussion question 1?",
            "Discussion question 2?",
            "Discussion question 3?"
          ],
          "activity": "A specific hands-on activity the child can do right now, using simple materials. 2-3 sentences.",
          "parent_tip": "A practical tip for the parent on HOW to teach this lesson. What to say, what to watch for, common mistakes to avoid. 2-3 sentences.",
          "quiz": [
            { "question": "Quiz question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0 },
            { "question": "Quiz question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 2 },
            { "question": "Quiz question?", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 1 }
          ]
        }
      ]
    }
  ]
}

Create all 5 days (Monday-Friday) with 2 lessons each. Keep all text concise and age-appropriate for ${age_group}.`

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