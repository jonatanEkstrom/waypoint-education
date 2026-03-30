import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  console.log('[welcome-email] RESEND_API_KEY present:', !!apiKey, '| length:', apiKey?.length ?? 0)

  try {
    const { email } = await request.json()
    console.log('[welcome-email] Sending to:', email)
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const { data, error } = await resend.emails.send({
      from: 'Waypoint Education <noreply@waypointeducation.world>',
      to: email,
      subject: 'Welcome to Waypoint Education 🧭',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:system-ui,sans-serif;color:#2D2D2D">
  <div style="max-width:560px;margin:40px auto;padding:0 16px">

    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:40px;margin-bottom:8px">🧭</div>
      <h1 style="font-family:Georgia,serif;font-size:24px;color:#2D2D2D;margin:0">
        Waypoint <span style="color:#9B8EC4">Education</span>
      </h1>
      <p style="font-size:13px;color:#9E9188;font-weight:600;margin:6px 0 0">The world is their classroom.</p>
    </div>

    <div style="background:#FFFFFF;border-radius:20px;padding:36px;border:2px solid #E8E2D9;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
      <h2 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;color:#2D2D2D">
        You're in! Welcome to the family 🎉
      </h2>
      <p style="font-size:15px;line-height:1.7;color:#2D2D2D;margin:0 0 16px">
        We're so glad you're here. Waypoint was built for families who believe that the best classroom is the world itself — and you're one of the first to join us.
      </p>
      <p style="font-size:15px;line-height:1.7;color:#2D2D2D;margin:0 0 24px">
        Your 30-day free trial starts now. To get your first lesson plan, there's just one thing to do:
      </p>

      <div style="background:#F0EBF9;border-radius:14px;padding:20px 24px;border:1px solid #DDD0F0;margin-bottom:28px">
        <p style="font-size:15px;font-weight:700;color:#9B8EC4;margin:0 0 8px">👉 Add your child's profile</p>
        <p style="font-size:14px;line-height:1.6;color:#2D2D2D;margin:0">
          Tell us your child's age, location, learning style and favourite subjects. Waypoint uses this to generate lesson plans that actually fit your family — not a generic curriculum.
        </p>
      </div>

      <a href="https://waypointeducation.world/dashboard/children"
        style="display:block;text-align:center;background:#9B8EC4;color:white;font-size:15px;font-weight:800;padding:16px 28px;border-radius:100px;text-decoration:none;font-family:inherit">
        Set up your child's profile →
      </a>
    </div>

    <div style="margin-top:28px;background:#FFFFFF;border-radius:20px;padding:24px;border:2px solid #E8E2D9">
      <p style="font-size:14px;font-weight:700;color:#2D2D2D;margin:0 0 12px">What you can do right now:</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          ['🗺️', 'Generate a location-based lesson plan in 30 seconds'],
          ['📄', 'Create printable worksheets your kids will actually enjoy'],
          ['📖', 'Start a travel journal — let AI write the stories from your adventures'],
          ['🧠', 'Run a quick quiz to see what sticks'],
        ].map(([icon, text]) => `
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">${icon}</span>
          <span style="font-size:14px;color:#2D2D2D;line-height:1.5">${text}</span>
        </div>`).join('')}
      </div>
    </div>

    <p style="text-align:center;font-size:13px;color:#9E9188;margin:24px 0 8px;line-height:1.6">
      Questions? Just reply to this email — you're writing directly to the founders.<br/>
      <strong style="color:#2D2D2D">We read every message.</strong>
    </p>

    <p style="text-align:center;font-size:13px;color:#9E9188;margin:0 0 32px">
      © 2026 Waypoint Education ·
      <a href="https://waypointeducation.world/privacy" style="color:#9E9188">Privacy Policy</a> ·
      <a href="https://waypointeducation.world/terms" style="color:#9E9188">Terms of Service</a>
    </p>

  </div>
</body>
</html>`,
    })

    if (error) {
      console.error('[welcome-email] Resend API error:', JSON.stringify(error))
      return NextResponse.json({ error }, { status: 500 })
    }

    console.log('[welcome-email] Sent successfully, id:', data?.id)
    return NextResponse.json({ success: true, id: data?.id })
  } catch (error: any) {
    console.error('[welcome-email] Unexpected error:', error?.message, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
