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
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_end_date')
    .eq('id', user.id)
    .single()

  // No profile row yet → new user, allow through
  if (!profile) return res

  const { subscription_status, trial_end_date } = profile

  if (subscription_status === 'active') return res

  if (subscription_status === 'expired') {
    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  if (subscription_status === 'trial') {
    if (trial_end_date && new Date() > new Date(trial_end_date)) {
      return NextResponse.redirect(new URL('/pricing', req.url))
    }
    return res
  }

  // Unknown/null status → allow through (covers new users before migration runs)
  return res
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
