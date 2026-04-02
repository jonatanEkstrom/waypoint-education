import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { price_id, user_id, email } = await req.json()

    if (!price_id || !user_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const customer = await stripe.customers.create({ email, metadata: { user_id } })

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://waypoint-education.vercel.app'
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      subscription_data: {
        trial_period_days: 10,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel',
          },
        },
        metadata: { user_id },
      },
      payment_method_collection: 'always',
      metadata: { user_id },
      success_url: `${base}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
