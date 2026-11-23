import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { adminClient } from '@/app/lib/server/access'
import { fulfillWaypointCheckout, isWaypointBilling, syncWaypointSubscription } from '@/app/lib/server/stripe-access'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const signature = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!secret) return NextResponse.json({ error: 'webhook_not_configured' }, { status: 500 })
  if (!signature) return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret)
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  const admin = adminClient()
  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object
        if (session.metadata?.user_id && isWaypointBilling(session.metadata)) {
          await fulfillWaypointCheckout(admin, stripe, session, session.metadata.user_id)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        if (isWaypointBilling(subscription.metadata)) {
          await syncWaypointSubscription(admin, stripe, subscription.id)
        }
        break
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const legacyInvoice = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
        const reference = invoice.parent?.subscription_details?.subscription ?? legacyInvoice.subscription
        const subscriptionId = typeof reference === 'string' ? reference : reference?.id
        if (subscriptionId) await syncWaypointSubscription(admin, stripe, subscriptionId)
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[stripe webhook] sync failed:', event.type, error instanceof Error ? error.name : 'DatabaseError')
    return NextResponse.json({ error: 'billing_sync_failed' }, { status: 500 })
  }
}
