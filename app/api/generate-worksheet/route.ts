import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { subject, theme, age_group, name, city } = await request.json()

    const subjectColors: any = {
      'Math': { accent: '#0D9488', light: '#CCFBF1' },
      'Science': { accent: '#059669', light: '#BBF7D0' },
      'Language Arts': { accent: '#D97706', light: '#FDE68A' },
      'History': { accent: '#7C3AED', light: '#DDD6FE' },
      'Geography': { accent: '#2563EB', light: '#BFDBFE' },
      'Art': { accent: '#DB2777', light: '#FBCFE8' },
      'Music': { accent: '#EA580C', light: '#FED7AA' },
      'Physical Education': { accent: '#16A34A', light: '#BBF7D0' },
      'Coding': { accent: '#0891B2', light: '#BAE6FD' },
      'Life Skills': { accent: '#65A30D', light: '#D9F99D' },
    }

    const colors = subjectColors[subject] || { accent: '#635BFF', light: '#E8E6FF' }

    const prompt = `Create a fun printable worksheet as a complete HTML page.

Child name: ${name}
Age: ${age_group}
Subject: ${subject}
Theme: ${theme || subject}
City: ${city}

IMPORTANT: Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no backticks, no explanation.

The worksheet must include ALL of these sections with FULL content:

1. A colorful header with title, child name field, date field
2. Exercise 1: Match the pairs (list 5 word pairs with lines to draw between them)
3. Exercise 2: Fill in the blank (5 sentences with blanks)
4. Exercise 3: True or False (5 statements)
5. Exercise 4: Short answer question (2-3 questions with lines to write on)
6. A "Great job!" section with 5 empty stars to color in

Use these colors: accent color ${colors.accent}, light color ${colors.light}
Make it fun, age-appropriate for ${age_group}, and connect content to ${theme || subject} and ${city}.

Use only inline CSS. Make it print-friendly with white background. Font size minimum 14px. Plenty of space for writing answers.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    let html = content.text.trim()
    html = html.replace(/```html/g, '').replace(/```/g, '').trim()

    if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
      throw new Error('Invalid HTML response')
    }

    return NextResponse.json({ html })
  } catch (error: any) {
    console.error('Generate worksheet error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}