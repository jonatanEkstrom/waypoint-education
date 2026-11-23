import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { requireUser, getAccessProfile, hasAccess } from '@/app/lib/server/access'
import { isOfferLive, ensureFirstPeriodCoupon } from '@/app/lib/server/offer'

// Server-side allow-list. The client may only pick a plan, never an arbitrary price.
const PRICES: Record<'monthly' | 'quarterly' | 'yearly', string> = {
  monthly: (process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? 'price_1TM09UF8H8N4qjrrLwmOViS5').trim(),
  quarterly: (process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY ?? 'price_1TM0AJF8H8N4qjrrF9HEjQfb').trim(),
  yearly: (process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ?? 'price_1TM0ApF8H8N4qjrrkunPjBSn').trim(),
}

const EXTRA_CHILD_PRICE: Record<string, { unit_amount: number; interval: 'month' | 'year'; interval_count: number }> = {
  monthly:   { unit_amount: 600,  interval: 'month', interval_count: 1 },
  quarterly: { unit_amount: 1500, interval: 'month', interval_count: 3 },
  yearly:    { unit_amount: 5400, interval: 'year',  interval_count: 1 },
}

const INCLUDED_CHILDREN = 4
const MAX_CHILDREN = 12

export async function POST(req: NextRequest) {
  const guard = await requireUser()
  if ('response' in guard) return guard.response
  const { user, admin } = guard

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const body = await req.json().catch(() => ({}))
    const rawPrice = typeof body.price_id === 'string' ? body.price_id.trim() : ''

    // Resolve the plan from the allow-list (accept either a known price_id or a plan key).
    const billing = (Object.keys(PRICES) as (keyof typeof PRICES)[])
      .find(k => PRICES[k] === rawPrice || (!rawPrice && k === body.billing))
    if (!billing) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    const price_id = PRICES[billing]

    const children = Number.isInteger(body.children) ? body.children : 1
    if (children < 1 || children > MAX_CHILDREN) {
      return NextResponse.json({ error: 'Invalid number of children' }, { status: 400 })
    }

    if (!user.email) return NextResponse.json({ error: 'Account has no email' }, { status: 400 })

    const profile = await getAccessProfile(admin, user.id)
    // Reuse the existing Stripe customer instead of creating duplicates.
    const { data: billingRow } = await admin
      .from('profiles').select('stripe_customer_id, stripe_subscription_id').eq('id', user.id).maybeSingle()
    const base = 'https://www.waypointeducation.world'
    if (billingRow?.stripe_subscription_id && billingRow.stripe_customer_id) {
      const current = await stripe.subscriptions.retrieve(billingRow.stripe_subscription_id)
      if (hasAccess(profile) && profile?.subscription_status === 'active' ||
          !['canceled', 'incomplete_expired'].includes(current.status)) {
        const portal = await stripe.billingPortal.sessions.create({
          customer: billingRow.stripe_customer_id, return_url: `${base}/dashboard/children`,
        })
        return NextResponse.json({ url: portal.url })
      }
    }

    let customerId = billingRow?.stripe_customer_id as string | undefined
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } }, { idempotencyKey: `waypoint-customer-${user.id}` })
      customerId = customer.id
      await admin.from('profiles').upsert({ id: user.id, email: user.email, stripe_customer_id: customerId }, { onConflict: 'id' })
    }

    // Launch offer: 50% off the first invoice for anyone who has never paid.
    const neverPaid = !billingRow?.stripe_subscription_id
    const discounts = isOfferLive() && neverPaid
      ? [{ coupon: await ensureFirstPeriodCoupon(stripe) }]
      : undefined

    const extraChild = EXTRA_CHILD_PRICE[billing]
    const extra = children - INCLUDED_CHILDREN
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      ...(discounts ? { discounts } : {}),
      payment_method_types: ['card'],
      line_items: [
        { price: price_id, quantity: 1 },
        ...(extra > 0 ? [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Extra children (${extra})` },
            unit_amount: extraChild.unit_amount,
            recurring: { interval: extraChild.interval, interval_count: extraChild.interval_count },
          },
          quantity: extra,
        }] : []),
      ],
      subscription_data: {
        metadata: { app: 'waypoint', user_id: user.id, children: String(children), billing },
      },
      metadata: { app: 'waypoint', user_id: user.id, children: String(children), billing },
      success_url: `${base}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/subscribe`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[checkout] error:', err.message)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
