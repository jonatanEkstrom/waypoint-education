'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PRIMARY = '#9B8EC4'
const PRIMARY_DARK = '#7B6BAA'
const PRIMARY_BG = '#F0EBF9'
const PRIMARY_BORDER = '#DDD0F0'
const BEIGE = '#FAF7F2'
const BEIGE_CARD = '#FFFFFF'
const BEIGE_BORDER = '#E8E2D9'
const GREEN_DARK = '#6AAF8A'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleAuth() {
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        localStorage.removeItem('cachedPlan')
        localStorage.removeItem('activeChild')
        router.push('/dashboard/children')
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, email: data.user.email })
          router.push('/dashboard/children')
        }
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 14,
    border: `2px solid ${BEIGE_BORDER}`, fontSize: 15, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box' as const,
    background: BEIGE, color: TEXT
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 16 : 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧭</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: TEXT, marginBottom: 6 }}>
            Waypoint <span style={{ color: PRIMARY }}>Education</span>
          </h1>
          <p style={{ color: TEXT_MUTED, fontSize: 14, fontWeight: 600 }}>The world is their classroom.</p>
        </div>

        <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: isMobile ? 20 : 32, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, marginBottom: 24, color: TEXT }}>
            {isLogin ? 'Welcome back 👋' : 'Create your account 🚀'}
          </h2>

          {!isLogin && (
            <div style={{ background: BEIGE, borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `1px solid ${BEIGE_BORDER}` }}>
              <p style={{ fontSize: 13, color: GREEN_DARK, fontWeight: 700, margin: 0 }}>
                🎉 Beta access — completely free for 30 days, no credit card required
              </p>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              placeholder="you@example.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              placeholder="••••••••" style={inputStyle} />
          </div>

          {!isLogin && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
              <input type="checkbox" id="terms" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: 2, accentColor: PRIMARY, cursor: 'pointer', flexShrink: 0 }} />
              <label htmlFor="terms" style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.5, cursor: 'pointer' }}>
                I agree to the{' '}
                <Link href="/privacy" style={{ color: PRIMARY, textDecoration: 'none', fontWeight: 700 }}>Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/terms" style={{ color: PRIMARY, textDecoration: 'none', fontWeight: 700 }}>Terms of Service</Link>
              </label>
            </div>
          )}

          {error && (
            <p style={{ color: '#E07575', fontSize: 13, marginBottom: 16, fontWeight: 600, background: '#FFF1F2', padding: '10px 14px', borderRadius: 10 }}>
              {error}
            </p>
          )}

          <button onClick={handleAuth} disabled={loading || !email || !password || (!isLogin && !agreedToTerms)}
            style={{ width: '100%', padding: '15px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !email || !password ? 0.5 : 1, fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {loading ? 'Loading...' : isLogin ? 'Sign in →' : 'Create account →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setAgreedToTerms(false) }}
              style={{ background: 'none', border: 'none', color: PRIMARY, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>
          Beta access · 30 days free · No credit card required
        </p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
          <Link href="/privacy" style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}