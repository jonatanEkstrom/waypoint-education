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
const GREEN = '#A8D5BA'
const GREEN_DARK = '#6AAF8A'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

interface Child {
  id: string
  name: string
  age_group: string
  curriculum: string
  learn_style: string
  subjects: string[]
  city: string
  country: string
  notes?: string
  language_learning: string
}

interface JournalEntry {
  id: string
  date: string
  city: string
  country: string
  text: string
  story?: string
}

interface Lesson {
  subject: string
  title: string
  duration: string
  activity: string
  goal?: string
}

interface DayPlan {
  day: string
  focus: string
  lessons: Lesson[]
}

interface WeekPlan {
  child_name: string
  week_number: number
  city: string
  country: string
  plan: { week_theme: string; days: DayPlan[] }
}

const PHILOSOPHY: Record<string, string> = {
  'Charlotte Mason':
    "Our home education follows the Charlotte Mason philosophy, which centres on living books, narration, nature journalling, and an appreciation of great art and music. Learning is approached through short, focused lessons across varied subjects, fostering a genuine love of knowledge rather than rote memorisation.",
  'Classical':
    "Our home education follows the Classical Trivium model, progressing through the grammar, logic, and rhetoric stages of learning. We emphasise the study of great works, Socratic discussion, and the development of strong reasoning and communication skills alongside a broad foundational knowledge base.",
  'Unschooling':
    "Our home education follows an unschooling approach, trusting in the child's natural curiosity and intrinsic motivation as the primary driver of learning. Education arises organically through everyday life, travel, play, and the child's own questions and interests, with parents facilitating rather than directing.",
  'Montessori':
    "Our home education draws on Montessori principles, emphasising prepared learning environments, self-directed exploration, and hands-on discovery. The child is encouraged to follow their natural developmental impulses, building independence, concentration, and intrinsic motivation across all subject areas.",
  'Eclectic':
    "Our home education takes an eclectic approach, drawing thoughtfully on a variety of educational philosophies and methods to best suit our child's individual learning style, interests, and developmental stage. We combine structured lessons with child-led exploration, adapting our approach as the child's needs evolve.",
}

const STYLE_SUFFIX: Record<string, string> = {
  'Hands-on & building':
    " Particular emphasis is placed on practical, project-based activities that allow the child to learn through making, building, and direct experience.",
  'Reading & writing':
    " The programme places particular emphasis on rich text-based learning, including extensive reading from quality sources, written narration, and composition across subjects.",
  'Visual & video':
    " Visual learning is a cornerstone of our approach, incorporating documentaries, diagrams, maps, timelines, and other visual media to reinforce understanding.",
  'Discussion & exploration':
    " Oral discussion and Socratic questioning are central to our approach, with the child encouraged to articulate, defend, and refine their understanding through conversation and open-ended enquiry.",
}

function philosophyParagraph(child: Child): string {
  const base = PHILOSOPHY[child.curriculum] ?? PHILOSOPHY['Eclectic']
  const suffix = STYLE_SUFFIX[child.learn_style] ?? ''
  return base + suffix
}

function weekNumberToDate(n: number): Date {
  return new Date(n * 7 * 24 * 60 * 60 * 1000)
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function tryParseDate(s: string): Date {
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date() : d
}

// ── Sub-components (defined outside to avoid re-renders) ──

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
      <div style={{
        fontFamily: 'Georgia,serif', fontSize: 13, fontWeight: 700, color: PRIMARY,
        background: PRIMARY_BG, border: `1.5px solid ${PRIMARY_BORDER}`,
        borderRadius: '50%', width: 30, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{number}</div>
      <div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 21, fontWeight: 700, color: TEXT, margin: 0 }}>{title}</h2>
        {subtitle && <span style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>{subtitle}</span>}
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: BEIGE_BORDER, margin: '40px 0 0' }} />
}

function Tag({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${color}44`, borderRadius: 10, padding: '6px 12px', display: 'inline-block' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

// ── Main page ──

export default function LAReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [selected, setSelected] = useState<Child | null>(null)
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [plans, setPlans] = useState<WeekPlan[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    setUser(user)

    const { data: kids } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    if (kids?.length) {
      setChildren(kids)
      let active: Child = kids[0]
      try {
        const stored = localStorage.getItem('activeChild')
        if (stored) {
          const a = JSON.parse(stored)
          const match = kids.find((k: Child) => k.id === a.id)
          if (match) active = match
        }
      } catch {}
      setSelected(active)
      await fetchData(user.id, active.name)
    }
    setLoading(false)
  }

  async function fetchData(userId: string, childName: string) {
    setFetching(true)
    const [journalRes, plansRes] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('id, date, city, country, text, story')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('weekly_plans')
        .select('child_name, week_number, city, country, plan')
        .eq('user_id', userId)
        .eq('child_name', childName)
        .order('week_number', { ascending: true }),
    ])
    if (journalRes.data) setJournal(journalRes.data)
    if (plansRes.data) setPlans(plansRes.data)
    setFetching(false)
  }

  async function changeChild(child: Child) {
    setSelected(child)
    if (user) await fetchData(user.id, child.name)
  }

  // ── Derived data ──

  const today = new Date()
  const academicYear = today.getMonth() >= 8
    ? `${today.getFullYear()}–${today.getFullYear() + 1}`
    : `${today.getFullYear() - 1}–${today.getFullYear()}`

  let minDate: Date | null = null
  let maxDate: Date | null = null
  journal.forEach(e => {
    const d = tryParseDate(e.date)
    if (!minDate || d < minDate) minDate = d
    if (!maxDate || d > maxDate) maxDate = d
  })
  plans.forEach(wp => {
    const d = weekNumberToDate(wp.week_number)
    if (!minDate || d < minDate) minDate = d
    if (!maxDate || d > maxDate) maxDate = d
  })
  const dateRangeStr = minDate && maxDate ? `${fmt(minDate)} – ${fmt(maxDate)}` : `Up to ${fmt(today)}`

  // Group journal entries by month
  const byMonth: Record<string, JournalEntry[]> = {}
  journal.forEach(e => {
    const d = tryParseDate(e.date)
    const key = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(e)
  })

  // Group lessons by subject across all weekly plans
  const bySubject: Record<string, Array<{ week: string; day: string; title: string; duration: string; activity: string }>> = {}
  plans.forEach(wp => {
    const weekStr = weekNumberToDate(wp.week_number)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    wp.plan?.days?.forEach(day => {
      day.lessons?.forEach(l => {
        const subj = l.subject || 'General'
        if (!bySubject[subj]) bySubject[subj] = []
        bySubject[subj].push({ week: `w/c ${weekStr}`, day: day.day, title: l.title, duration: l.duration, activity: l.activity })
      })
    })
  })

  const planSubjects = new Set(Object.keys(bySubject))
  const allSubjects = Array.from(new Set([...(selected?.subjects ?? []), ...Array.from(planSubjects)]))
  const locations = Array.from(new Set(
    journal.map(e => [e.city, e.country].filter(Boolean).join(', ')).filter(Boolean)
  ))

  // ── Render ──

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <span style={{ color: TEXT_MUTED, fontSize: 16 }}>Loading…</span>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, fontFamily: 'system-ui, sans-serif', color: TEXT }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; }
          @page { size: A4; margin: 18mm 16mm; }
          .page-break { page-break-before: always; padding-top: 0 !important; }
          .avoid-break { page-break-inside: avoid; }
          .report-wrap { padding: 0 !important; max-width: 100% !important; }
        }
        @media screen {
          .page-break { margin-top: 0; }
        }
      `}</style>

      {/* Controls bar — screen only */}
      <div className="no-print" style={{
        background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, fontSize: 20, padding: 0, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>🏛️ LA Report</span>
          {fetching && <span style={{ fontSize: 12, color: TEXT_MUTED }}>Loading data…</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
          {children.length > 1 && (
            <select
              value={selected?.id ?? ''}
              onChange={e => { const c = children.find(k => k.id === e.target.value); if (c) changeChild(c) }}
              style={{ padding: '8px 12px', borderRadius: 10, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button
            onClick={() => window.print()}
            style={{ padding: '9px 20px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            🖨️ Save as PDF
          </button>
        </div>
      </div>

      {/* Report body */}
      <div className="report-wrap" style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '48px 48px 80px' }}>

        {/* ── Cover Page ── */}
        <div style={{ textAlign: 'center', paddingBottom: 48, borderBottom: `3px solid ${TEXT}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 36 }}>
            Waypoint Education · Home Education Documentation
          </div>

          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 30 : 46, fontWeight: 700, color: TEXT, margin: '0 0 6px', lineHeight: 1.1 }}>
            Home Education Report
          </h1>
          <p style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 16 : 21, color: TEXT_MUTED, margin: '0 0 48px' }}>
            United Kingdom Local Authority Submission
          </p>

          {/* Info grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            maxWidth: 500, margin: '0 auto',
            border: `1.5px solid ${BEIGE_BORDER}`, borderRadius: 14, overflow: 'hidden',
            textAlign: 'left' as const, fontSize: 14,
          }}>
            {[
              ['Child', selected?.name ?? '—'],
              ['Age Group', selected?.age_group ?? '—'],
              ['Academic Year', academicYear],
              ['Date Range', dateRangeStr],
              ['Current Location', selected ? `${selected.city}, ${selected.country}` : '—'],
              ['Report Date', fmt(today)],
            ].map(([label, value], i) => (
              <div key={label} style={{ padding: '12px 16px', background: i % 2 === 0 ? BEIGE : BEIGE_CARD, borderBottom: i < 4 ? `1px solid ${BEIGE_BORDER}` : 'none' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontWeight: 700, color: TEXT }}>{value}</div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 44, fontSize: 12, color: TEXT_MUTED, lineHeight: 1.7 }}>
            This report was generated using Waypoint Education — a home education planning platform for travelling families.<br />
            © {today.getFullYear()} Waypoint Education · waypoint-education.vercel.app
          </p>
        </div>

        {/* ── Section 1: Educational Philosophy ── */}
        <div style={{ paddingTop: 44, marginBottom: 8 }}>
          <SectionHeader number="1" title="Educational Philosophy" />
          {selected ? (
            <>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 18 }}>
                <Tag label="Approach" value={selected.curriculum} color={PRIMARY} bg={PRIMARY_BG} />
                <Tag label="Learning Style" value={selected.learn_style} color={GREEN_DARK} bg="#EDF7F2" />
                {selected.language_learning && selected.language_learning !== 'None' && (
                  <Tag label="Language" value={selected.language_learning} color="#C17A00" bg="#FFF8EC" />
                )}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.85, color: TEXT, margin: '0 0 16px', textAlign: 'justify' as const }}>
                {philosophyParagraph(selected)}
              </p>
              {selected.notes && (
                <div className="avoid-break" style={{ padding: '12px 16px', background: BEIGE, borderRadius: 10, border: `1px solid ${BEIGE_BORDER}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>Additional Notes</div>
                  <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.65 }}>{selected.notes}</p>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: TEXT_MUTED }}>No child selected.</p>
          )}
        </div>

        <Divider />

        {/* ── Section 2: Learning Record ── */}
        <div className="page-break" style={{ paddingTop: 44, marginBottom: 8 }}>
          <SectionHeader number="2" title="Learning Record" subtitle="Family Learning Journal" />
          <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: -8, marginBottom: 24, fontStyle: 'italic' }}>
            The following journal entries document learning activities undertaken during the period covered by this report.
          </p>

          {Object.keys(byMonth).length === 0 ? (
            <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No journal entries recorded for this period.</p>
          ) : (
            Object.entries(byMonth).map(([month, entries]) => (
              <div key={month} className="avoid-break" style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${PRIMARY_BG}` }}>
                  {month}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: BEIGE }}>
                      {['Date', 'Location', 'Learning Activity'].map(h => (
                        <th key={h} style={{ textAlign: 'left' as const, padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={e.id} style={{ borderBottom: `1px solid ${BEIGE_BORDER}`, background: i % 2 === 0 ? 'white' : BEIGE }}>
                        <td style={{ padding: '9px 10px', verticalAlign: 'top', color: TEXT_MUTED, whiteSpace: 'nowrap' as const, width: '16%' }}>{e.date}</td>
                        <td style={{ padding: '9px 10px', verticalAlign: 'top', color: TEXT_MUTED, whiteSpace: 'nowrap' as const, width: '20%' }}>{[e.city, e.country].filter(Boolean).join(', ') || '—'}</td>
                        <td style={{ padding: '9px 10px', verticalAlign: 'top', color: TEXT, lineHeight: 1.55 }}>{e.text}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>

        <Divider />

        {/* ── Section 3: Lesson Plans ── */}
        <div className="page-break" style={{ paddingTop: 44, marginBottom: 8 }}>
          <SectionHeader number="3" title="Structured Lesson Plans" subtitle={selected ? `${selected.name}'s Weekly Plans` : ''} />
          <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: -8, marginBottom: 24, fontStyle: 'italic' }}>
            AI-generated lesson plans tailored to the child's age group, current location, and educational approach, grouped by subject area.
          </p>

          {Object.keys(bySubject).length === 0 ? (
            <p style={{ color: TEXT_MUTED, fontSize: 14 }}>No lesson plans recorded.</p>
          ) : (
            Object.entries(bySubject).sort(([a], [b]) => a.localeCompare(b)).map(([subject, lessons]) => (
              <div key={subject} className="avoid-break" style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${PRIMARY_BG}` }}>
                  {subject}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: BEIGE }}>
                      {['Week / Day', 'Lesson Title', 'Duration', 'Activity Description'].map(h => (
                        <th key={h} style={{ textAlign: 'left' as const, padding: '8px 10px', fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.map((l, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BEIGE_BORDER}`, background: i % 2 === 0 ? 'white' : BEIGE }}>
                        <td style={{ padding: '9px 10px', verticalAlign: 'top', color: TEXT_MUTED, fontSize: 12, width: '22%' }}>
                          {l.week}<br /><span style={{ fontWeight: 700, color: TEXT }}>{l.day}</span>
                        </td>
                        <td style={{ padding: '9px 10px', verticalAlign: 'top', color: TEXT, fontWeight: 600, width: '26%' }}>{l.title}</td>
                        <td style={{ padding: '9px 10px', verticalAlign: 'top', color: TEXT_MUTED, whiteSpace: 'nowrap' as const, width: '10%' }}>{l.duration}</td>
                        <td style={{ padding: '9px 10px', verticalAlign: 'top', color: TEXT, lineHeight: 1.5, fontSize: 12 }}>{l.activity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>

        <Divider />

        {/* ── Section 4: Summary ── */}
        <div className="avoid-break" style={{ paddingTop: 44 }}>
          <SectionHeader number="4" title="Summary" />

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Journal Entries', value: journal.length, icon: '📖' },
              { label: 'Weeks Planned', value: plans.length, icon: '📅' },
              { label: 'Subjects', value: allSubjects.length, icon: '📚' },
              { label: 'Locations', value: locations.length, icon: '🌍' },
            ].map(s => (
              <div key={s.label} style={{ background: BEIGE, borderRadius: 14, padding: '18px 14px', textAlign: 'center' as const, border: `1.5px solid ${BEIGE_BORDER}` }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 30, fontWeight: 700, color: PRIMARY, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {allSubjects.length > 0 && (
            <div className="avoid-break" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 10 }}>Subjects Covered</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {allSubjects.map(s => (
                  <span key={s} style={{ background: PRIMARY_BG, color: PRIMARY, border: `1.5px solid ${PRIMARY_BORDER}`, borderRadius: 100, padding: '5px 13px', fontSize: 13, fontWeight: 700 }}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {locations.length > 0 && (
            <div className="avoid-break" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 10 }}>Locations Visited</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {locations.map(loc => (
                  <span key={loc} style={{ background: '#EDF7F2', color: GREEN_DARK, border: '1.5px solid #C5E8D5', borderRadius: 100, padding: '5px 13px', fontSize: 13, fontWeight: 700 }}>
                    📍 {loc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Report footer */}
        <div style={{ borderTop: `2px solid ${BEIGE_BORDER}`, marginTop: 48, paddingTop: 24, textAlign: 'center' as const }}>
          <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0, lineHeight: 1.8 }}>
            Generated by Waypoint Education on {fmt(today)}<br />
            This document was produced using AI-assisted lesson planning tools and parental records.<br />
            waypoint-education.vercel.app
          </p>
        </div>

      </div>
    </div>
  )
}
