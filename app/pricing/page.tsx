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
    price: 12.99,
    billing: '/month',
    priceId: 'price_1T95rNLyQuaV8LsEPSQvEQwu',
    badge: null,
    highlight: false,
  },
  {
    key: 'quarterly',
    label: 'Quarterly',
    price: 10.99,
    billing: '/month',
    sub: 'Billed $32.97 every 3 months',
    priceId: 'price_1T95twLyQuaV8LsEI5kT4XM2',
    badge: 'Save 15%',
    highlight: true,
  },
  {
    key: 'yearly',
    label: 'Yearly',
    price: 8.99,
    billing: '/month',
    sub: 'Billed $107.88/year',
    priceId: 'price_1T95smLyQuaV8LsE1f0LketT',
    badge: 'Save 31%',
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
  '10 days free, then $12.99/month',
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function startTrial(priceId: string, planKey: string) {
    setLoading(planKey)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth?returnTo=/pricing`)
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_id: priceId, user_id: user.id, email: user.email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error(data.error)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: TEXT, background: BEIGE }}>

      {/* Nav */}
      <nav style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Link href="/landing" style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 20, fontWeight: 700, color: TEXT, textDecoration: 'none' }}>
          🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span>
        </Link>
        <button onClick={() => router.push('/auth')}
          style={{ padding: isMobile ? '7px 12px' : '8px 20px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit', cursor: 'pointer' }}>
          Sign in
        </button>
      </nav>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, #EDF7F2 50%, #FFF8EC 100%)`, padding: isMobile ? '48px 16px 40px' : '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#EDF7F2', color: GREEN_DARK, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 16, border: `1px solid ${GREEN}` }}>
          🎁 10 days free · Card required · Charged after trial
        </div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 30 : 48, lineHeight: 1.15, marginBottom: 16, color: TEXT }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: isMobile ? 15 : 18, color: TEXT_MUTED, maxWidth: 480, margin: '0 auto' }}>
          Enter your card now — you won't be charged for 10 days. Cancel anytime before the trial ends.
        </p>
      </div>

      {/* Plan cards */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '32px 16px 64px' : '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.key} style={{
              background: BEIGE_CARD,
              borderRadius: 24,
              padding: isMobile ? 24 : 32,
              border: `2px solid ${plan.highlight ? PRIMARY : BEIGE_BORDER}`,
              boxShadow: plan.highlight ? '0 8px 32px rgba(155,142,196,0.16)' : '0 1px 6px rgba(0,0,0,0.04)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, right: 20, background: plan.highlight ? PRIMARY : GREEN_DARK, color: 'white', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                  {plan.badge}
                </div>
              )}
              {plan.highlight && (
                <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Most popular
                </div>
              )}
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{plan.label}</div>
              <div style={{ marginBottom: plan.sub ? 4 : 20 }}>
                <span style={{ fontFamily: 'Georgia,serif', fontSize: 40, fontWeight: 700, color: TEXT }}>${plan.price}</span>
                <span style={{ color: TEXT_MUTED, fontSize: 15 }}>{plan.billing}</span>
              </div>
              {plan.sub && (
                <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 20 }}>{plan.sub}</div>
              )}

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flex: 1 }}>
                {FEATURES.map(f => (
                  <li key={f} style={{ padding: '7px 0', fontSize: 13, color: TEXT, display: 'flex', gap: 8, alignItems: 'flex-start', borderBottom: `1px solid ${BEIGE_BORDER}` }}>
                    <span style={{ color: GREEN_DARK, fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startTrial(plan.priceId, plan.key)}
                disabled={loading !== null}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 100,
                  border: 'none',
                  background: plan.highlight ? PRIMARY : BEIGE_BORDER,
                  color: plan.highlight ? 'white' : TEXT,
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: 'inherit',
                  cursor: loading !== null ? 'wait' : 'pointer',
                  opacity: loading !== null ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {loading === plan.key ? 'Redirecting...' : 'Start free trial →'}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: TEXT_MUTED, marginTop: 28, fontWeight: 600 }}>
          10 days free · Card required · Cancel anytime
        </p>
      </div>

      {/* Footer */}
      <div style={{ background: TEXT, padding: '28px 24px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: 'white' }}>🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
        <p style={{ color: '#9E9188', fontSize: 13, marginTop: 8, marginBottom: 12 }}>© 2026 Waypoint Education · The world is their classroom.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>

    </div>
  )
}
