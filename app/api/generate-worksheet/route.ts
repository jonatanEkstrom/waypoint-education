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

    const prompt = `Create a fully interactive fun worksheet as a complete HTML page with JavaScript.

Child name: ${name}
Age: ${age_group}
Subject: ${subject}
Theme: ${theme || subject}
City: ${city}

IMPORTANT: Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no backticks, no explanation.

Use accent color: ${colors.accent} and light color: ${colors.light}

The worksheet MUST include ALL of these interactive sections:

1. HEADER: Colorful title with emoji, child name "${name}" pre-filled, date input field

2. MATCHING EXERCISE: 
- Show 5 items in LEFT column and 5 items in RIGHT column (shuffled)
- User clicks one item on left (it highlights), then clicks matching item on right
- If correct: both turn green with checkmark
- If wrong: both flash red briefly then reset
- Use JavaScript click handlers for this
- Items must be clearly styled as clickable buttons

3. FILL IN THE BLANK:
- 5 sentences with <input> fields inline where the blank should be
- Each input styled with border-bottom only, no box
- A "Check answers" button that highlights correct answers green and wrong ones red

4. TRUE OR FALSE:
- 5 statements, each with two clickable buttons "TRUE" and "FALSE"
- Clicking selects it (highlighted), clicking Check shows correct/wrong

5. SHORT ANSWER:
- 2 open questions with <textarea> fields to type in

6. SCORE & CELEBRATION:
- "Check my score!" button that counts correct answers across all exercises
- Shows fun emoji celebration message based on score
- 5 star icons that fill in based on score

All JavaScript must be inline in <script> tags. Make it colorful, fun and age-appropriate for ${age_group}. White background for printing. Minimum font size 15px.`

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