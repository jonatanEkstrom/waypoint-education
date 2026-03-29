'use client'
import { useEffect, useState, Suspense } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const PRIMARY = '#9B8EC4'
const BEIGE = '#FAF7F2'
const BEIGE_CARD = '#FFFFFF'
const BEIGE_BORDER = '#E8E2D9'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

function ConfirmHandler() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    async function confirm() {
      // --- Flow 1: token_hash + type in query string (Supabase default for email OTP) ---
      const tokenHash = params.get('token_hash')
      const type = params.get('type') as 'signup' | 'email' | null

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (error) {
          setError(error.message)
          setStatus('error')
          return
        }
        localStorage.clear()
        router.replace('/dashboard/children')
        return
      }

      // --- Flow 2: access_token + refresh_token in URL hash fragment (older / implicit flow) ---
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      if (hash) {
        const hashParams = new URLSearchParams(hash.slice(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (error) {
            setError(error.message)
            setStatus('error')
            return
          }
          localStorage.clear()
          router.replace('/dashboard/children')
          return
        }
      }

      // --- Flow 3: code in query string (PKCE) ---
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError(error.message)
          setStatus('error')
          return
        }
        localStorage.clear()
        router.replace('/dashboard/children')
        return
      }

      setError('Invalid or expired confirmation link.')
      setStatus('error')
    }

    confirm()
  }, [params, router])

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧭</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: TEXT, marginBottom: 6 }}>
            Waypoint <span style={{ color: PRIMARY }}>Education</span>
          </h1>
        </div>

        <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: 32, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          {status === 'loading' ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
              <p style={{ color: TEXT_MUTED, fontSize: 15, fontWeight: 600 }}>Confirming your email...</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 16 }}>❌</div>
              <p style={{ color: '#E07575', fontSize: 14, fontWeight: 700, background: '#FFF1F2', padding: '10px 14px', borderRadius: 10, marginBottom: 20 }}>
                {error}
              </p>
              <button
                onClick={() => router.push('/auth')}
                style={{ padding: '12px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmHandler />
    </Suspense>
  )
}
