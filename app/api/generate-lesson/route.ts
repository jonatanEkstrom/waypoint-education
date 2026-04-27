import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const {
      subject, title, age_group, city, country,
      curriculum, learn_style, language_learning,
      interests, recent_topics, reading_level, focus_time,
    } = await request.json()

    // ── Level guidance ──────────────────────────────────────────────────────
    const level: Record<string, { prose: string; activityTime: string; depth: string; tone: string }> = {
      '4–6 years':   { prose: 'Very simple words, 1-2 short sentences per idea. Playful and magical. Use animal comparisons or toy analogies. No complex vocabulary.', activityTime: '10–15 min', depth: 'One core idea only. No sub-concepts.', tone: 'Magical, warm, wonder-filled.' },
      '7–9 years':   { prose: 'Short sentences, everyday words, energetic and curious tone. Fun facts welcome. Simple cause-and-effect.', activityTime: '20–25 min', depth: 'Core idea plus one interesting detail or connection.', tone: 'Young explorer discovering the world.' },
      '10–12 years': { prose: 'Full paragraphs. Introduce subject vocabulary (define inline). Use cause-and-effect. Rhetorical questions welcome.', activityTime: '30–40 min', depth: 'Core idea + why it matters + one cross-subject connection.', tone: 'Young scientist or historian piecing things together.' },
      '13–15 years': { prose: 'Complex sentences. Academic vocabulary. Historical or scientific context. Explore nuance and debate.', activityTime: '40–50 min', depth: 'Deep dive with multiple angles and open questions.', tone: 'Critical thinker building their own worldview.' },
      '16–18 years': { prose: 'University-prep level. Multiple perspectives, primary sources where natural, synthesis across subjects.', activityTime: '50–60 min', depth: 'Full topic with context, controversy, and one research suggestion.', tone: 'Emerging scholar.' },
    }
    const normalizedAge = age_group === '3–4 years' || age_group === '5–6 years' ? '4–6 years'
      : age_group === '13+ years' ? '13–15 years'
      : age_group
    const lv = level[normalizedAge] || level['10–12 years']

    // ── Learning-style hint ─────────────────────────────────────────────────
    const styleHints: Record<string, string> = {
      'Hands-on & building': 'Activity MUST involve making or building something physical.',
      'Reading & writing':   'Activity includes a journaling or short writing prompt.',
      'Visual & video':      'Activity involves drawing, sketching, or creating a visual map.',
      'Discussion & exploration': 'Activity is observation-based; discussion questions are central.',
      'Visual':     'Activity involves drawing or creating a visual.',
      'Auditory':   'Include a sound component or rhythm in the activity.',
      'Kinesthetic':'Activity MUST involve movement or physical manipulation.',
      'Reading/Writing': 'Activity involves writing or annotating.',
    }
    const styleHint = styleHints[learn_style] || ''

    // ── Philosophy hint ─────────────────────────────────────────────────────
    const philHints: Record<string, string> = {
      'Unschooling':      'Let natural curiosity lead. Story feels self-discovered.',
      'Classical':        'Ground in great ideas. Mention a historical figure or classical text.',
      'Charlotte Mason':  'Use living, narrative prose. Nature observation if possible.',
      'Montessori':       'Hands-on, repeatable, orderly. Activity is self-contained.',
      'Eclectic':         'Mix content, hands-on, and discussion evenly.',
      'Traditional':      'Clear structure. Concrete skills. Step-by-step activity.',
    }
    const philHint = philHints[curriculum] || ''

    // ── Reading level hint ──────────────────────────────────────────────────
    const readingHints: Record<string, string> = {
      'letters': 'Child is just learning to read. Use very simple words (1-2 syllables where possible). Every new word must be sounded out phonetically in the text ("c-a-t"). Short sentences of 5-8 words max. No complex vocabulary — describe pictures or scenes instead.',
      'early':   'Child is an early reader. Use simple, clear sentences. When introducing a new word, immediately define it in brackets. Mix short text sections with hands-on activities to keep engagement.',
      'fluent':  'Child reads confidently. Normal text length is fine. Introduce new vocabulary naturally and encourage them to look up anything unfamiliar. Can include a short independent reading suggestion.',
    }
    const readingHint = readingHints[reading_level] || ''

    // ── Focus time hint ─────────────────────────────────────────────────────
    const focusHints: Record<string, string> = {
      '15min': 'STRICT: Activity must take 10-15 minutes maximum. Break content into tiny, digestible chunks. One simple activity only — no multi-step projects.',
      '30min': 'Activity should take 20-30 minutes. One main focused task. Can have 2-3 steps but keep them clear and sequential.',
      '60min': 'Activity can be 45-60 minutes. Multi-step projects, research tasks, or creative deep-dives are appropriate. Encourage thorough exploration.',
    }
    const focusHint = focusHints[focus_time] || ''

    const interestsStr = Array.isArray(interests) && interests.length
      ? `Child's interests/subjects: ${interests.join(', ')}.`
      : ''

    const recentStr = Array.isArray(recent_topics) && recent_topics.length
      ? `\nRECENT LESSONS (do NOT repeat these; build on or contrast them if natural):\n${recent_topics.slice(0, 3).join('\n')}`
      : ''

    const langStr = language_learning && language_learning !== 'None'
      ? `Weave in 1-2 ${language_learning} words or a short phrase relevant to this topic. Mark them in *italics* notation inside the JSON string.`
      : ''

    const prompt = `You are an expert homeschool educator creating a single self-contained lesson.
Return ONLY valid JSON — no markdown, no extra text.

LESSON: "${title}" (${subject})
CHILD: ${age_group} in ${city}, ${country}
PHILOSOPHY: ${philHint}
LEARNING STYLE: ${styleHint}
${readingHint ? `READING LEVEL: ${readingHint}` : ''}
${focusHint ? `FOCUS TIME: ${focusHint}` : ''}
${interestsStr}
LANGUAGE: ${langStr}
${recentStr}

WRITING LEVEL: ${lv.prose}
ACTIVITY TIME: ${lv.activityTime}
DEPTH: ${lv.depth}
TONE: ${lv.tone}

OUTPUT JSON — every field required, no field may be null or empty:
{
  "reading_title": "Specific, engaging lesson title (not just the subject name)",
  "introduction": "2-3 sentences that hook the child. Start with a vivid question, image, or surprising statement. ${lv.prose}",
  "story": "3-4 sentences. A short vivid story OR real-world scene in ${city}, ${country} OR tied to the child's interests (${interestsStr || 'general curiosity'}) that makes this topic come alive. Dramatic and concrete.",
  "main_content": "The core learning content split into 2-3 paragraphs (separated by \\n\\n). Flowing prose, no bullet points. ${lv.depth} Level: ${lv.prose}",
  "activity": {
    "title": "Short memorable name for the activity",
    "materials": "Short comma-separated list of simple household items (or 'No materials needed')",
    "time": "${lv.activityTime}",
    "description": "3-5 concrete steps written directly to the child using 'you'. Very specific actions, not vague suggestions."
  },
  "discussion_questions": [
    "Open question 1 — sparks genuine conversation between parent and child",
    "Open question 2 — connects this topic to the child's everyday life",
    "Open question 3 — mildly challenging, invites the child to speculate or form an opinion"
  ],
  "fun_fact": "One genuinely surprising or counterintuitive fact. Start with 'Did you know' or 'Amazingly'.",
  "quiz": [
    { "question": "Clear direct question testing understanding of the main idea", "options": ["Plausible wrong answer", "Correct answer", "Plausible wrong answer"], "correct": 1 },
    { "question": "Second question testing a different part of the lesson", "options": ["Correct answer", "Plausible wrong answer", "Plausible wrong answer"], "correct": 0 }
  ],
  "parent_tip": "1-2 sentences. A practical way to extend this lesson today — a dinner-table question, nearby place to visit, or free resource to find."
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const material = JSON.parse(cleaned)

    return NextResponse.json({ material })
  } catch (error: any) {
    console.error('Generate lesson error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
