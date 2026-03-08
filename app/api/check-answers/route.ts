import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { questions, age_group, subject } = await request.json()

    const prompt = `You are a kind, encouraging teacher grading a child's answers.

Subject: ${subject}
Child age: ${age_group}

Grade these short answer questions. Return ONLY valid JSON, no other text.

Questions and answers:
${questions.map((q: any, i: number) => `${i + 1}. Question: ${q.question}\nAnswer: ${q.answer}`).join('\n\n')}

Return this exact JSON:
{
  "feedback": [
    {
      "correct": true,
      "explanation": "Great job! [brief encouraging explanation of why it's correct]"
    },
    {
      "correct": false,
      "explanation": "Good try! The answer is [correct answer]. [brief friendly explanation]"
    }
  ]
}

Be encouraging and age-appropriate for ${age_group}. If the answer is partially correct, mark it as correct and praise what they got right. If the answer is blank or completely wrong, mark as incorrect with a helpful hint.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Check answers error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}