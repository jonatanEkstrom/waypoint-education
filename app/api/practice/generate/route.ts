import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TRACK_CONFIG = {
  explorer: {
    ages: '10–12',
    duration: '10–15 minutes',
    typeGuidance: 'Choose EITHER multiple_choice OR short_answer — whichever best fits this specific exercise. Multiple choice suits factual knowledge and concepts; short answer suits reasoning and explanation. Do NOT use essay or problem types.',
    styleGuide: 'Warm, clear, and encouraging. Use their interests and city in examples. Step-by-step where needed. Include a helpful hint that gives a clue without giving away the answer.',
    depthGuide: 'One clear concept. Concrete, specific examples. No jargon without a simple definition inline.',
    includeHint: true,
  },
  discoverer: {
    ages: '13–15',
    duration: '20–30 minutes',
    typeGuidance: 'Prefer short_answer or essay. Short answer for focused analytical questions (3-6 sentences of reasoning). Essay for broader analytical, argumentative, or creative tasks. Occasional multiple_choice is fine for concept-checking, but most exercises should require extended reasoning.',
    styleGuide: 'Engaging and intellectually challenging. Connect to real-world situations, current events, or travel experiences. Expect reasoning, not just recall. Reference their location.',
    depthGuide: 'Multiple ideas in tension. Introduce specialist vocabulary. Ask for reasoning, evidence, and explanation — not just facts.',
    includeHint: false,
  },
  pioneer: {
    ages: '16+',
    duration: '30–45 minutes',
    typeGuidance: 'Use essay or problem only. Essay for analytical, argumentative, or creative writing (300–500 words expected). Problem for complex mathematical, scientific, logical, or ethical challenges requiring structured reasoning. No multiple choice.',
    styleGuide: 'Academic and rigorous. Treat as an intelligent young adult. Expect precise language, structured argument, and independent thought. Reference real scholarship, events, or thinkers where natural.',
    depthGuide: 'High depth. Nuance, multiple perspectives, synthesis across ideas. Near GCSE/high-school level academic language is expected and appropriate.',
    includeHint: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    const {
      subject, track, child_name, age_group, city, country,
      interests, previous_topics,
    } = await req.json()

    const cfg = TRACK_CONFIG[track as keyof typeof TRACK_CONFIG] ?? TRACK_CONFIG.explorer
    const interestsStr = Array.isArray(interests) && interests.length ? interests.join(', ') : 'varied topics'
    const prevStr = Array.isArray(previous_topics) && previous_topics.length
      ? `Recently covered: ${previous_topics.slice(0, 3).join(', ')}. Generate something meaningfully different.`
      : ''

    const prompt = `You are an expert educator creating a practice exercise.
Return ONLY valid JSON — no markdown, no extra text.

SUBJECT: ${subject}
TRACK: ${track} (ages ${cfg.ages})
STUDENT: ${child_name || 'the student'}, ${age_group}, currently in ${city}, ${country}
INTERESTS: ${interestsStr}
${prevStr}

EXERCISE TYPE GUIDANCE: ${cfg.typeGuidance}

STYLE: ${cfg.styleGuide}
DEPTH: ${cfg.depthGuide}
EXPECTED TIME: ${cfg.duration}

RULES:
- Reference ${city} or ${country} in at least one concrete example
- Connect to at least one of their interests (${interestsStr})
- Content must be factually accurate and specific — never vague or generic
- Activity must be self-contained — no internet access required

For the "type" field, output exactly one of: multiple_choice, short_answer, essay, problem
For multiple_choice: populate "options" with 4 items (label A/B/C/D, text) and set "correct_answer" to the correct letter.
For all other types: set "options" to [] and "correct_answer" to "".
${cfg.includeHint ? 'Set "hint" to a helpful clue that guides thinking without giving away the answer.' : 'Set "hint" to "".'}

OUTPUT this exact JSON:
{
  "title": "A specific, engaging title for this exercise",
  "context": "2-3 sentences of engaging background. Set the scene in ${city} or connect to ${interestsStr}. Make it feel relevant and real.",
  "instructions": "Clear, direct instructions telling the student exactly what to do and what a good response looks like.",
  "question": "QUESTION: [The single, specific question or challenge the student must answer — 1-2 sentences, crystal-clear, always phrased as a direct question or challenge]",
  "type": "one of: multiple_choice | short_answer | essay | problem",
  "content": "The main question, problem, or essay prompt. Specific and intellectually interesting.",
  "options": [],
  "correct_answer": "",
  "hint": "",
  "expected_time": "${cfg.duration}",
  "subject_focus": "The specific sub-topic or skill this exercise develops"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const exercise = JSON.parse(cleaned)

    return NextResponse.json({ exercise })
  } catch (error: any) {
    console.error('Practice generate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
