import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { name, age_group, subjects, curriculum, learn_style, city, country, notes } = await request.json()

    const philosophyGuide: Record<string, string> = {
      'charlotte-mason': 'Use living books, nature observation, narration and short focused lessons. Avoid textbook-style instruction.',
      'classical': 'Structure lessons around Grammar (facts), Logic (reasoning) and Rhetoric (expression) stages based on age.',
      'unschooling': 'Follow the child\'s curiosity. Frame lessons as explorations and discoveries, not assignments.',
      'montessori': 'Use hands-on materials, self-directed work and real-world application. Avoid passive learning.',
      'eclectic': 'Mix the best methods — combine hands-on activities, reading, discussion and creative projects.',
    }

    const styleGuide: Record<string, string> = {
      'Hands-on & building': 'Every lesson must include a physical activity, experiment or something to build/make.',
      'Reading & writing': 'Include specific book recommendations, journaling prompts or written exercises.',
      'Visual & video': 'Suggest diagrams, drawings, maps or documentary-style explanations.',
      'Discussion & exploration': 'Frame lessons as Socratic conversations and open-ended questions.',
    }

    const philosophy = philosophyGuide[curriculum] || philosophyGuide['eclectic']
    const style = styleGuide[learn_style] || ''
    const topSubjects = (subjects || []).slice(0, 4).join(', ')
    const extraNotes = notes ? `Special notes about ${name}: ${notes}` : ''

    const prompt = `You are an expert homeschool curriculum designer. Create a rich, detailed 5-day lesson plan.

CHILD PROFILE:
- Name: ${name}
- Age group: ${age_group}
- Current location: ${city}, ${country}
- Subjects: ${topSubjects}
- Philosophy: ${curriculum}
- Learning style: ${learn_style}
${extraNotes}

PHILOSOPHY GUIDANCE: ${philosophy}
LEARNING STYLE GUIDANCE: ${style}

REQUIREMENTS:
- 3 lessons per day
- Each lesson must feel specific to ${name}'s age, location and interests
- Weave ${city} and ${country} into lessons naturally (local landmarks, culture, food, history, nature)
- Follow the ${curriculum} philosophy strictly in how lessons are structured
- Adapt activities to the "${learn_style}" learning style

Return ONLY this JSON structure, no other text:

{
  "week_theme": "engaging theme title that connects all subjects this week",
  "days": [
    {
      "day": "Monday",
      "focus": "one sentence describing the day's learning arc",
      "lessons": [
        {
          "subject": "Math",
          "title": "specific lesson title",
          "duration": "30 min",
          "method": "specific teaching method based on philosophy",
          "goal": "what the child will understand or be able to do after this lesson",
          "activity": "detailed 3-4 sentence description of exactly what to do, step by step",
          "reflection": "a question or prompt to end the lesson and consolidate learning",
          "milestone": "skill or concept being practiced",
          "local_tip": "one specific connection to ${city}, ${country} — a place to visit, local example or cultural tie-in",
          "materials": "simple list of what you need"
        }
      ]
    }
  ]
}

Create all 5 days (Monday–Friday) with exactly 3 lessons each. Be specific, creative and practical.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
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