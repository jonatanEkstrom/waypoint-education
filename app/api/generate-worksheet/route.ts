import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { subject, theme, age_group, name, city } = await request.json()

    const difficultyGuide: Record<string, string> = {
      '4–6 years': 'Very simple. Single words, counting to 10, basic colors and shapes. Like kindergarten.',
      '7–9 years': 'Simple sentences, basic math (addition/subtraction), simple science facts.',
      '10–12 years': 'Intermediate. Multiplication, paragraphs, cause and effect, basic history.',
      '13–15 years': 'Advanced. Algebra concepts, essay-style answers, analysis, historical context, scientific method.',
      '16–18 years': 'University prep level. Critical thinking, debate-style questions, complex analysis, advanced concepts, real-world applications. No basic questions.',
    }

    const difficulty = difficultyGuide[age_group] || difficultyGuide['10–12 years']

    const prompt = `Create a worksheet for ${name}, ${age_group}, in ${city}.
Subject: ${subject}
Theme: ${theme || subject}

DIFFICULTY LEVEL FOR ${age_group}: ${difficulty}

STRICT RULE: This student is ${age_group}. Every single question must match this exact difficulty. Do NOT use simple or basic questions for older students.

Return ONLY valid JSON, no other text:
{
  "title": "Engaging worksheet title with emoji",
  "subtitle": "One subtitle connecting to ${city}",
  "matching": {
    "instruction": "Match each item with the correct answer!",
    "pairs": [
      { "left": "item 1", "right": "answer 1" },
      { "left": "item 2", "right": "answer 2" },
      { "left": "item 3", "right": "answer 3" },
      { "left": "item 4", "right": "answer 4" },
      { "left": "item 5", "right": "answer 5" }
    ]
  },
  "fillblank": {
    "instruction": "Fill in the missing word!",
    "sentences": [
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" },
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" },
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" },
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" },
      { "before": "text before blank", "answer": "missing word", "after": "text after blank" }
    ]
  },
  "truefalse": {
    "instruction": "True or False?",
    "statements": [
      { "text": "statement 1", "answer": true },
      { "text": "statement 2", "answer": false },
      { "text": "statement 3", "answer": true },
      { "text": "statement 4", "answer": false },
      { "text": "statement 5", "answer": true }
    ]
  },
  "shortanswer": {
    "instruction": "Answer these questions with full sentences!",
    "questions": [
      "Question 1?",
      "Question 2?"
    ]
  }
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const worksheet = JSON.parse(cleaned)

    return NextResponse.json({ worksheet })
  } catch (error: any) {
    console.error('Generate worksheet error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
