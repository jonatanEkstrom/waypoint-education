'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const PRIMARY = '#9B8EC4'
const PRIMARY_DARK = '#7B6BAA'
const PRIMARY_BG = '#F0EBF9'
const PRIMARY_BORDER = '#DDD0F0'
const BEIGE = '#FAF7F2'
const BEIGE_CARD = '#FFFFFF'
const BEIGE_BORDER = '#E8E2D9'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

export default function JournalPage() {
  const [child, setChild] = useState<any>(null)
  const [userId, setUserId] = useState<string>('guest')
  const [entries, setEntries] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/onboarding'); return }
    setChild(JSON.parse(stored))
    supabase.auth.getUser().then(({ data }) => {
      const id = data?.user?.id || 'guest'
      setUserId(id)
      loadEntries(id)
    })
  }, [])

  async function loadEntries(uid: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
      if (error) throw error
      setEntries(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function saveEntry() {
    if (!text.trim()) return
    setSaving(true)
    try {
      const entry = {
        user_id: userId,
        city: child?.city,
        country: child?.country,
        date: new Date().toLocaleDateString(),
        text: text.trim(),
        story: null
      }
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single()
      if (error) throw error
      setEntries(prev => [data, ...prev])
      setText('')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function deleteEntry(id: string) {
    try {
      await supabase.from('journal_entries').delete().eq('id', id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>

      {/* Topbar */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: TEXT_MUTED, padding: '0 8px 0 0' }}>←</button>
          <span style={{ fontSize: 20 }}>📖</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>Travel Journal</span>
        </div>
        <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{child?.name} · {child?.city}</div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>

        {/* New entry */}
        <div style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, border: `2px solid ${BEIGE_BORDER}`, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 19, color: TEXT, marginBottom: 6 }}>New entry ✏️</h2>
          <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 16 }}>What did {child?.name} experience today in {child?.city}?</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write about today's adventure..."
            rows={4}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: `2px solid ${BEIGE_BORDER}`, fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, marginBottom: 12, background: BEIGE, color: TEXT }}
          />
          <button onClick={saveEntry} disabled={saving || !text.trim()}
            style={{ width: '100%', padding: 14, borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 800, cursor: saving || !text.trim() ? 'not-allowed' : 'pointer', opacity: saving || !text.trim() ? 0.4 : 1, fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {saving ? 'Saving...' : 'Save entry 💾'}
          </button>
        </div>

        {/* Entries */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
            <p style={{ color: TEXT_MUTED }}>Loading journal...</p>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: TEXT_MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✏️</div>
            <p style={{ fontSize: 15 }}>No entries yet — write your first memory!</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, border: `2px solid ${BEIGE_BORDER}`, marginBottom: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                  <span style={{ padding: '4px 12px', borderRadius: 100, background: PRIMARY_BG, color: PRIMARY, fontSize: 12, fontWeight: 700, border: `1px solid ${PRIMARY_BORDER}` }}>📍 {entry.city}</span>
                  <span style={{ padding: '4px 12px', borderRadius: 100, background: BEIGE, color: TEXT_MUTED, fontSize: 12, fontWeight: 700, border: `1px solid ${BEIGE_BORDER}` }}>📅 {entry.date}</span>
                </div>
                <button onClick={() => deleteEntry(entry.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: BEIGE_BORDER, padding: 4 }}>🗑</button>
              </div>
              <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.7, margin: 0 }}>{entry.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}