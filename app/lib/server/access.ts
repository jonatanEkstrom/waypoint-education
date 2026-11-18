import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const TRIAL_DAYS = 10

/** Service-role client. Server only. Never fall back to the anon key. */
export function adminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** The signed-in user, verified with Supabase Auth from the request cookies. */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Called from a context where cookies are read-only; safe to ignore.
          }
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export type AccessProfile = {
  subscription_status: string | null
  trial_end_date: string | null
  trial_started_at: string | null
}

export function hasAccess(p: AccessProfile | null | undefined): boolean {
  if (!p) return false
  if (p.subscription_status === 'active') return true
  if (p.subscription_status === 'trial') {
    return !!p.trial_end_date && new Date(p.trial_end_date) > new Date()
  }
  return false
}

export async function getAccessProfile(admin: SupabaseClient, userId: string): Promise<AccessProfile | null> {
  const { data } = await admin
    .from('profiles')
    .select('subscription_status, trial_end_date, trial_started_at')
    .eq('id', userId)
    .maybeSingle()
  return data
}

/**
 * Grants the one-time free trial if this account has never had one and has no
 * subscription history. Idempotent. Returns the resulting profile.
 */
export async function ensureTrial(admin: SupabaseClient, user: User): Promise<AccessProfile | null> {
  const existing = await getAccessProfile(admin, user.id)
  const neverTrialed = !existing?.trial_started_at
  const noSubscriptionHistory = !existing?.subscription_status
  if (!neverTrialed || !noSubscriptionHistory) return existing

  const now = new Date()
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
  // Insert only — never overwrite an existing row's status.
  const { error } = existing
    ? await admin.from('profiles')
        .update({ subscription_status: 'trial', trial_started_at: now.toISOString(), trial_end_date: trialEnd.toISOString() })
        .eq('id', user.id)
        .is('trial_started_at', null)
        .is('subscription_status', null)
    : await admin.from('profiles').insert({
        id: user.id,
        email: user.email,
        subscription_status: 'trial',
        trial_started_at: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
      })
  if (error) console.error('[ensureTrial] error:', error.message)
  return getAccessProfile(admin, user.id)
}

/**
 * Verifies a returning Stripe Checkout session server-side and, if it belongs to
 * this user and is paid, marks the profile active (same result the webhook gives).
 */
export async function syncCheckoutSession(admin: SupabaseClient, userId: string, sessionId: string): Promise<boolean> {
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) return false
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paid = session.status === 'complete' && (session.payment_status === 'paid' || session.payment_status === 'no_payment_required')
    if (!paid || session.metadata?.user_id !== userId) return false
    const { error } = await admin.from('profiles').update({
      subscription_status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: (session.subscription as string) ?? null,
    }).eq('id', userId)
    return !error
  } catch (e: any) {
    console.error('[syncCheckoutSession] error:', e.message)
    return false
  }
}

type Guarded = { user: User; admin: SupabaseClient } | { response: NextResponse }

/** For API routes: require a signed-in user with an active subscription or valid trial. */
export async function requireAccess(): Promise<Guarded> {
  const user = await getSessionUser()
  if (!user) return { response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }
  const admin = adminClient()
  const profile = await getAccessProfile(admin, user.id)
  if (!hasAccess(profile)) {
    return { response: NextResponse.json({ error: 'subscription_required' }, { status: 402 }) }
  }
  return { user, admin }
}

/** For API routes that only need a signed-in user (billing, trial start). */
export async function requireUser(): Promise<Guarded> {
  const user = await getSessionUser()
  if (!user) return { response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) }
  return { user, admin: adminClient() }
}
