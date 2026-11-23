import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// The Stripe account is shared by several apps. Older Waypoint objects used
// the same billing keys without an explicit app tag.
export function isWaypointBilling(metadata: Stripe.Metadata | null | undefined) {
  if (!metadata) return false
  return metadata.app ? metadata.app === 'waypoint' :
    !!metadata.user_id && ['monthly', 'quarterly', 'yearly'].includes(metadata.billing ?? '')
}

export function stripeAccessStatus(status: Stripe.Subscription.Status) {
  if (status === 'active' || status === 'trialing') return 'active'
  if (status === 'past_due') return 'past_due'
  return 'expired'
}

function subscriptionFields(subscription: Stripe.Subscription) {
  const status = stripeAccessStatus(subscription.status)
  const periodEnd = Math.max(0, ...subscription.items.data.map(item => item.current_period_end || 0))
  return {
    subscription_status: status,
    billing_access_until: status === 'active' && periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  }
}

export async function fulfillWaypointCheckout(admin: SupabaseClient, stripe: Stripe,
  session: Stripe.Checkout.Session, userId: string) {
  if (!isWaypointBilling(session.metadata) || session.metadata?.user_id !== userId ||
      session.status !== 'complete' || session.mode !== 'subscription' ||
      !['paid', 'no_payment_required'].includes(session.payment_status) ||
      typeof session.subscription !== 'string' || typeof session.customer !== 'string') return false

  const subscription = await stripe.subscriptions.retrieve(session.subscription)
  if (!isWaypointBilling(subscription.metadata) || subscription.metadata.user_id !== userId ||
      stripeAccessStatus(subscription.status) !== 'active') return false

  const { data: profile, error: profileError } = await admin.from('profiles')
    .select('stripe_subscription_id, subscription_status').eq('id', userId).maybeSingle()
  if (profileError) throw profileError

  const current = profile?.stripe_subscription_id
  if (current && current !== subscription.id &&
      ['active', 'past_due'].includes(profile.subscription_status)) {
    // A delayed delivery for a prior checkout cannot replace the current subscription.
    return false
  }

  const parsed = Number(session.metadata?.children)
  const fields = {
    ...subscriptionFields(subscription),
    stripe_customer_id: session.customer,
    stripe_subscription_id: subscription.id,
    children_count: Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed : 4,
  }
  if (!profile) {
    const { error } = await admin.from('profiles').insert({ id: userId, ...fields })
    if (error) throw error
    return true
  }
  const update = admin.from('profiles').update(fields).eq('id', userId)
  const { data, error } = await (current ? update.eq('stripe_subscription_id', current) : update.is('stripe_subscription_id', null))
    .select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Subscription changed during fulfillment')
  return true
}

export async function syncWaypointSubscription(admin: SupabaseClient, stripe: Stripe, subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata.user_id
  if (!userId || !isWaypointBilling(subscription.metadata)) return

  const { error } = await admin.from('profiles').update(subscriptionFields(subscription)).eq('id', userId).eq('stripe_subscription_id', subscription.id)
  if (error) throw error
}
