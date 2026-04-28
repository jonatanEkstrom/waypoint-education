import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 30
export const runtime = 'edge'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const {
      subject, title, age_group, city, country, interests,
    } = await request.json()

    const interestsStr = Array.isArray(interests) && interests.length ? interests.join(', ') : 'general curiosity'

    const prompt = `Create a short lesson. Return ONLY valid JSON, no markdown.

LESSON: "${title}" (${subject}) | ${age_group} | ${city}, ${country} | Interests: ${interestsStr}

OUTPUT this exact JSON:
{
  "reading_title": "Specific lesson title",
  "introduction": "Exactly 2 sentences introducing the topic. Reference ${city} or one interest.",
  "main_content": "Point 1 in 1 sentence.\\n\\nPoint 2 in 1 sentence.\\n\\nPoint 3 in 1 sentence.",
  "activity": {
    "title": "Activity name",
    "materials": "Materials or 'None needed'",
    "time": "10-15 min",
    "description": "3-4 sentences describing what to do."
  },
  "discussion_questions": ["One open-ended question about the topic."],
  "fun_fact": "One surprising fact in 1 sentence.",
  "parent_tip": "One practical tip for the parent."
}`

    const stream = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
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
