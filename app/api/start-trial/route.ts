import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireUser, ensureTrial } from '@/app/lib/server/access'

const resend = new Resend(process.env.RESEND_API_KEY)

// Starts the one-time free trial for the signed-in user. The user id and email
// come from the verified session, never from the request body.
export async function POST() {
  const guard = await requireUser()
  if ('response' in guard) return guard.response
  const { user, admin } = guard

  try {
    const before = await admin.from('profiles').select('trial_started_at').eq('id', user.id).maybeSingle()
    const profile = await ensureTrial(admin, user)
    const started = !before.data?.trial_started_at && !!profile?.trial_started_at

    if (started) {
      await resend.emails.send({
        from: 'Waypoint Education <noreply@waypointeducation.world>',
        to: 'jonatan.ekstrom@gmail.com',
        subject: 'New Waypoint trial started',
        html: `<p>A new trial has started.</p><p><strong>User:</strong> ${user.email}</p><p><strong>Trial ends:</strong> ${profile?.trial_end_date}</p>`,
      }).catch(e => console.error('[start-trial] notify failed:', e.message))
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[start-trial] error:', err.message)
    return NextResponse.json({ error: 'Could not start trial' }, { status: 500 })
  }
}
