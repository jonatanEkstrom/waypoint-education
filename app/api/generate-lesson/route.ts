import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60
export const runtime = 'edge'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type AgeTier = 'early' | 'young' | 'junior' | 'teen'

function getAgeTier(age_group: string): AgeTier {
  if (['3–4 years', '4–6 years', '5–6 years'].includes(age_group)) return 'early'
  if (['7–9 years'].includes(age_group)) return 'young'
  if (['10–12 years'].includes(age_group)) return 'junior'
  return 'teen'
}

function buildPrompt(params: {
  subject: string
  title: string
  age_group: string
  city: string
  country: string
  curriculum: string
  learn_style: string
  language_learning: string
  interests: string[]
  recent_topics: string[]
  reading_level: string
  focus_time: string
}): string {
  const {
    subject, title, age_group, city, country,
    curriculum, learn_style, language_learning,
    interests, recent_topics, reading_level, focus_time,
  } = params

  const tier = getAgeTier(age_group)
  const interestsStr = Array.isArray(interests) && interests.length ? interests.join(', ') : 'general curiosity'
  const recentStr = Array.isArray(recent_topics) && recent_topics.length
    ? `Avoid repeating: ${recent_topics.slice(0, 3).join(', ')}.` : ''
  const langStr = language_learning && language_learning !== 'None'
    ? `Include 1 ${language_learning} word naturally in context.` : ''

  const focusTime = focus_time === '15min' ? '10-15 min' : focus_time === '60min' ? '45-55 min' : '20-30 min'

  const context = `LESSON: "${title}" (${subject}) | ${age_group} | ${city}, ${country}
INTERESTS: ${interestsStr} | PHILOSOPHY: ${curriculum} | STYLE: ${learn_style} | READING: ${reading_level} | TIME: ${focusTime}
${recentStr} ${langStr}
Rules: Reference ${city} or ${country} in one example. Connect to one interest. Address child as "you".`

  const base = (tierNote: string, extraFields: string) => `You are an expert educator. Return ONLY valid JSON — no markdown, no extra text.

${context}
${tierNote}

OUTPUT this exact JSON (all fields required):
{
  "reading_title": "Specific, engaging title",
  "introduction": "2-3 sentences opening. Set scene in ${city} or connect to their interests.",
  "story": "2-3 sentences of vivid context — a real event, place, or person. Be specific.",
  "main_content": "3 short paragraphs separated by \\n\\n. Each paragraph 1-2 sentences. Key facts and ideas for this age.",
  "activity": {
    "title": "Action-based name",
    "materials": "Common items or 'No materials needed'",
    "time": "${focusTime}",
    "description": "3 numbered steps. Clear outcome at the end."
  },
  "discussion_questions": ["One open question connecting topic to their life or interests"],
  "fun_fact": "One surprising fact in 1-2 sentences.",
  "quiz": [
    { "question": "Question on main concept", "options": ["Wrong", "Correct answer", "Wrong"], "correct": 1 },
    { "question": "Second question", "options": ["Correct answer", "Wrong", "Wrong"], "correct": 0 }
  ],
  "parent_tip": "One practical sentence for the parent."${extraFields}
}`

  if (tier === 'early') {
    return base(
      'Simple language. Short sentences. Concrete comparisons. Make it feel magical, not like schoolwork.',
      `,\n  "rhyme": "4-line rhyme or chant to remember the key concept. Catchy and rhythmic."`
    )
  }

  if (tier === 'young') {
    return base(
      'Enthusiastic, clear language. WOW-facts. Define new vocabulary inline.',
      ''
    )
  }

  if (tier === 'junior') {
    return base(
      'Intellectually challenging. Use proper subject terminology, defined inline. Multiple ideas in tension.',
      `,\n  "vocabulary": [
    { "word": "Key term 1", "definition": "Clear definition" },
    { "word": "Key term 2", "definition": "Clear definition" }
  ],\n  "perspectives": "Two viewpoints on a contested aspect. 2-3 sentences each. End with: 'Which do you find more convincing?'",\n  "research_prompt": "One specific research question requiring further investigation."`
    )
  }

  // teen
  return base(
    'Academic tone. Near GCSE level. Precise terminology. Real thinkers, events, institutions.',
    `,\n  "vocabulary": [
    { "word": "Academic term 1", "definition": "Precise definition" },
    { "word": "Academic term 2", "definition": "Precise definition" }
  ],\n  "perspectives": "Two scholarly viewpoints. 2-3 sentences each. End with a challenge to write a paragraph defending one.",\n  "essay_prompt": "One debatable essay question with brief guidance on what a strong argument includes.",\n  "socratic_questions": ["One deep philosophical question with no easy answer."],\n  "further_reading": ["One specific book or documentary — title, author/creator, one sentence why it is relevant."]`
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = buildPrompt(body)

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error: any) {
    console.error('Generate lesson error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
