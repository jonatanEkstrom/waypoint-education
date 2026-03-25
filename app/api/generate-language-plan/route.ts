import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const { language, age_group, child_name, language_week, previous_summary } = await request.json()
  console.log('[generate-language-plan] Received:', { language, age_group, child_name, language_week })

  const ageGuide: Record<string, string> = {
    '4–6 years': 'Max 3 new words per day. Very simple phrases. Lots of repetition. No grammar rules.',
    '7–9 years': '4–5 new words per day. Basic greetings and questions. Simple sentences.',
    '10–12 years': '6–8 new words per day. Introduce simple grammar patterns. Conversational phrases.',
    '13–15 years': '8–10 new words per day. Grammar rules, short reading, writing simple sentences.',
    '16–18 years': '10–15 new words per day. Complex grammar, idioms, cultural nuance, conversation skills.',
  }

  const ageInstruction = ageGuide[age_group] || ageGuide['10–12 years']

  const context = language_week === 1
    ? 'This is Week 1. Start from absolute zero — assume no prior knowledge of this language.'
    : `This is Week ${language_week}.\n\nPREVIOUSLY COVERED:\n${previous_summary || 'Earlier weeks of basics.'}\n\nBuild directly on these foundations. Introduce new vocabulary and slightly more complex grammar. Naturally reinforce previous words where possible.`

  const prompt = `You are an expert ${language} language teacher creating a progressive weekly homeschool curriculum for ${child_name} (${age_group}).

${context}

Age guidance: ${ageInstruction}

Create Week ${language_week} of the ${language} curriculum. Return ONLY valid JSON, nothing else:

{
  "week_theme": "Short descriptive theme name (e.g. 'Greetings & Numbers')",
  "week_number": ${language_week},
  "vocabulary": [
    {"word": "...", "translation": "...", "pronunciation": "...", "example": "Full example sentence in ${language}."}
  ],
  "days": [
    {
      "day": "Monday",
      "focus": "Short focus description (e.g. 'Hello and Goodbye')",
      "new_words": ["word1", "word2", "word3"],
      "phrases": [
        {"phrase": "...", "translation": "...", "pronunciation": "..."}
      ],
      "mini_lesson": "2–3 sentence explanation of today's concept or grammar point.",
      "activity": "One short hands-on practice activity (1–2 sentences).",
      "fun_fact": "Interesting cultural or linguistic fact about ${language}-speaking countries."
    }
  ],
  "weekly_quiz": [
    {"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}
  ],
  "weekly_summary": "Concise summary of ALL vocabulary and grammar covered this week. This is used as context for next week's plan — be specific."
}

Rules:
- vocabulary = ALL new words from the full week combined (15–30 words total)
- days = exactly 5 entries (Monday through Friday)
- weekly_quiz = exactly 5 questions testing this week's vocabulary and phrases
- Keep each field concise — displayed on a screen
- ONLY return JSON`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
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
