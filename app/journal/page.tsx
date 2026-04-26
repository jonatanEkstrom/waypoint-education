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

const SUBJECTS = [
  { label: 'Math',               emoji: '🔢', color: '#4A90D9', bg: '#EAF3FC' },
  { label: 'Science',            emoji: '🔬', color: '#5FAD78', bg: '#EBF7EF' },
  { label: 'Language Arts',      emoji: '📝', color: '#9B8EC4', bg: '#F0EBF9' },
  { label: 'History',            emoji: '🏛️', color: '#D4935A', bg: '#FDF0E5' },
  { label: 'Geography',          emoji: '🌍', color: '#4AADA0', bg: '#E6F5F3' },
  { label: 'Art',                emoji: '🎨', color: '#D4708A', bg: '#FCE8EF' },
  { label: 'Music',              emoji: '🎵', color: '#C4A030', bg: '#FBF5E0' },
  { label: 'Physical Education', emoji: '⚽', color: '#D46040', bg: '#FCE9E4' },
  { label: 'Nature',             emoji: '🌿', color: '#74B844', bg: '#F0F9E8' },
  { label: 'Life Skills',        emoji: '🏠', color: '#8A7060', bg: '#F4EEE9' },
  { label: 'Travel',             emoji: '✈️', color: '#4A78C4', bg: '#EAF0FB' },
  { label: 'Creative Writing',   emoji: '✍️', color: '#9B5AC4', bg: '#F5EBF9' },
] as const

export default function JournalPage() {
  const [child, setChild] = useState<any>(null)
  const [userId, setUserId] = useState<string>('guest')
  const [entries, setEntries] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
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
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
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
        story: null,
        tags: selectedTags,
      }
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single()
      if (error) throw error
      setEntries(prev => [data, ...prev])
      setText('')
      setSelectedTags([])
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
        {!isMobile && <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{child?.name} · {child?.city}</div>}
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '16px 12px' : 24 }}>

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
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Subjects (optional)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {SUBJECTS.map(s => {
                const active = selectedTags.includes(s.label)
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSelectedTags(prev =>
                      prev.includes(s.label) ? prev.filter(t => t !== s.label) : [...prev, s.label]
                    )}
                    style={{
                      padding: '5px 11px', borderRadius: 100, fontFamily: 'inherit',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: `2px solid ${active ? s.color : BEIGE_BORDER}`,
                      background: active ? s.bg : BEIGE_CARD,
                      color: active ? s.color : TEXT_MUTED,
                      transition: 'all 0.12s',
                    }}
                  >
                    {s.emoji} {s.label}
                  </button>
                )
              })}
            </div>
          </div>
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
              {entry.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 12 }}>
                  {(entry.tags as string[]).map(tag => {
                    const s = SUBJECTS.find(x => x.label === tag)
                    return s ? (
                      <span key={tag} style={{
                        padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                        background: s.bg, color: s.color, border: `1px solid ${s.color}40`,
                      }}>
                        {s.emoji} {s.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}