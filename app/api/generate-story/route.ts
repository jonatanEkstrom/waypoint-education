import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { keywords, name, city, age_group } = await request.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a short, magical travel journal entry (3-4 sentences) for a child named ${name} (${age_group}) who is in ${city}. 
        
Write it in first person as ${name}. Make it vivid and educational. Use these keywords: ${keywords}.

Return ONLY the journal entry text, nothing else.`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')

    return NextResponse.json({ story: content.text })
  } catch (error: any) {
    console.error('Generate story error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}