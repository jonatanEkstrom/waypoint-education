import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { adminClient, ensureTrial, hasAccess, syncCheckoutSession } from './app/lib/server/access'

const AUTH_ONLY_ROUTES: string[] = []
const PROTECTED_ROUTES = ['/dashboard', '/onboarding', '/worksheets', '/journal', '/community', '/practice', '/little-readers']

export async function proxy(req: NextRequest) {
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

  const admin = adminClient()

  // Returning from Stripe Checkout: verify the session with Stripe before
  // granting access. The webhook may not have arrived yet.
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (sessionId && await syncCheckoutSession(admin, user.id, sessionId)) {
    return res
  }

  // New accounts get the one-time trial here, so it does not depend on the
  // client calling /api/start-trial (which fails when email confirmation is on).
  const profile = await ensureTrial(admin, user)

  if (hasAccess(profile)) return res

  if (profile?.subscription_status === 'trial') {
    return NextResponse.redirect(new URL('/pricing', req.url))
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
