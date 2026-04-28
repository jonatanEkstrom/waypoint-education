import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TRACK_FEEDBACK = {
  explorer: {
    style: 'Warm, encouraging, and specific. Celebrate what they got right. Give clear, friendly suggestions in simple language. End with genuine encouragement. Always give a numeric score out of 100 — be generous: 70+ for a reasonable attempt that shows understanding.',
    followUp: false,
    modelAnswer: false,
    hasScore: true,
  },
  discoverer: {
    style: 'Balanced and constructive. Acknowledge specific strengths. Give actionable improvements with examples. Connect to real-world relevance. Show score out of 100. 60–80 for solid responses; reward good reasoning even if imperfect.',
    followUp: false,
    modelAnswer: true,
    hasScore: true,
  },
  pioneer: {
    style: 'Academic and Socratic. Do NOT give a numeric score — give qualitative assessment of argument structure, evidence quality, and depth of analysis. Engage with the ideas themselves. Then ask one Socratic follow-up question that pushes their thinking further — not a factual question, but one that requires them to defend, extend, or challenge their own reasoning.',
    followUp: true,
    modelAnswer: false,
    hasScore: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    const { exercise, answer, track, age_group, child_name } = await req.json()

    const cfg = TRACK_FEEDBACK[track as keyof typeof TRACK_FEEDBACK] ?? TRACK_FEEDBACK.explorer

    const exerciseSummary = typeof exercise === 'object'
      ? `Title: ${exercise.title}\nQuestion/Prompt: ${exercise.content}`
      : String(exercise)

    const prompt = `You are an expert educator evaluating a student's practice exercise response.
Return ONLY valid JSON — no markdown, no extra text.

TRACK: ${track}
STUDENT: ${child_name || 'the student'}, ${age_group}
FEEDBACK STYLE: ${cfg.style}

EXERCISE:
${exerciseSummary}
${exercise?.correct_answer ? `\nCorrect answer: ${exercise.correct_answer}` : ''}

STUDENT'S ANSWER:
"${answer}"

${cfg.followUp
  ? 'For "follow_up_question": Write one probing Socratic question based specifically on what they wrote. It must require them to defend, extend, or challenge their own reasoning — not a factual recall question.'
  : 'Set "follow_up_question" to "".'}

${cfg.modelAnswer
  ? 'For "model_answer": Write 2-4 sentences showing what an excellent answer would include. Be specific to this exercise.'
  : 'Set "model_answer" to "".'}

${cfg.hasScore
  ? 'Set "score" to a number from 0 to 100.'
  : 'Set "score" to null.'}

OUTPUT this exact JSON:
{
  "score": ${cfg.hasScore ? '<number 0-100>' : 'null'},
  "what_went_well": "2-3 specific things they did well — reference their actual words or ideas. Be genuine and precise.",
  "improvement": "2-3 specific, actionable improvements that reference their actual answer. Constructive, not discouraging.",
  "encouragement": "One warm, genuine sentence appropriate for a ${age_group} student.",
  "follow_up_question": "",
  "model_answer": "",
  "skill_assessed": "The specific skill or concept this exercise tested"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const feedback = JSON.parse(cleaned)

    return NextResponse.json({ feedback })
  } catch (error: any) {
    console.error('Practice evaluate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
