import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireUser } from '@/app/lib/server/access'

export async function POST(req: NextRequest) {
  const guard = await requireUser()
  if ('response' in guard) return guard.response
  const { user, admin } = guard

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    let customerId: string | null = profile?.stripe_customer_id ?? null

    // Fall back to Stripe metadata lookup. user.id is a server-verified UUID.
    if (!customerId) {
      const results = await stripe.customers.search({
        query: `metadata["user_id"]:"${user.id}"`,
        limit: 10,
      })
      customerId = results.data.find(c => !c.deleted)?.id ?? null
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer found for this user' }, { status: 404 })
    }

    const base = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.waypointeducation.world'
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[portal] error:', err.message)
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 500 })
  }
}
