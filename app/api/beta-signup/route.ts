import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Waypoint Education <onboarding@resend.dev>',
        to: process.env.FEEDBACK_EMAIL,
        subject: '🎉 New beta signup — Waypoint Education',
        html: `<h2>New beta signup!</h2><p><strong>Email:</strong> ${email}</p>`
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
