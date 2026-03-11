import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const { name, age_group, subjects, curriculum, learn_style, city, country, notes } = await request.json()

  const philosophyGuide: Record<string, string> = {
    'charlotte-mason': 'Use living books, nature observation and narration. Short focused lessons.',
    'classical': 'Structure around Grammar (facts), Logic (reasoning) and Rhetoric (expression).',
    'unschooling': 'Follow curiosity. Frame as explorations and discoveries, not assignments.',
    'montessori': 'Hands-on materials, self-directed work and real-world application.',
    'eclectic': 'Mix hands-on activities, reading, discussion and creative projects.',
  }

  const styleGuide: Record<string, string> = {
    'Hands-on & building': 'Include a physical activity, experiment or something to build.',
    'Reading & writing': 'Include a book recommendation, journal prompt or written exercise.',
    'Visual & video': 'Suggest diagrams, drawings or maps.',
    'Discussion & exploration': 'Frame as Socratic conversation and open-ended questions.',
  }

  const philosophy = philosophyGuide[curriculum] || philosophyGuide['eclectic']
  const style = styleGuide[learn_style] || ''
  const topSubjects = (subjects || []).slice(0, 3).join(', ')
  const extraNotes = notes ? `Special notes: ${notes}` : ''

  const prompt = `You are an expert homeschool curriculum designer. Create a 5-day lesson plan.

CHILD: ${name}, ${age_group}, in ${city}, ${country}
SUBJECTS: ${topSubjects}
PHILOSOPHY: ${curriculum} — ${philosophy}
LEARNING STYLE: ${learn_style} — ${style}
${extraNotes}

Return ONLY this JSON, no other text:

{
  "week_theme": "theme connecting all subjects",
  "days": [
    {
      "day": "Monday",
      "focus": "one sentence day summary",
      "lessons": [
        {
          "subject": "Math",
          "title": "lesson title",
          "duration": "30 min",
          "method": "teaching method",
          "goal": "what the child will learn",
          "activity": "2-3 sentences of exactly what to do",
          "reflection": "one closing question",
          "milestone": "skill being practiced",
          "local_tip": "one connection to ${city}",
          "materials": "what you need"
        }
      ]
    }
  ]
}

All 5 days, exactly 2 lessons each. Be specific and practical.`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }]
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        let fullText = ''
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      } catch (e) {
        controller.error(e)
      }
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Accel-Buffering': 'no',
    }
  })
}