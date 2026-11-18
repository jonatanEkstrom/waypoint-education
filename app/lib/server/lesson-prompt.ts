import type { AgeBand } from './curriculum'

export const STAGES = [
  {
    name: 'Discover',
    emoji: '🧭',
    goal: 'Introduce the concept for the first time. Hook curiosity with a short story or scene set where the family is, explain the idea clearly in small steps, show one worked example, then a short hands-on activity.',
    quiz: 3,
  },
  {
    name: 'Practise',
    emoji: '🎯',
    goal: 'Recap the concept in two sentences, show two worked examples of rising difficulty, then a game-like practice activity. The quiz is the main practice, from easy to stretching.',
    quiz: 5,
  },
  {
    name: 'Explore',
    emoji: '🗺️',
    goal: 'Apply the concept in the real world. Give a concrete mission the child can do in or around where they are staying (observe, measure, collect, ask, compare, record), then reflect on what they found. Finish with a short mastery check.',
    quiz: 3,
  },
] as const

const BAND_VOICE: Record<AgeBand, string> = {
  '3-4': 'The child is 3–4 and cannot read yet. Write everything for the PARENT to read aloud and lead. Play-based, sensory, very short steps, lots of praise, no worksheets. Quiz questions are asked aloud by the parent; options are short words or things the child can point to. Activities last 5–10 minutes.',
  '5-6': 'The child is 5–6 and is an early reader. Short sentences and simple words; the parent reads along. Concrete objects, movement and games. Activities last 10–15 minutes.',
  '7-9': 'The child is 7–9. Friendly, clear language they can mostly read themselves. Mix explanation with doing. Activities last 15–20 minutes.',
  '10-12': 'The child is 10–12. Speak to them directly as a capable learner. Use precise vocabulary and explain why, not just how. Activities last 20–30 minutes.',
  '13+': 'The learner is 13+. Treat them as an independent learner: rigorous, precise, KS3-level vocabulary, a little challenge and real-world relevance. Activities last 30–40 minutes.',
}

export type LessonPromptInput = {
  childName: string
  band: AgeBand
  ncStage: string
  subjectName: string
  concept: { name: string; objective: string; nc: string; strand: string }
  stage: number
  previousConcepts: string[]
  city: string
  country: string
  interests: string[]
  learningStyle: string
  readingLevel: string
  focusTime: string
}

export function buildLessonPrompt(i: LessonPromptInput): { system: string; user: string } {
  const stage = STAGES[i.stage - 1]
  const place = [i.city, i.country].filter(Boolean).join(', ') || 'wherever the family is right now'
  const profile = [
    i.interests.length ? `Interests: ${i.interests.slice(0, 6).join(', ')}` : '',
    i.learningStyle ? `Learning style: ${i.learningStyle}` : '',
    i.readingLevel ? `Reading level: ${i.readingLevel}` : '',
    i.focusTime ? `Focus time: ${i.focusTime}` : '',
  ].filter(Boolean).join('. ')

  const system = `You write lessons for Waypoint Education, a homeschooling app for families who travel. Lessons follow the England National Curriculum (EYFS for under-5s) and use the family's current location to make learning vivid.

Rules:
- Teach EXACTLY this one concept and nothing beyond it: "${i.concept.name}" — ${i.concept.objective}
- Curriculum alignment: ${i.concept.nc} (${i.ncStage}). Use British English spelling and UK conventions (e.g. "maths", "colour", metres, £ alongside the local currency where money appears).
- The location (${place}) is the setting for stories, examples and missions. Use real, well-known features of the place only when you are confident they exist; otherwise describe generic features (a market, a street, the sea, a park) without naming them. Never invent facts about the place.
- All facts must be correct. Every quiz question has exactly one correct option.
- Activities and missions must be safe, legal, respectful of local culture, need an adult nearby for under-12s, cost nothing or very little, and use things a travelling family has (paper, pencil, phone, found objects).
- Be warm, playful and encouraging. Make it feel like an adventure, not a worksheet.
- ${BAND_VOICE[i.band]}
- Output ONLY one JSON object, no markdown, no commentary.`

  const user = `Write lesson ${i.stage} of 3 ("${stage.name}") for ${i.childName}.
Stage goal: ${stage.goal}
${i.previousConcepts.length ? `Recently learned (you may briefly connect to these): ${i.previousConcepts.join('; ')}.` : 'This is the first concept in this subject.'}
${profile ? `About the child: ${profile}. Use their interests for examples where natural.` : ''}

Return this JSON (all strings plain text, no markdown):
{
  "reading_title": "Catchy, specific title",
  "introduction": "2–3 sentences: a hook set in ${place} that makes the child want to find out more.",
  "main_content": "The teaching, as 3–5 short paragraphs separated by \\n\\n. Clear steps, one idea per paragraph.",
  "example": "A worked example set in ${place}, showing each step.",
  "activity": {
    "title": "Activity name",
    "materials": "What is needed, or 'None needed'",
    "time": "e.g. 10–15 min",
    "description": "3–5 sentences on exactly what to do."
  },
  "mission": ${i.stage === 3
    ? `{ "title": "Mission name", "description": "A real-world task to do in or around ${place}, 3–5 sentences.", "record": "What to record or bring back (a tally, a sketch, a photo, three facts)." }`
    : 'null'},
  "quiz": [
    { "question": "…", "options": ["…", "…", "…", "…"], "answer_index": 0, "explanation": "One sentence on why." }
  ],
  "discussion_questions": ["1–2 open questions to talk about together"],
  "fun_fact": "One true, surprising fact linked to the concept (and the place if possible).",
  "parent_tip": "One practical tip for the parent, including how to tell if the child has understood.",
  "journal_prompt": "One sentence the child could write or draw about in their travel journal."
}
The quiz must have exactly ${stage.quiz} questions with 3 or 4 options each. Vary answer_index across questions.`

  return { system, user }
}

type Quiz = { question: string; options: string[]; answer_index: number; explanation: string }

export type Lesson = {
  reading_title: string
  introduction: string
  main_content: string
  example: string
  activity: { title: string; materials: string; time: string; description: string } | null
  mission: { title: string; description: string; record: string } | null
  quiz: Quiz[]
  discussion_questions: string[]
  fun_fact: string
  parent_tip: string
  journal_prompt: string
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** Parses and sanitises model output; returns null if unusable. */
export function parseLesson(raw: string): Lesson | null {
  let data: Record<string, unknown>
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    data = JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return null
  }
  const title = str(data.reading_title)
  const main = str(data.main_content)
  if (!title || !main) return null

  const quiz: Quiz[] = Array.isArray(data.quiz)
    ? (data.quiz as Record<string, unknown>[])
        .map(q => ({
          question: str(q?.question),
          options: Array.isArray(q?.options) ? (q.options as unknown[]).map(str).filter(Boolean) : [],
          answer_index: Number(q?.answer_index),
          explanation: str(q?.explanation),
        }))
        .filter(q => q.question && q.options.length >= 2 && Number.isInteger(q.answer_index)
          && q.answer_index >= 0 && q.answer_index < q.options.length)
    : []

  const a = data.activity as Record<string, unknown> | null
  const m = data.mission as Record<string, unknown> | null

  return {
    reading_title: title,
    introduction: str(data.introduction),
    main_content: main,
    example: str(data.example),
    activity: a && str(a.description)
      ? { title: str(a.title) || 'Activity', materials: str(a.materials), time: str(a.time), description: str(a.description) }
      : null,
    mission: m && str(m.description)
      ? { title: str(m.title) || 'Mission', description: str(m.description), record: str(m.record) }
      : null,
    quiz,
    discussion_questions: Array.isArray(data.discussion_questions)
      ? (data.discussion_questions as unknown[]).map(str).filter(Boolean).slice(0, 3)
      : [],
    fun_fact: str(data.fun_fact),
    parent_tip: str(data.parent_tip),
    journal_prompt: str(data.journal_prompt),
  }
}
