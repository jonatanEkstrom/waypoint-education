'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const PRIMARY = '#9B8EC4'
const PRIMARY_DARK = '#7B6BAA'
const PRIMARY_BG = '#F0EBF9'
const PRIMARY_BORDER = '#DDD0F0'
const BEIGE = '#FAF7F2'
const BEIGE_CARD = '#FFFFFF'
const BEIGE_BORDER = '#E8E2D9'
const GREEN = '#A8D5BA'
const GREEN_DARK = '#6AAF8A'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

const PLANS = [
  {
    key: 'monthly',
    label: 'Monthly',
    price: '€11',
    sub: 'per month',
    billed: 'Billed monthly',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? 'price_1TJaFcF8H8N4qjrrCXM9tMaB',
    badge: null,
    highlight: false,
  },
  {
    key: 'quarterly',
    label: 'Quarterly',
    price: '€29',
    sub: 'per quarter',
    billed: 'Billed €29 every 3 months',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY ?? 'price_1TJaIjF8H8N4qjrrOzkaYY5y',
    badge: 'Save 12%',
    highlight: true,
  },
  {
    key: 'yearly',
    label: 'Yearly',
    price: '€99',
    sub: 'per year',
    billed: 'Billed €99/year',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ?? 'price_1TJaLFF8H8N4qjrrl8lUwbPE',
    badge: 'Save 25%',
    highlight: false,
  },
]

const FEATURES = [
  'AI-generated weekly lesson plans',
  'Interactive worksheets with AI grading',
  'Travel journal',
  'Works in every country & city',
  'Ages 4–18 supported',
  '6 teaching philosophies',
  'Up to 4 children included',
  'Cancel anytime',
]

export default function SubscribePage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function subscribe(priceId: string, planKey: string) {
    setLoading(planKey)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth?returnTo=/subscribe')
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId, user_id: user.id, email: user.email, billing: planKey }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else console.error('[subscribe] checkout error:', data.error)
    } finally {
      setLoading(null)
    }
  }

  const btn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer',
  })

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: TEXT, background: BEIGE }}>

      {/* Nav */}
      <nav style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Link href="/landing" style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 20, fontWeight: 700, color: TEXT, textDecoration: 'none' }}>
          🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span>
        </Link>
        <button
          onClick={() => router.push('/auth')}
          onMouseEnter={() => setHover('signin')} onMouseLeave={() => setHover(null)}
          style={btn('signin', { padding: isMobile ? '7px 12px' : '8px 18px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY })}>
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, #EDF7F2 50%, #FFF8EC 100%)`, padding: isMobile ? '48px 16px 40px' : '72px 24px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BEIGE_CARD, color: TEXT_MUTED, padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 24, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: 16 }}>⏰</span> Your 10-day free trial has ended
        </div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 28 : 44, lineHeight: 1.15, marginBottom: 16, color: TEXT }}>
          Keep the adventure going.
        </h1>
        <p style={{ fontSize: isMobile ? 15 : 18, color: TEXT_MUTED, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
          Choose a plan to continue learning. All plans include the full Waypoint experience — lesson plans, worksheets, journal, and up to 4 children.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: isMobile ? '32px 16px 64px' : '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.key} style={{
              background: BEIGE_CARD,
              borderRadius: 24,
              padding: isMobile ? 24 : 32,
              border: `2px solid ${plan.highlight ? PRIMARY : BEIGE_BORDER}`,
              boxShadow: plan.highlight ? '0 8px 32px rgba(155,142,196,0.16)' : '0 2px 10px rgba(0,0,0,0.04)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column' as const,
            }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, right: 20, background: plan.highlight ? PRIMARY : GREEN_DARK, color: 'white', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                  {plan.badge}
                </div>
              )}
              {plan.highlight && (
                <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>
                  Most popular
                </div>
              )}
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{plan.label}</div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontFamily: 'Georgia,serif', fontSize: 40, fontWeight: 700, color: TEXT }}>{plan.price}</span>
                <span style={{ color: TEXT_MUTED, fontSize: 14 }}> {plan.sub}</span>
              </div>
              <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 20 }}>{plan.billed}</div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', flex: 1 }}>
                {FEATURES.map(f => (
                  <li key={f} style={{ padding: '7px 0', fontSize: 13, color: TEXT, display: 'flex', gap: 8, alignItems: 'flex-start', borderBottom: `1px solid ${BEIGE_BORDER}` }}>
                    <span style={{ color: GREEN_DARK, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(plan.priceId, plan.key)}
                disabled={loading !== null}
                onMouseEnter={() => setHover(`plan-${plan.key}`)} onMouseLeave={() => setHover(null)}
                style={btn(`plan-${plan.key}`,
                  { width: '100%', padding: '14px', borderRadius: 100, border: 'none', background: plan.highlight ? PRIMARY : BEIGE_BORDER, color: plan.highlight ? 'white' : TEXT, fontSize: 14, fontWeight: 800, fontFamily: 'inherit', opacity: loading !== null ? 0.7 : 1, cursor: loading !== null ? 'wait' as const : 'pointer' },
                  { background: plan.highlight ? PRIMARY_DARK : '#d5cdc3' }
                )}>
                {loading === plan.key ? 'Redirecting...' : 'Subscribe →'}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: TEXT_MUTED, marginTop: 28, fontWeight: 600 }}>
          Secure payment via Stripe · Cancel anytime
        </p>
      </div>

      {/* Footer */}
      <div style={{ background: TEXT, padding: '28px 24px', textAlign: 'center' as const }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: 'white' }}>
          🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span>
        </span>
        <p style={{ color: '#9E9188', fontSize: 13, marginTop: 8, marginBottom: 12 }}>© 2026 Waypoint Education · The world is their classroom.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
