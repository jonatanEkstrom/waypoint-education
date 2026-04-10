import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    if (userId) {
      const children = parseInt(session.metadata?.children || '1')
      await supabase.from('profiles').upsert({
        id: userId,
        subscription_status: 'trial',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        trial_end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        children_count: children,
      }, { onConflict: 'id' })
    }
  }

  // Trial ended and charge succeeded (status → active), or subscription paused/past_due.
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (userId) {
      if (sub.status === 'active') {
        await supabase.from('profiles').update({
          subscription_status: 'active',
        }).eq('id', userId)
      } else if (sub.status === 'past_due' || sub.status === 'unpaid' || sub.status === 'canceled') {
        await supabase.from('profiles').update({
          subscription_status: 'expired',
        }).eq('id', userId)
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (userId) {
      await supabase.from('profiles').update({
        subscription_status: 'expired',
      }).eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
