'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleAuth() {
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
          })
        }
      }
      router.push('/onboarding')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F8F6FF',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧭</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1E1B2E', marginBottom: 6 }}>
            Waypoint <span style={{ color: '#635BFF' }}>Education</span>
          </h1>
          <p style={{ color: '#8B87A8', fontSize: 14, fontWeight: 600 }}>
            The world is their classroom.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '2px solid #E4E0F5', boxShadow: '0 4px 24px rgba(99,91,255,0.08)' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, marginBottom: 24, color: '#1E1B2E' }}>
            {isLogin ? 'Welcome back 👋' : 'Create your account 🚀'}
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#8B87A8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '2px solid #E4E0F5', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: '#8B87A8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '2px solid #E4E0F5', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ color: '#F43F5E', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>{error}</p>}

          <button
            onClick={handleAuth} disabled={loading || !email || !password}
            style={{ width: '100%', padding: '15px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}
          >
            {loading ? 'Loading...' : isLogin ? 'Sign in →' : 'Create account →'}
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