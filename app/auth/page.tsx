'use client'
import { useState, Suspense } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [billing, setBilling] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [children, setChildren] = useState(1)
  const router = useRouter()

  const basePrice = billing === 'monthly' ? 12.99 : billing === 'quarterly' ? 10.99 : 8.99
  const extraChildren = Math.max(0, children - 1) * 6
  const totalMonthly = basePrice + extraChildren

  async function handleAuth() {
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        localStorage.removeItem('cachedPlan')
        localStorage.removeItem('activeChild')
        router.push('/onboarding')
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, email: data.user.email })
          const res = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ billing, children, userId: data.user.id, email }),
          })
          const { url, error: stripeError } = await res.json()
          if (stripeError) throw new Error(stripeError)
          window.location.href = url
        }
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '13px 16px', borderRadius: 14, border: '2px solid #E4E0F5', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { fontSize: 12, color: '#8B87A8', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧭</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1E1B2E', marginBottom: 6 }}>
            Waypoint <span style={{ color: '#635BFF' }}>Education</span>
          </h1>
          <p style={{ color: '#8B87A8', fontSize: 14, fontWeight: 600 }}>The world is their classroom.</p>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '2px solid #E4E0F5', boxShadow: '0 4px 24px rgba(99,91,255,0.08)' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, marginBottom: 24, color: '#1E1B2E' }}>
            {isLogin ? 'Welcome back 👋' : 'Start your free trial 🚀'}
          </h2>

          {!isLogin && (
            <div style={{ background: '#F8F6FF', borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <div style={labelStyle}>Choose your plan</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {(['monthly', 'quarterly', 'yearly'] as const).map(b => (
                  <button key={b} onClick={() => setBilling(b)} style={{ flex: 1, padding: '8px 4px', borderRadius: 100, border: `2px solid ${billing === b ? '#635BFF' : '#E4E0F5'}`, background: billing === b ? '#635BFF' : 'white', color: billing === b ? 'white' : '#8B87A8', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
                    {b === 'monthly' ? 'Monthly' : b === 'quarterly' ? 'Quarterly' : 'Yearly'}
                  </button>
                ))}
              </div>
              <div style={labelStyle}>Number of children</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => setChildren(n)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `2px solid ${children === n ? '#635BFF' : '#E4E0F5'}`, background: children === n ? '#635BFF' : 'white', color: children === n ? 'white' : '#8B87A8', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>{n}</button>
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, color: '#1E1B2E' }}>
                ${totalMonthly.toFixed(2)}<span style={{ fontSize: 13, color: '#8B87A8', fontWeight: 400 }}>/month</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#10B981', fontWeight: 700, marginTop: 4 }}>10 days free — cancel before day 10</div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>

          {error && <p style={{ color: '#F43F5E', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>{error}</p>}

          <button onClick={handleAuth} disabled={loading || !email || !password} style={{ width: '100%', padding: '15px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}>
            {loading ? 'Loading...' : isLogin ? 'Sign in →' : 'Continue to payment →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#8B87A8', fontWeight: 600 }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#635BFF', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#C4BFDA', fontWeight: 600 }}>
          10 days free · From $12.99/mo after · Cancel anytime
        </p>
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