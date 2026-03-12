import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const { name, age_group, subjects, curriculum, learn_style, city, country, notes } = await request.json()

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
  const topSubjects = (subjects || []).slice(0, 3).join(', ')
  const extraNotes = notes ? `Notes: ${notes}` : ''

  const prompt = `Homeschool curriculum designer. Create a 5-day plan. Return ONLY valid JSON, nothing else.

CHILD: ${name}, ${age_group}, ${city}, ${country}
SUBJECTS: ${topSubjects}
PHILOSOPHY: ${philosophy}
STYLE: ${style}
${extraNotes}

IMPORTANT: Keep every field SHORT — max 10 words each. No long sentences.

{"week_theme":"string","days":[{"day":"Monday","focus":"string","lessons":[{"subject":"string","title":"string","duration":"30 min","method":"string","goal":"string","activity":"string","reflection":"string","milestone":"string","local_tip":"string","materials":"string"}]}]}

Return all 5 days (Monday-Friday), exactly 2 lessons each. ONLY JSON.`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
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