import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_IDS = {
  monthly: 'price_1TJaFcF8H8N4qjrrCXM9tMaB',
  quarterly: 'price_1TJaIjF8H8N4qjrrOzkaYY5y',
  yearly: 'price_1TJaLFF8H8N4qjrrI8IUwbPE',
}

export async function POST(req: NextRequest) {
  try {
    const { billing, children, userId, email } = await req.json()

    const priceId = PRICE_IDS[billing as keyof typeof PRICE_IDS]
    if (!priceId) return NextResponse.json({ error: 'Invalid billing' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        { price: priceId, quantity: 1 },
        ...(children > 1 ? [{
          price_data: {
            currency: 'usd',
            product_data: { name: `Extra children (${children - 1})` },
            unit_amount: 600,
            recurring: { interval: 'month' as const, interval_count: billing === 'quarterly' ? 3 : 1 },
          },
          quantity: children - 1,
        }] : []),
      ],
      subscription_data: {
        trial_period_days: 10,
        metadata: { userId, children: String(children), billing },
      },
      metadata: { userId, children: String(children), billing },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://waypoint-education.vercel.app'}/onboarding?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://waypoint-education.vercel.app'}/landing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}