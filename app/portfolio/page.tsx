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

type DateRange = '1m' | '3m' | '6m' | 'all'

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  '1m': 'Last month',
  '3m': 'Last 3 months',
  '6m': 'Last 6 months',
  'all': 'All time',
}

function getDateCutoff(range: DateRange): Date | null {
  if (range === 'all') return null
  const months = range === '1m' ? 1 : range === '3m' ? 3 : 6
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d
}

export default function PortfolioPage() {
  const [entries,   setEntries]   = useState<any[]>([])
  const [child,     setChild]     = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [isMobile,  setIsMobile]  = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>('3m')
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

  const cutoff = getDateCutoff(dateRange)
  const filteredEntries = cutoff
    ? entries.filter(e => new Date(e.date) >= cutoff)
    : entries

  const grouped: Record<string, any[]> = {}
  const noTag: any[] = []
  for (const entry of filteredEntries) {
    if (!entry.tags?.length) { noTag.push(entry); continue }
    for (const tag of entry.tags as string[]) {
      if (!grouped[tag]) grouped[tag] = []
      grouped[tag].push(entry)
    }
  }

  const activeSections = SUBJECTS.filter(s => grouped[s.label]?.length)

  const generatedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  function EntryCard({ entry }: { entry: any }) {
    return (
      <div className="entry-card" style={{ background: BEIGE_CARD, borderRadius: 16, padding: isMobile ? 16 : 20, border: `1px solid ${BEIGE_BORDER}`, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
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
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body, html { background: white !important; }
          @page {
            size: A4;
            margin: 20mm 18mm;
            @bottom-center {
              content: "Page " counter(page) "  ·  Waypoint Education";
              font-size: 9pt;
              color: #9E9188;
            }
          }
          .portfolio-wrap { padding: 0 !important; max-width: 100% !important; }
          .subject-section { page-break-inside: avoid; }
          .section-break { page-break-before: always; }
          .entry-card { page-break-inside: avoid; border: 1px solid #E8E2D9 !important; box-shadow: none !important; border-radius: 6px !important; }
        }
        @media screen {
          .print-only { display: none; }
        }
      `}</style>

      {/* Topbar — screen only */}
      <div className="no-print" style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: TEXT_MUTED, padding: '0 8px 0 0' }}>←</button>
          <span style={{ fontSize: 20 }}>🎨</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>Portfolio</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
          {!isMobile && (
            <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{child?.name} · {filteredEntries.length} entries</span>
          )}
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as DateRange)}
            style={{ padding: '7px 12px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}
          >
            <option value="1m">Last month</option>
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={() => window.print()}
            style={{ padding: '8px 18px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="portfolio-wrap" style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '16px 12px' : 24 }}>

        {/* Print-only document header */}
        <div className="print-only" style={{ marginBottom: 32, paddingBottom: 20, borderBottom: `2px solid ${BEIGE_BORDER}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10 }}>
            Learning Portfolio · Waypoint Education
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: TEXT, margin: '0 0 8px 0', fontWeight: 700 }}>
            {child?.name}
          </h1>
          <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0, lineHeight: 1.6 }}>
            {DATE_RANGE_LABELS[dateRange]} · {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} across {activeSections.length} {activeSections.length === 1 ? 'subject' : 'subjects'} · Generated {generatedDate}
          </p>
        </div>

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
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: TEXT_MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 15 }}>No entries in this period.</p>
            <p style={{ fontSize: 13 }}>Try selecting a longer date range.</p>
          </div>
        ) : (
          <>
            {/* Summary strip — screen only */}
            <div className="no-print" style={{ background: BEIGE_CARD, borderRadius: 16, padding: '16px 20px', border: `2px solid ${BEIGE_BORDER}`, marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' as const, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 700, color: TEXT }}>{filteredEntries.length}</div>
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
            {activeSections.map((s, idx) => (
              <div key={s.label} className={`subject-section${idx > 0 ? ' section-break' : ''}`} style={{ marginBottom: 28 }}>
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
              <div className={`subject-section${activeSections.length > 0 ? ' section-break' : ''}`} style={{ marginBottom: 28 }}>
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
