import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAccess } from '@/app/lib/server/access'
import { curriculumBand } from '@/app/lib/curriculum'
import { swedishStarterWeek, swedishTeenStarterWeek } from '@/app/lib/server/swedish-starter-week'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const guard = await requireAccess()
  if ('response' in guard) return guard.response

  const body = await request.json().catch(() => null)
  const { child_id, language_week, previous_summary } = body ?? {}
  if (typeof child_id !== 'string' || !Number.isInteger(language_week) || language_week < 1) {
    return Response.json({ error: 'invalid_language_request' }, { status: 400 })
  }
  const { data: child, error } = await guard.admin.from('children').select('age_group, language_learning')
    .eq('id', child_id).eq('user_id', guard.user.id).maybeSingle()
  if (error) return Response.json({ error: 'language_plan_unavailable' }, { status: 503 })
  if (!child || !child.language_learning || child.language_learning === 'None') {
    return Response.json({ error: 'language_profile_unavailable' }, { status: 404 })
  }
  const { age_group, language_learning: language } = child
  if (typeof age_group !== 'string') return Response.json({ error: 'invalid_age_group' }, { status: 400 })
  const band = curriculumBand(age_group)
  if (language === 'Swedish' && language_week === 1) {
    if (band === '7-9') return Response.json(swedishStarterWeek)
    if (band === '13+') return Response.json(swedishTeenStarterWeek)
  }

  const ageGuide: Record<string, string> = {
    '3–4 years': 'Use adult-led listening and imitation. Teach at most 2 new spoken words per day, with pictures or gestures. No independent reading or writing.',
    '5–6 years': 'Max 3 new words per day. Very simple phrases. Lots of repetition. No grammar rules.',
    '4–6 years': 'Max 3 new words per day. Very simple phrases. Lots of repetition. No grammar rules.',
    '7–9 years': '4–5 new words per day. Basic greetings and questions. Simple sentences.',
    '10–12 years': '6–8 new words per day. Introduce simple grammar patterns. Conversational phrases.',
    '13–15 years': '8–10 new words per day. Grammar rules, short reading, writing simple sentences.',
    '13+ years': 'Use secondary-school examples, short independent reading and practical conversation. Explain one useful grammar pattern at a time.',
    '16–18 years': '10–15 new words per day. Complex grammar, idioms, cultural nuance, conversation skills.',
  }

  const ageInstruction = ageGuide[age_group] || ageGuide['10–12 years']

  const context = language_week === 1
    ? 'This is Week 1. Start from absolute zero — assume no prior knowledge of this language.'
    : `This is Week ${language_week}.\n\nPREVIOUSLY COVERED:\n${(typeof previous_summary === 'string' && previous_summary.slice(0, 5000)) || 'Earlier weeks of basics.'}\n\nBuild directly on these foundations. Introduce new vocabulary and slightly more complex grammar. Naturally reinforce previous words where possible.`

  const prompt = `You are an expert ${language} language teacher creating a progressive weekly homeschool curriculum for a learner aged ${age_group}.

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
- vocabulary = ALL new words from the full week combined (up to 25, respecting age guidance)
- days = exactly 5 entries (Monday through Friday)
- weekly_quiz = exactly 5 questions testing this week's vocabulary and phrases
- Keep each field concise — displayed on a screen
- ONLY return JSON`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0 })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    }, { signal: AbortSignal.any([request.signal, AbortSignal.timeout(40_000)]) })
    const text = message.content.flatMap(block => block.type === 'text' ? [block.text] : []).join('')
    const plan = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```\s*$/g, '').trim())
    if (plan?.week_number !== language_week || typeof plan.week_theme !== 'string' ||
        typeof plan.weekly_summary !== 'string' || !Array.isArray(plan.vocabulary) ||
        !Array.isArray(plan.days) || plan.days.length !== 5 ||
        !Array.isArray(plan.weekly_quiz) || plan.weekly_quiz.length !== 5) {
      throw new Error('Incomplete language plan')
    }
    return Response.json(plan)
  } catch (error) {
    console.error('[generate-language-plan] Failed:', error instanceof Error ? error.name : 'UnknownError')
    return Response.json({ error: 'language_plan_unavailable' }, { status: 503 })
  }
}
