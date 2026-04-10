import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const { user_id } = await req.json()

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Try profile first
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user_id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Fall back to searching Stripe by user_id metadata
    if (!customerId) {
      const results = await stripe.customers.search({
        query: `metadata["user_id"]:"${user_id}"`,
        limit: 10,
      })
      // Pick the customer that has an active subscription, or just the most recent one
      const withSub = results.data.find(c => !c.deleted)
      customerId = withSub?.id ?? null
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer found for this user' }, { status: 404 })
    }

    const base = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://waypoint-education.vercel.app'
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[portal] error:', err.message, err.raw ?? '')
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
