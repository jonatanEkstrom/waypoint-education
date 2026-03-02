import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { name, age_group, subjects, curriculum, learn_style, city, country, notes } = await request.json()

    const prompt = `You are an expert homeschooling curriculum designer. Create a 5-day week plan for a child with these details:

- Name: ${name}
- Age group: ${age_group}
- Location: ${city}, ${country}
- Teaching philosophy: ${curriculum}
- Learning style: ${learn_style}
- Priority subjects: ${subjects.join(', ')}
- Additional notes: ${notes || 'None'}

Create 3 unique, engaging lessons per day (Monday to Friday). Each lesson must:
1. Be deeply rooted in the ${city} location — use local landmarks, culture, food, history
2. Follow the ${curriculum} philosophy authentically
3. Be age-appropriate for ${age_group}
4. Connect to real international learning milestones

Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "week_theme": "theme title here",
  "days": [
    {
      "day": "Monday",
      "focus": "focus description",
      "lessons": [
        {
          "subject": "Math",
          "title": "lesson title",
          "duration": "45 min",
          "method": "teaching method",
          "description": "detailed lesson description",
          "milestone": "Cambridge milestone name",
          "local_tip": "specific local tip using ${city}"
        }
      ]
    }
  ]
}`

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