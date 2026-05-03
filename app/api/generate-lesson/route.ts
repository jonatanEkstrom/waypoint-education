import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 30
export const runtime = 'edge'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Returns true when every number in the age_group string falls within [4, 6]
// e.g. "4-6", "Ages 4-6", "5" → true; "5-7", "7-9" → false
function isEarlyChildhood(ageGroup: string): boolean {
  const nums = ageGroup.match(/\d+/g)?.map(Number) ?? []
  return nums.length > 0 && Math.min(...nums) >= 4 && Math.max(...nums) <= 6
}

export async function POST(request: NextRequest) {
  try {
    const {
      subject, title, age_group, city, country, interests,
    } = await request.json()

    const interestsStr = Array.isArray(interests) && interests.length ? interests.join(', ') : 'general curiosity'

    const earlyMathRestriction = subject.toLowerCase().includes('math') && isEarlyChildhood(age_group)
      ? `\nSTRICTLY FORBIDDEN FOR AGES 4-6: multiplication, division, fractions, percentages, algebra. ONLY allowed: counting 1-20, adding small numbers with objects (max sum of 10), basic shapes.\nIMPORTANT: For ages 4-6, NEVER use multiplication, division, algebra, or any abstract mathematical concepts. Only use counting, basic addition with visual aids, and shape recognition. Appropriate topics: counting objects (1-20), simple addition with physical objects (e.g. 2 + 1 = ?), comparing quantities (more/less/same), basic shape recognition, sorting by size or color.\n`
      : ''

    const prompt = `Create a short lesson. Return ONLY valid JSON, no markdown.${earlyMathRestriction}

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
