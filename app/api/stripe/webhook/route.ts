import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

async function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function updateByUserId(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  userId: string,
  fields: Record<string, unknown>,
  context: string
): Promise<boolean> {
  const { error } = await supabase.from('profiles').update(fields).eq('id', userId)
  if (error) { console.error(`[webhook] Supabase error (${context}):`, error); return false }
  return true
}

async function updateByCustomerId(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  customerId: string,
  fields: Record<string, unknown>,
  context: string
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('stripe_customer_id', customerId)
  if (error) { console.error(`[webhook] Supabase error (${context}):`, error); return false }
  return true
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET ?? '').trim()
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = await getSupabase()
  console.log('[webhook] Received event:', event.type)

  // ── checkout.session.completed ────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    if (!userId) {
      console.error('[webhook] checkout.session.completed missing user_id in metadata')
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    }
    const children = parseInt(session.metadata?.children || '1')
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      subscription_status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string ?? null,
      children_count: children,
    }, { onConflict: 'id' })
    if (error) {
      console.error('[webhook] Supabase error (checkout.session.completed):', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  // ── customer.subscription.updated ────────────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (userId) {
      const status = sub.status === 'active' ? 'active' : 'expired'
      const ok = await updateByUserId(supabase, userId, { subscription_status: status }, event.type)
      if (!ok) return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  // ── customer.subscription.deleted ────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (userId) {
      const ok = await updateByUserId(supabase, userId, { subscription_status: 'expired' }, event.type)
      if (!ok) return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  // ── invoice.paid ─────────────────────────────────────────────────────────
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string
    if (customerId) {
      const ok = await updateByCustomerId(supabase, customerId, { subscription_status: 'active' }, event.type)
      if (!ok) return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  // ── invoice.payment_failed ────────────────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string
    if (customerId) {
      const ok = await updateByCustomerId(supabase, customerId, { subscription_status: 'past_due' }, event.type)
      if (!ok) return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
