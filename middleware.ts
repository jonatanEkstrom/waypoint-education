import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const AUTH_ONLY_ROUTES = ['/little-readers']
const PROTECTED_ROUTES = ['/dashboard', '/onboarding', '/worksheets', '/journal', '/community', '/practice']
const TRIAL_DAYS = 10

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAuthOnly = AUTH_ONLY_ROUTES.some(r => pathname.startsWith(r))
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  if (!isAuthOnly && !isProtected) return NextResponse.next()

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

  // Auth-only routes — no subscription check needed
  if (isAuthOnly) return res

  // Allow through immediately after a Stripe checkout redirect so the
  // dashboard can handle the session before the webhook has propagated.
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (sessionId && (sessionId.startsWith('cs_live_') || sessionId.startsWith('cs_test_'))) {
    return res
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_started_at')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/subscribe', req.url))
  }

  const { subscription_status, trial_started_at } = profile

  // Paid subscriber — always allow
  if (subscription_status === 'active') return res

  // Trial — allow if started less than TRIAL_DAYS ago
  if (trial_started_at) {
    const trialStart = new Date(trial_started_at)
    const trialEnd = new Date(trialStart.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    if (new Date() < trialEnd) return res
  }

  return NextResponse.redirect(new URL('/subscribe', req.url))
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/worksheets/:path*',
    '/journal/:path*',
    '/community/:path*',
    '/little-readers/:path*',
    '/practice/:path*',
  ],
}
