import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { price_id, user_id, email } = await req.json()

    if (!price_id || !user_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const customer = await stripe.customers.create({ email })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('profiles').upsert({
      id: user_id,
      stripe_customer_id: customer.id,
    })

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://waypoint-education.vercel.app'
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      subscription_data: {
        trial_period_days: 10,
        metadata: { user_id },
      },
      metadata: { user_id },
      success_url: `${base}/dashboard`,
      cancel_url: `${base}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
