import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { rating, message, page } = await request.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Waypoint Feedback <onboarding@resend.dev>',
        to: process.env.FEEDBACK_EMAIL,
        subject: `⭐ ${rating}/5 — New feedback from Waypoint`,
        html: `
          <h2>New feedback received</h2>
          <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
          <p><strong>Page:</strong> ${page || 'unknown'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      })
    })

    if (!res.ok) throw new Error('Failed to send email')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}