'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const BEIGE      = '#FAF7F2'
const BEIGE_CARD = '#FFFFFF'
const BEIGE_BG   = '#F5F0E8'
const BEIGE_BORDER = '#E8E2D9'
const TEXT       = '#2D2D2D'
const TEXT_MUTED = '#9E9188'
const PRIMARY    = '#9B8EC4'
const PRIMARY_BG = '#F0EBF9'
const GREEN_DARK = '#6AAF8A'
const GREEN_BG   = '#EDF7F2'
const GREEN_BORDER = '#D5F0E3'

const TRACKS = {
  explorer: {
    name: 'Explorer',
    emoji: '🌍',
    ages: '10–12',
    color: '#EA580C',
    bg: '#FFF7ED',
    border: '#FED7AA',
    dark: '#9A3412',
    muted: '#FFEDD5',
    description: 'Structured exercises with hints and encouragement',
    detail: 'Short focused exercises (10–15 min) with multiple choice and short answers. Hints available. Fun examples from your world.',
  },
  discoverer: {
    name: 'Discoverer',
    emoji: '🔭',
    ages: '13–15',
    color: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
    dark: '#0E7490',
    muted: '#CFFAFE',
    description: 'Deeper content with detailed AI feedback',
    detail: 'Medium exercises (20–30 min) — short essays and analysis. Detailed feedback with real-world connections and a model answer.',
  },
  pioneer: {
    name: 'Pioneer',
    emoji: '🚀',
    ages: '16+',
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    dark: '#3730A3',
    muted: '#E0E7FF',
    description: 'Near high-school level with Socratic AI tutoring',
    detail: 'Longer exercises (30–45 min) — essays, complex problems. AI asks follow-up questions rather than just giving answers. Academic language expected.',
  },
} as const

type TrackKey = keyof typeof TRACKS

const SUBJECTS = [
  { key: 'Mathematics',          emoji: '🔢', description: 'Numbers, patterns, problem solving' },
  { key: 'Writing & Language',   emoji: '✍️', description: 'Essays, grammar, creative expression' },
  { key: 'Science',              emoji: '🔬', description: 'Experiments, discovery, the natural world' },
  { key: 'History & Geography',  emoji: '🗺️', description: 'People, places, events across time' },
  { key: 'Critical Thinking',    emoji: '🤔', description: 'Logic, argument, analysis' },
]

function getDefaultTrack(age_group: string): TrackKey | null {
  if (age_group === '10–12 years') return 'explorer'
  if (age_group === '13+ years')   return null  // let user pick
  return null  // too young
}

function isTooYoung(age_group: string) {
  return age_group === '5–6 years' || age_group === '7–9 years' || age_group === '3–4 years'
}

type Step = 'track-pick' | 'select' | 'generating' | 'exercise' | 'evaluating' | 'feedback'

export default function PracticePage() {
  const [child,          setChild]          = useState<any>(null)
  const [track,          setTrack]          = useState<TrackKey | null>(null)
  const [subject,        setSubject]        = useState<string | null>(null)
  const [step,           setStep]           = useState<Step>('track-pick')
  const [exercise,       setExercise]       = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answer,         setAnswer]         = useState('')
  const [showHint,       setShowHint]       = useState(false)
  const [feedback,       setFeedback]       = useState<any>(null)
  const [sessionCount,   setSessionCount]   = useState(0)
  const [hover,          setHover]          = useState<string | null>(null)
  const [isMobile,       setIsMobile]       = useState(false)
  const router = useRouter()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/dashboard/children'); return }
    const c = JSON.parse(stored)
    setChild(c)

    const def = getDefaultTrack(c.age_group)
    if (def) {
      setTrack(def)
      setStep('select')
    } else if (!isTooYoung(c.age_group)) {
      setStep('track-pick')
    }

    loadSessionCount(c)
  }, [])

  async function loadSessionCount(c: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { count } = await supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('child_id', c.id)
      setSessionCount(count || 0)
    } catch { /* non-critical */ }
  }

  async function loadPreviousTopics(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !child) return []
      const { data } = await supabase
        .from('practice_sessions')
        .select('subject')
        .eq('user_id', user.id)
        .eq('child_id', child.id)
        .order('created_at', { ascending: false })
        .limit(5)
      return data?.map((r: any) => r.subject) || []
    } catch { return [] }
  }

  async function generateExercise() {
    if (!subject || !track || !child) return
    setStep('generating')
    setExercise(null)
    setAnswer('')
    setSelectedOption(null)
    setShowHint(false)
    setFeedback(null)

    const previousTopics = await loadPreviousTopics()
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject, track,
          child_name: child.name,
          age_group: child.age_group,
          city: child.city,
          country: child.country,
          interests: child.subjects || [],
          previous_topics: previousTopics,
        }),
      })
      const data = await res.json()
      if (data.exercise) { setExercise(data.exercise); setStep('exercise') }
      else setStep('select')
    } catch { setStep('select') }
  }

  async function submitAnswer() {
    if (!exercise || !track || !child) return
    const finalAnswer = exercise.type === 'multiple_choice' ? selectedOption : answer.trim()
    if (!finalAnswer) return

    setStep('evaluating')
    try {
      const res = await fetch('/api/practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise, answer: finalAnswer, track,
          age_group: child.age_group,
          child_name: child.name,
        }),
      })
      const data = await res.json()
      if (data.feedback) {
        setFeedback(data.feedback)
        setStep('feedback')
        saveSession(finalAnswer, data.feedback)
      } else setStep('exercise')
    } catch { setStep('exercise') }
  }

  async function saveSession(userAnswer: string, fb: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !child) return
      await supabase.from('practice_sessions').insert({
        user_id: user.id,
        child_id: child.id,
        subject, track,
        exercise, answer: userAnswer,
        feedback: fb, score: fb.score ?? null,
      })
      setSessionCount(n => n + 1)
    } catch { /* non-critical */ }
  }

  function resetToSelect() {
    setSubject(null); setExercise(null); setFeedback(null)
    setAnswer(''); setSelectedOption(null); setShowHint(false)
    setStep('select')
  }

  // ── Derived theme values ─────────────────────────────────────────────────────
  const theme = track ? TRACKS[track] : null
  const tc     = theme?.color  ?? PRIMARY
  const tcBg   = theme?.bg     ?? PRIMARY_BG
  const tcBdr  = theme?.border ?? '#DDD0F0'
  const tcDark = theme?.dark   ?? '#7B6BAA'

  const canSubmit = exercise?.type === 'multiple_choice' ? !!selectedOption : answer.trim().length > 0

  const hoverBtn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer',
  })

  // ── Too young ────────────────────────────────────────────────────────────────
  if (child && isTooYoung(child.age_group)) {
    return (
      <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: 40, maxWidth: 480, textAlign: 'center', border: `2px solid ${BEIGE_BORDER}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: TEXT, marginBottom: 12 }}>Practice Mode is for ages 10+</h2>
          <p style={{ color: TEXT_MUTED, fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
            {child.name} will unlock Practice Mode at age 10. Until then, the dashboard lessons are perfect for them!
          </p>
          <button onClick={() => router.push('/dashboard')}
            style={{ padding: '12px 28px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: isMobile ? '12px 14px' : '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')}
            onMouseEnter={() => setHover('back')} onMouseLeave={() => setHover(null)}
            style={hoverBtn('back', { padding: '8px 14px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: tc, color: tc, background: tcBg })}>
            ← Dashboard
          </button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 17, fontWeight: 700, color: TEXT }}>🎯 Practice Mode</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {sessionCount > 0 && !isMobile && (
            <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{sessionCount} session{sessionCount !== 1 ? 's' : ''} done</span>
          )}
          {theme && (
            <span style={{ padding: '5px 12px', borderRadius: 100, background: tcBg, color: tc, fontSize: 12, fontWeight: 800, border: `2px solid ${tcBdr}` }}>
              {theme.emoji} {theme.name}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: isMobile ? '20px 14px' : '32px 24px' }}>

        {/* ── TRACK PICKER (13+ only) ──────────────────────────────────────── */}
        {step === 'track-pick' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, margin: '0 0 8px 0' }}>Choose your track</h1>
              <p style={{ color: TEXT_MUTED, fontSize: 15, margin: 0 }}>Pick the level that matches where you are right now</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(['discoverer', 'pioneer'] as TrackKey[]).map(tk => {
                const t = TRACKS[tk]
                return (
                  <button key={tk}
                    onClick={() => { setTrack(tk); setStep('select') }}
                    onMouseEnter={() => setHover(`tk-${tk}`)} onMouseLeave={() => setHover(null)}
                    style={hoverBtn(`tk-${tk}`, {
                      padding: '22px 24px', borderRadius: 20, border: `2px solid ${BEIGE_BORDER}`,
                      background: BEIGE_CARD, textAlign: 'left', fontFamily: 'inherit', display: 'block', width: '100%',
                    }, { borderColor: t.color, background: t.bg })}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                      <span style={{ fontSize: 30 }}>{t.emoji}</span>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: TEXT }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>Ages {t.ages}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', padding: '4px 14px', borderRadius: 100, background: t.bg, color: t.color, fontSize: 12, fontWeight: 800, border: `2px solid ${t.border}`, whiteSpace: 'nowrap' as const }}>
                        Select →
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: TEXT_MUTED, margin: '0 0 6px 0', lineHeight: 1.6 }}>{t.description}</p>
                    <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0, lineHeight: 1.5, opacity: 0.8 }}>{t.detail}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── SUBJECT SELECT ───────────────────────────────────────────────── */}
        {step === 'select' && theme && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Track hero */}
            <div style={{ background: `linear-gradient(135deg, ${tc}, ${tcDark})`, borderRadius: 20, padding: '22px 26px', marginBottom: 28, color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{theme.emoji}</div>
                  <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, margin: '0 0 4px 0' }}>{theme.name} Track</h1>
                  <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 6px 0' }}>Ages {theme.ages} · {child?.name}</p>
                  <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>{theme.detail}</p>
                </div>
                {child?.age_group === '13+ years' && (
                  <button onClick={() => { setTrack(null); setSubject(null); setStep('track-pick') }}
                    style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 100, padding: '6px 12px', color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                    Switch track
                  </button>
                )}
              </div>
            </div>

            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: TEXT, marginBottom: 14 }}>Choose a subject</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {SUBJECTS.map(s => {
                const isSel = subject === s.key
                return (
                  <button key={s.key} onClick={() => setSubject(s.key)}
                    onMouseEnter={() => setHover(`s-${s.key}`)} onMouseLeave={() => setHover(null)}
                    style={hoverBtn(`s-${s.key}`, {
                      padding: '14px 18px', borderRadius: 16, border: `2px solid ${isSel ? tc : BEIGE_BORDER}`,
                      background: isSel ? tcBg : BEIGE_CARD, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'inherit',
                    }, { borderColor: tc, background: tcBg })}>
                    <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{s.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: isSel ? tcDark : TEXT }}>{s.key}</div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 1 }}>{s.description}</div>
                    </div>
                    {isSel && <span style={{ color: tc, fontSize: 18, fontWeight: 900 }}>✓</span>}
                  </button>
                )
              })}
            </div>

            {subject && (
              <button onClick={generateExercise}
                onMouseEnter={() => setHover('start')} onMouseLeave={() => setHover(null)}
                style={hoverBtn('start', { width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: tc, color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', animation: 'fadeIn 0.2s ease' }, { background: tcDark })}>
                Start {subject} Exercise →
              </button>
            )}
          </div>
        )}

        {/* ── GENERATING ───────────────────────────────────────────────────── */}
        {step === 'generating' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 20 }}>
            <div style={{ width: 56, height: 56, border: `5px solid ${tcBdr}`, borderTopColor: tc, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: '0 0 6px 0' }}>Preparing your exercise…</p>
              <p style={{ fontSize: 14, color: TEXT_MUTED, margin: 0, animation: 'pulse 2.5s ease infinite' }}>Tailoring it for {child?.name} in {child?.city}</p>
            </div>
          </div>
        )}

        {/* ── EXERCISE ─────────────────────────────────────────────────────── */}
        {step === 'exercise' && exercise && theme && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <button onClick={resetToSelect}
                style={{ background: 'transparent', border: 'none', color: TEXT_MUTED, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ← Change subject
              </button>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ padding: '4px 10px', borderRadius: 100, background: tcBg, color: tc, fontSize: 11, fontWeight: 700, border: `1px solid ${tcBdr}` }}>{subject}</span>
                <span style={{ padding: '4px 10px', borderRadius: 100, background: BEIGE_BG, color: TEXT_MUTED, fontSize: 11, fontWeight: 600 }}>⏱ {exercise.expected_time}</span>
              </div>
            </div>

            {/* Title */}
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: '0 0 16px 0' }}>{exercise.title}</h2>

            {/* Context */}
            {exercise.context && (
              <div style={{ background: tcBg, borderRadius: 14, padding: '14px 18px', marginBottom: 14, border: `2px solid ${tcBdr}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: tc, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>📍 Context</div>
                <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{exercise.context}</p>
              </div>
            )}

            {/* Instructions */}
            {exercise.instructions && (
              <p style={{ fontSize: 14, color: TEXT_MUTED, fontWeight: 600, margin: '0 0 16px 0', lineHeight: 1.6 }}>📋 {exercise.instructions}</p>
            )}

            {/* Your Challenge */}
            <div style={{ background: tcBg, borderRadius: 16, padding: '20px 22px', marginBottom: 20, border: `3px solid ${tc}`, boxShadow: `0 0 0 4px ${tcBdr}40` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: tc, textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 10 }}>❓ Your Challenge</div>
              <p style={{ fontSize: isMobile ? 16 : 18, color: TEXT, margin: 0, lineHeight: 1.75, fontWeight: 700, fontFamily: 'Georgia,serif' }}>
                {(exercise.question || exercise.content || '').replace(/^QUESTION:\s*/i, '')}
              </p>
            </div>

            {/* Multiple choice options */}
            {exercise.type === 'multiple_choice' && Array.isArray(exercise.options) && exercise.options.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {exercise.options.map((opt: any) => {
                  const isSel = selectedOption === opt.label
                  return (
                    <button key={opt.label} onClick={() => setSelectedOption(opt.label)}
                      onMouseEnter={() => setHover(`opt-${opt.label}`)} onMouseLeave={() => setHover(null)}
                      style={hoverBtn(`opt-${opt.label}`, {
                        padding: '13px 18px', borderRadius: 14, border: `2px solid ${isSel ? tc : BEIGE_BORDER}`,
                        background: isSel ? tcBg : BEIGE_CARD, textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center', fontFamily: 'inherit',
                      }, { borderColor: tc, background: tcBg })}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${isSel ? tc : BEIGE_BORDER}`, background: isSel ? tc : 'transparent', color: isSel ? 'white' : TEXT_MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{opt.label}</span>
                      <span style={{ fontSize: 15, color: TEXT, fontWeight: isSel ? 700 : 400, lineHeight: 1.5 }}>{opt.text}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Text answer */}
            {(exercise.type === 'short_answer' || exercise.type === 'essay' || exercise.type === 'problem') && (
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder={
                  exercise.type === 'short_answer' ? 'Write your answer here (aim for 3–5 sentences)…'
                  : exercise.type === 'essay'       ? 'Write your essay here…'
                  :                                   'Show your working and write your answer here…'
                }
                rows={exercise.type === 'short_answer' ? 5 : 11}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const, color: TEXT, lineHeight: 1.75, boxSizing: 'border-box' as const, marginBottom: 20, transition: 'border-color 0.15s' }}
                onFocus={e  => { e.target.style.borderColor = tc }}
                onBlur={e   => { e.target.style.borderColor = BEIGE_BORDER }}
              />
            )}

            {/* Hint — Explorer only */}
            {track === 'explorer' && exercise.hint && (
              <div style={{ marginBottom: 20 }}>
                {!showHint ? (
                  <button onClick={() => setShowHint(true)}
                    style={{ background: 'transparent', border: `2px dashed ${tcBdr}`, borderRadius: 12, padding: '10px 18px', color: tc, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', width: '100%', transition: 'all 0.15s' }}>
                    💡 Show hint
                  </button>
                ) : (
                  <div style={{ background: '#FFFBEB', borderRadius: 12, padding: '12px 16px', border: '2px solid #FDE68A', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 4 }}>💡 Hint</div>
                    <p style={{ fontSize: 14, color: '#92400E', margin: 0, lineHeight: 1.6 }}>{exercise.hint}</p>
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <button onClick={submitAnswer} disabled={!canSubmit}
              onMouseEnter={() => canSubmit && setHover('submit')} onMouseLeave={() => setHover(null)}
              style={hoverBtn('submit', {
                width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                background: canSubmit ? tc : BEIGE_BORDER,
                color: canSubmit ? 'white' : TEXT_MUTED,
                fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                opacity: canSubmit ? 1 : 0.6,
              }, { background: tcDark })}>
              Submit Answer →
            </button>
          </div>
        )}

        {/* ── EVALUATING ───────────────────────────────────────────────────── */}
        {step === 'evaluating' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 20 }}>
            <div style={{ width: 56, height: 56, border: `5px solid ${tcBdr}`, borderTopColor: tc, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: '0 0 6px 0' }}>Evaluating your answer…</p>
              <p style={{ fontSize: 14, color: TEXT_MUTED, margin: 0, animation: 'pulse 2.5s ease infinite' }}>Personalised feedback coming up</p>
            </div>
          </div>
        )}

        {/* ── FEEDBACK ─────────────────────────────────────────────────────── */}
        {step === 'feedback' && feedback && exercise && theme && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Score / header */}
            <div style={{ background: `linear-gradient(135deg, ${tc}, ${tcDark})`, borderRadius: 20, padding: '24px 28px', marginBottom: 22, color: 'white', textAlign: 'center' }}>
              {feedback.score !== null && feedback.score !== undefined ? (
                <>
                  <div style={{ fontSize: 52, fontWeight: 900, fontFamily: 'Georgia,serif', lineHeight: 1 }}>
                    {feedback.score}<span style={{ fontSize: 22 }}>/100</span>
                  </div>
                  <div style={{ fontSize: 15, opacity: 0.9, marginTop: 8 }}>
                    {feedback.score >= 85 ? '🌟 Excellent work!'
                    : feedback.score >= 70 ? '👍 Great effort!'
                    : feedback.score >= 55 ? '📈 Good progress — keep going!'
                    :                        '💪 Nice try — let\'s learn from this!'}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 34, marginBottom: 8 }}>{theme.emoji}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Georgia,serif' }}>Pioneer Assessment</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{exercise.title}</div>
                </>
              )}
            </div>

            {/* Exercise recap */}
            <div style={{ background: BEIGE_BG, borderRadius: 12, padding: '10px 14px', marginBottom: 14, border: `1px solid ${BEIGE_BORDER}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 3 }}>Exercise</div>
              <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0, lineHeight: 1.5 }}>
                {((exercise.question || exercise.content || '').replace(/^QUESTION:\s*/i, '')).slice(0, 130)}
                {(exercise.question || exercise.content || '').length > 130 ? '…' : ''}
              </p>
            </div>

            {/* What went well */}
            {feedback.what_went_well && (
              <div style={{ background: GREEN_BG, borderRadius: 14, padding: 18, marginBottom: 12, border: `2px solid ${GREEN_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>✅ What went well</div>
                <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.75 }}>{feedback.what_went_well}</p>
              </div>
            )}

            {/* What to improve */}
            {feedback.improvement && (
              <div style={{ background: '#EFF6FF', borderRadius: 14, padding: 18, marginBottom: 12, border: '2px solid #BFDBFE' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>📈 What to develop</div>
                <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.75 }}>{feedback.improvement}</p>
              </div>
            )}

            {/* Model answer — Discoverer */}
            {feedback.model_answer && (
              <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 18, marginBottom: 12, border: '2px solid #FDE68A' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>📝 Example of a strong answer</div>
                <p style={{ fontSize: 14, color: '#92400E', margin: 0, lineHeight: 1.75 }}>{feedback.model_answer}</p>
              </div>
            )}

            {/* Socratic follow-up — Pioneer */}
            {feedback.follow_up_question && (
              <div style={{ background: tcBg, borderRadius: 14, padding: 20, marginBottom: 12, border: `2px solid ${tcBdr}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: tc, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>🤔 Socratic Follow-up</div>
                <p style={{ fontSize: 16, color: TEXT, margin: '0 0 10px 0', lineHeight: 1.75, fontStyle: 'italic', fontFamily: 'Georgia,serif' }}>"{feedback.follow_up_question}"</p>
                <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>Think this through — discuss with a parent, or write your response in your journal.</p>
              </div>
            )}

            {/* Encouragement */}
            {feedback.encouragement && (
              <div style={{ textAlign: 'center', padding: '14px 0 6px 0' }}>
                <p style={{ fontSize: 15, color: TEXT_MUTED, margin: 0, fontStyle: 'italic' }}>"{feedback.encouragement}"</p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={resetToSelect}
                onMouseEnter={() => setHover('new-s')} onMouseLeave={() => setHover(null)}
                style={hoverBtn('new-s', { flex: 1, padding: '14px', borderRadius: 14, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 14, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: tc, color: tc, background: tcBg })}>
                Change Subject
              </button>
              <button onClick={generateExercise}
                onMouseEnter={() => setHover('next')} onMouseLeave={() => setHover(null)}
                style={hoverBtn('next', { flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: tc, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { background: tcDark })}>
                Next Exercise →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
