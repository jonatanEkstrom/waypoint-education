import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { subject, theme, age_group, name, city } = await request.json()

    const subjectColors: any = {
      'Math': { bg: '#F0FDFA', accent: '#0D9488', light: '#CCFBF1' },
      'Science': { bg: '#F0FDF4', accent: '#059669', light: '#BBF7D0' },
      'Language Arts': { bg: '#FFFBEB', accent: '#D97706', light: '#FDE68A' },
      'History': { bg: '#F5F3FF', accent: '#7C3AED', light: '#DDD6FE' },
      'Geography': { bg: '#EFF6FF', accent: '#2563EB', light: '#BFDBFE' },
      'Art': { bg: '#FDF2F8', accent: '#DB2777', light: '#FBCFE8' },
      'Music': { bg: '#FFF7ED', accent: '#EA580C', light: '#FED7AA' },
      'Physical Education': { bg: '#F0FDF4', accent: '#16A34A', light: '#BBF7D0' },
      'Coding': { bg: '#F0F9FF', accent: '#0891B2', light: '#BAE6FD' },
      'Life Skills': { bg: '#F7FEE7', accent: '#65A30D', light: '#D9F99D' },
    }

    const colors = subjectColors[subject] || { bg: '#F8F6FF', accent: '#635BFF', light: '#E8E6FF' }

    const prompt = `Create a fun, colorful worksheet for a child.

Child: ${name}, ${age_group}, currently in ${city}
Subject: ${subject}
Theme: ${theme || subject}

Generate a complete HTML worksheet. Requirements:
- Colorful and fun design using these colors: background ${colors.bg}, accent ${colors.accent}, light ${colors.light}
- Age-appropriate for ${age_group}
- Include the child's name "${name}" and a date line at the top
- Include a fun emoji title related to ${theme || subject}
- 4-6 varied exercises (mix of: fill in the blank, draw & label, match the pairs, short answer, circle the correct answer, true/false)
- Each exercise clearly numbered with fun icons
- Blank lines or boxes for answers
- A "Great job!" encouragement section at the bottom with stars to color in
- Connected to ${city} or the theme "${theme || subject}" where possible
- Print-friendly but visually engaging

Return ONLY the complete HTML with inline CSS. No explanations. Start with <!DOCTYPE html>`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const html = content.text.replace(/```html|```/g, '').trim()

    return NextResponse.json({ html })
  } catch (error: any) {
    console.error('Generate worksheet error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}