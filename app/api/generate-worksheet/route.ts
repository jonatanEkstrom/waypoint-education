import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { subject, theme, age_group, name, city } = await request.json()

    const prompt = `Create worksheet content for a child. Return ONLY valid JSON, no other text.

Child: ${name}, ${age_group}, in ${city}
Subject: ${subject}
Theme: ${theme || subject}

Return this exact JSON structure:
{
  "title": "Fun worksheet title with emoji",
  "subtitle": "One fun subtitle line connecting to ${city}",
  "matching": {
    "instruction": "Match each item on the left with the correct answer on the right!",
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
    "instruction": "Is it True or False?",
    "statements": [
      { "text": "statement 1", "answer": true },
      { "text": "statement 2", "answer": false },
      { "text": "statement 3", "answer": true },
      { "text": "statement 4", "answer": false },
      { "text": "statement 5", "answer": true }
    ]
  },
  "shortanswer": {
    "instruction": "Answer these questions!",
    "questions": [
      "Question 1?",
      "Question 2?"
    ]
  }
}

Make all content fun, educational and age-appropriate for ${age_group}. Connect to ${theme || subject} and ${city} where possible.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
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