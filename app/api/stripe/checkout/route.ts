import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const { price_id: raw_price_id, user_id, email, children = 1, billing = 'monthly' } = await req.json()
    const price_id = raw_price_id?.trim()

    if (!price_id || !user_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const EXTRA_CHILD_PRICE: Record<string, { unit_amount: number; interval: 'month' | 'year'; interval_count: number }> = {
      monthly:   { unit_amount: 600,  interval: 'month', interval_count: 1 },
      quarterly: { unit_amount: 1500, interval: 'month', interval_count: 3 },
      yearly:    { unit_amount: 5400, interval: 'year',  interval_count: 1 },
    }
    const extraChild = EXTRA_CHILD_PRICE[billing] ?? EXTRA_CHILD_PRICE.monthly

    const customer = await stripe.customers.create({ email, metadata: { user_id } })

    const base = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://waypoint-education.vercel.app'
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        { price: price_id, quantity: 1 },
        ...(children > 4 ? [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Extra children (${children - 4})` },
            unit_amount: extraChild.unit_amount,
            recurring: { interval: extraChild.interval, interval_count: extraChild.interval_count },
          },
          quantity: children - 4,
        }] : []),
      ],
      subscription_data: {
        metadata: { user_id, children: String(children), billing },
      },
      metadata: { user_id, children: String(children), billing },
      success_url: `${base}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/subscribe`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[checkout] error:', err.message, err.raw ?? '')
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
