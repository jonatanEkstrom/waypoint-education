import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const { name, age_group, subjects, curriculum, learn_style, city, country, notes, language_learning } = await request.json()
  console.log('[generate-plan] Received:', { name, language_learning, subjects, age_group })

  const philosophyGuide: Record<string, string> = {
    'charlotte-mason': 'Living books, nature, narration.',
    'classical': 'Grammar, Logic, Rhetoric stages.',
    'unschooling': 'Follow curiosity, child-led.',
    'montessori': 'Hands-on, self-directed.',
    'eclectic': 'Mix of methods.',
  }

  const styleGuide: Record<string, string> = {
    'Hands-on & building': 'Physical activity or experiment.',
    'Reading & writing': 'Book or journal prompt.',
    'Visual & video': 'Diagram or drawing.',
    'Discussion & exploration': 'Open-ended questions.',
  }

  const philosophy = philosophyGuide[curriculum] || philosophyGuide['eclectic']
  const style = styleGuide[learn_style] || ''
  const extraNotes = notes ? `Notes: ${notes}` : ''

  // Distribute ALL subjects evenly across 15 lesson slots (3 per day × 5 days).
  // Cycling ensures every subject appears at least once (up to 8 subjects).
  const allSubjects: string[] = subjects && subjects.length > 0 ? subjects : ['General Studies']
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const slots = Array.from({ length: 15 }, (_, i) => allSubjects[i % allSubjects.length])
  const scheduleLines = days.map((day, d) =>
    `${day}: "${slots[d * 3]}", "${slots[d * 3 + 1]}", "${slots[d * 3 + 2]}"`
  ).join('\n')

  const langNote = language_learning && language_learning !== 'None'
    ? `LANGUAGE: One of the lessons this week must focus on ${language_learning} (vocabulary, phrases, or conversation tied to the location).\n`
    : ''
  console.log('[generate-plan] langNote:', langNote || '(none — language_learning is None or missing)')

  const prompt = `Homeschool curriculum designer. Create a 5-day plan. Return ONLY valid JSON, nothing else.

CHILD: ${name}, ${age_group}, ${city}, ${country}
ALL SUBJECTS: ${allSubjects.join(', ')}
PHILOSOPHY: ${philosophy}
STYLE: ${style}
${langNote}${extraNotes}

SUBJECT SCHEDULE — follow exactly. Each lesson's "subject" field must match the assigned subject below:
${scheduleLines}

RULES:
- Every subject listed in ALL SUBJECTS must appear at least once across the week.
- Do not substitute, skip, or repeat subjects beyond what the schedule above specifies.
- Keep every field SHORT — max 15 words each.
- Adapt difficulty strictly to age: ${age_group}. 4-6 yrs = simple/playful. 16-18 yrs = advanced/complex.

{"week_theme":"string","days":[{"day":"Monday","focus":"string","lessons":[{"subject":"string","title":"string","duration":"30 min","method":"string","goal":"string","activity":"string","reflection":"string","milestone":"string","local_tip":"string","materials":"string"}]}]}

Return all 5 days (Monday-Friday), exactly 3 lessons each. ONLY JSON.`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 4500,
    messages: [{ role: 'user', content: prompt }]
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
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
