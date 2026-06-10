import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { user_id, email } = await req.json()
    if (!user_id || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: existing } = await supabase
      .from('profiles')
      .select('trial_started_at')
      .eq('id', user_id)
      .single()

    // Only grant a trial if they've never had one
    if (!existing?.trial_started_at) {
      const trialEndDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase.from('profiles').upsert({
        id: user_id,
        email,
        subscription_status: 'trial',
        trial_started_at: new Date().toISOString(),
        trial_end_date: trialEndDate,
      }, { onConflict: 'id' })
      if (error) {
        console.error('[start-trial] upsert error:', error)
      } else {
        await resend.emails.send({
          from: 'Waypoint Education <noreply@waypointeducation.world>',
          to: 'jonatan.ekstrom@gmail.com',
          subject: 'New Waypoint trial started',
          html: `<p>A new trial has started.</p><p><strong>User:</strong> ${email}</p><p><strong>Trial ends:</strong> ${trialEndDate}</p>`,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[start-trial] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
