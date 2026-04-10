import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_ROUTES = ['/dashboard', '/onboarding', '/worksheets', '/journal', '/community']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  if (!isProtected) return NextResponse.next()

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const loginUrl = new URL('/auth', req.url)
    loginUrl.searchParams.set('returnTo', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Just completed Stripe checkout — profile write may not have propagated yet.
  // Allow access so the dashboard can handle post-checkout state.
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (sessionId && (sessionId.startsWith('cs_live_') || sessionId.startsWith('cs_test_'))) {
    return res
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_end_date, stripe_customer_id')
    .eq('id', user.id)
    .single()

  // No profile row → send to pricing
  if (!profile) {
    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  const { subscription_status, trial_end_date, stripe_customer_id } = profile

  // Paid and active
  if (subscription_status === 'active') return res

  // Trial: card must be on file AND trial must not have expired
  if (subscription_status === 'trial') {
    const cardOnFile = !!stripe_customer_id
    const trialValid = trial_end_date ? new Date() < new Date(trial_end_date) : false
    if (cardOnFile && trialValid) return res
    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  // Expired or any other status
  return NextResponse.redirect(new URL('/pricing', req.url))
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/worksheets/:path*',
    '/journal/:path*',
    '/community/:path*',
  ],
}
