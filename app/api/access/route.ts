import { NextResponse } from 'next/server'
import { adminClient, getAccessProfile, getSessionUser, hasAccess } from '@/app/lib/server/access'

export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store' }
  const user = await getSessionUser()
  if (!user) return NextResponse.json({}, { status: 401, headers })

  const profile = await getAccessProfile(adminClient(), user.id)
  if (!hasAccess(profile)) return NextResponse.json({}, { status: 402, headers })

  return NextResponse.json({
    trialEndsAt: profile?.subscription_status === 'trial' ? profile.trial_end_date : null,
  }, { headers })
}
