'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const PRIMARY = '#9B8EC4'
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

export default function PortfolioPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [child, setChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/onboarding'); return }
    setChild(JSON.parse(stored))
    supabase.auth.getUser().then(({ data }) => {
      const uid = data?.user?.id
      if (!uid) { router.push('/auth'); return }
      loadEntries(uid)
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

  const grouped: Record<string, any[]> = {}
  const noTag: any[] = []
  for (const entry of entries) {
    if (!entry.tags?.length) { noTag.push(entry); continue }
    for (const tag of entry.tags as string[]) {
      if (!grouped[tag]) grouped[tag] = []
      grouped[tag].push(entry)
    }
  }

  const activeSections = SUBJECTS.filter(s => grouped[s.label]?.length)
  const totalTagged = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0)

  function EntryCard({ entry }: { entry: any }) {
    return (
      <div style={{ background: BEIGE_CARD, borderRadius: 16, padding: isMobile ? 16 : 20, border: `1px solid ${BEIGE_BORDER}`, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 10 }}>
          <span style={{ padding: '3px 10px', borderRadius: 100, background: PRIMARY_BG, color: PRIMARY, fontSize: 11, fontWeight: 700, border: `1px solid ${PRIMARY_BORDER}` }}>📍 {entry.city}</span>
          <span style={{ padding: '3px 10px', borderRadius: 100, background: BEIGE, color: TEXT_MUTED, fontSize: 11, fontWeight: 700, border: `1px solid ${BEIGE_BORDER}` }}>📅 {entry.date}</span>
        </div>
        <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, margin: 0 }}>{entry.text}</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>

      {/* Topbar */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: TEXT_MUTED, padding: '0 8px 0 0' }}>←</button>
          <span style={{ fontSize: 20 }}>🎨</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>Portfolio</span>
        </div>
        {!isMobile && <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{child?.name} · {entries.length} entries</div>}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '16px 12px' : 24 }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
            <p style={{ color: TEXT_MUTED }}>Loading portfolio...</p>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: TEXT_MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
            <p style={{ fontSize: 15 }}>No journal entries yet.</p>
            <button onClick={() => router.push('/journal')}
              style={{ marginTop: 16, padding: '10px 22px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Write first entry →
            </button>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div style={{ background: BEIGE_CARD, borderRadius: 16, padding: '16px 20px', border: `2px solid ${BEIGE_BORDER}`, marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' as const, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 700, color: TEXT }}>{entries.length}</div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const }}>Entries</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 700, color: TEXT }}>{activeSections.length}</div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const }}>Subjects</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 700, color: TEXT }}>{noTag.length}</div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const }}>Untagged</div>
              </div>
            </div>

            {/* Subject sections */}
            {activeSections.map(s => (
              <div key={s.label} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingLeft: 4, borderLeft: `4px solid ${s.color}` }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>{s.label}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 100, background: s.bg, color: s.color, fontSize: 11, fontWeight: 800, border: `1px solid ${s.color}40`, marginLeft: 4 }}>
                    {grouped[s.label].length} {grouped[s.label].length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                {grouped[s.label].map(entry => <EntryCard key={entry.id} entry={entry} />)}
              </div>
            ))}

            {/* General / untagged section */}
            {noTag.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingLeft: 4, borderLeft: `4px solid ${BEIGE_BORDER}` }}>
                  <span style={{ fontSize: 20 }}>📖</span>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>General</span>
                  <span style={{ padding: '2px 10px', borderRadius: 100, background: BEIGE, color: TEXT_MUTED, fontSize: 11, fontWeight: 800, border: `1px solid ${BEIGE_BORDER}`, marginLeft: 4 }}>
                    {noTag.length} {noTag.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                {noTag.map(entry => <EntryCard key={entry.id} entry={entry} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
