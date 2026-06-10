import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, trial_end_date')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/pricing', request.url))
  }

  if (profile.subscription_status === 'trial') {
    const trialExpired =
      !profile.trial_end_date ||
      new Date(profile.trial_end_date) < new Date()

    if (trialExpired) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/journal/:path*',
    '/la-report/:path*',
    '/little-readers/:path*',
    '/onboarding/:path*',
    '/portfolio/:path*',
    '/practice/:path*',
    '/worksheets/:path*',
    '/community/:path*',
  ],
}
