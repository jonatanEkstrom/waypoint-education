'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const PRIMARY = '#74B9F0'
const PRIMARY_DARK = '#4A90C4'
const PRIMARY_BG = '#EEF6FF'
const PRIMARY_BORDER = '#C5E0F8'
const BEIGE = '#F5EDD8'
const BEIGE_CARD = '#FDFAF5'
const BEIGE_BORDER = '#D4C5A0'
const GREEN = '#6DCFA0'
const GREEN_DARK = '#3A9E6E'
const TEXT = '#1C2B0E'
const TEXT_MUTED = '#8B7355'

const LOADING_MESSAGES = [
  'Crafting your lesson plan...', 'Adding local discoveries...',
  'Tailoring for your child...', 'Almost ready...',
  'Polishing the details...', 'Just a moment more...'
]

export default function DashboardPage() {
  const [child, setChild] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [activeDay, setActiveDay] = useState('Monday')
  const [completed, setCompleted] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const [readingLesson, setReadingLesson] = useState<any>(null)
  const [readingId, setReadingId] = useState<string | null>(null)
  const [loadingReading, setLoadingReading] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({})
  const [quizSubmitted, setQuizSubmitted] = useState<string[]>([])
  const [lessonCache, setLessonCache] = useState<{[key: string]: any}>({})
  const [hover, setHover] = useState<string | null>(null)
  const router = useRouter()
  const msgInterval = useRef<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/dashboard/children'); return }
    const childData = JSON.parse(stored)
    setChild(childData)

    const cachedPlan = localStorage.getItem('cachedPlan')
    const cachedPlanChild = localStorage.getItem('cachedPlanChild')
    const cachedTimestamp = localStorage.getItem('cachedPlanTimestamp')
    const isExpired = cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) > 7 * 24 * 60 * 60 * 1000

    const cachedLessons = localStorage.getItem('cachedLessons')
    if (cachedLessons) setLessonCache(JSON.parse(cachedLessons))

    if (cachedPlan && cachedPlanChild === childData.name + childData.city && !isExpired) {
      const p = JSON.parse(cachedPlan)
      setPlan(p)
      setLoading(false)
      prefetchLessons(p, childData, cachedLessons ? JSON.parse(cachedLessons) : {})
    } else {
      generatePlan(childData)
    }
  }, [])

  async function prefetchLessons(plan: any, childData: any, existingCache: any) {
    const allLessons: {id: string, lesson: any}[] = []
    plan.days.forEach((day: any) => {
      day.lessons.forEach((lesson: any, i: number) => {
        const id = `${day.day}-${i}`
        if (!existingCache[id]) allLessons.push({ id, lesson })
      })
    })
    if (allLessons.length === 0) return

    for (const { id, lesson } of allLessons) {
      try {
        const res = await fetch('/api/generate-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: lesson.subject,
            title: lesson.title,
            age_group: childData.age_group,
            city: childData.city,
            curriculum: childData.curriculum
          })
        })
        const data = await res.json()
        if (data.material) {
          setLessonCache(prev => {
            const updated = { ...prev, [id]: data.material }
            localStorage.setItem('cachedLessons', JSON.stringify(updated))
            return updated
          })
        }
      } catch (e) {
        console.error('Prefetch failed for', id, e)
      }
      await new Promise(r => setTimeout(r, 500))
    }
  }

  async function generatePlan(childData: any) {
    setLoading(true)
    msgInterval.current = setInterval(() => {
      setLoadingMsg(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childData)
      })
      if (!res.ok) throw new Error('Failed')
      if (!res.body) throw new Error('No body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }
      const cleaned = fullText.replace(/```json|```/g, '').trim()
      const p = JSON.parse(cleaned)
      setPlan(p)
      localStorage.setItem('cachedPlan', JSON.stringify(p))
      localStorage.setItem('cachedPlanChild', childData.name + childData.city)
      localStorage.setItem('cachedPlanTimestamp', Date.now().toString())
      localStorage.removeItem('cachedLessons')
      setLessonCache({})
      prefetchLessons(p, childData, {})
    } catch (e) {
      console.error(e)
    } finally {
      clearInterval(msgInterval.current)
      setLoading(false)
    }
  }

  async function loadReading(id: string, lesson: any) {
    if (lessonCache[id]) { setReadingLesson(lessonCache[id]); setReadingId(id); return }
    if (loadingReading) return
    setLoadingReading(id)
    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: lesson.subject, title: lesson.title,
          age_group: child?.age_group, city: child?.city, curriculum: child?.curriculum
        })
      })
      const data = await res.json()
      if (data.material) {
        setLessonCache(prev => {
          const updated = { ...prev, [id]: data.material }
          localStorage.setItem('cachedLessons', JSON.stringify(updated))
          return updated
        })
        setReadingLesson(data.material)
        setReadingId(id)
      }
    } catch (e) { console.error(e) }
    finally { setLoadingReading(null) }
  }

  function toggleExpand(id: string) {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleComplete(id: string) {
    setCompleted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/auth')
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const totalLessons = plan ? plan.days.reduce((acc: number, d: any) => acc + d.lessons.length, 0) : 0
  const activeDay_ = plan?.days?.find((d: any) => d.day === activeDay)

  const subjectColors: any = {
    'Math': '#74B9F0', 'Science': '#6DCFA0', 'Language Arts': '#F0A868',
    'History': '#B8A0D8', 'Geography': '#74B9F0', 'Art': '#F08080',
    'Music': '#F0C068', 'Physical Education': '#6DCFA0', 'Coding': '#74B9F0',
    'Life Skills': '#A0C878'
  }

  const btn = (id: string, base: React.CSSProperties, hoverStyle: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hoverStyle : {}), transition: 'all 0.15s ease', cursor: 'pointer'
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>
      <div style={{ width: 64, height: 64, border: `5px solid ${PRIMARY_BORDER}`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: TEXT, margin: '0 0 8px 0' }}>Creating your week plan...</h2>
        <p style={{ color: TEXT_MUTED, fontSize: 15, margin: '0 0 4px 0', animation: 'pulse 2.5s ease infinite' }}>{LOADING_MESSAGES[loadingMsg]}</p>
        <p style={{ color: BEIGE_BORDER, fontSize: 13, margin: 0 }}>Crafting lessons for {child?.name} in {child?.city} ✨</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>
      <style>{`
        @media print { .no-print { display: none !important; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {readingLesson && readingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: 32, maxWidth: 720, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', animation: 'fadeIn 0.2s ease', border: `2px solid ${BEIGE_BORDER}` }}>
            <button onClick={() => { setReadingLesson(null); setReadingId(null); setQuizAnswers({}); setQuizSubmitted([]) }}
              onMouseEnter={() => setHover('close')} onMouseLeave={() => setHover(null)}
              style={btn('close', { position: 'absolute', top: 16, right: 16, background: BEIGE, border: `2px solid ${BEIGE_BORDER}`, borderRadius: '50%', width: 36, height: 36, fontSize: 16, color: TEXT_MUTED }, { background: BEIGE_BORDER })}>✕</button>

            <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>📖 Read & Learn</div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: TEXT, marginBottom: 24 }}>{readingLesson.reading_title}</h2>

            <div style={{ background: BEIGE, borderRadius: 16, padding: 24, marginBottom: 20, border: `2px solid ${BEIGE_BORDER}` }}>
              {readingLesson.reading_text?.split('\n\n').map((para: string, i: number) => (
                <p key={i} style={{ fontSize: 16, color: TEXT, lineHeight: 1.8, margin: '0 0 12px 0' }}>{para}</p>
              ))}
            </div>

            {readingLesson.did_you_know && (
              <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 20, border: '2px solid #FDE68A' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>⚡ Did you know?</div>
                <p style={{ fontSize: 15, color: '#92400E', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>{readingLesson.did_you_know}</p>
              </div>
            )}

            {readingLesson.concept_explanation && (
              <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 16, marginBottom: 20, border: `2px solid ${PRIMARY_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>🧠 Why does this work?</div>
                <p style={{ fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.7 }}>{readingLesson.concept_explanation}</p>
              </div>
            )}

            {readingLesson.real_world_examples?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>🌍 Real world examples</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {readingLesson.real_world_examples.map((ex: string, i: number) => (
                    <div key={i} style={{ background: '#F0FDF8', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', border: `1px solid #C6F0E0` }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>🔹</span>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{ex}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {readingLesson.step_by_step?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>📋 Step by step</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {readingLesson.step_by_step.map((step: string, i: number) => (
                    <div key={i} style={{ background: PRIMARY_BG, borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', border: `1px solid ${PRIMARY_BORDER}` }}>
                      <span style={{ background: PRIMARY, color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{step.replace(/^Step \d+:\s*/i, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {readingLesson.quiz?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>🧠 Check your understanding</div>
                {readingLesson.quiz.map((q: any, qi: number) => {
                  const qid = `${readingId}-${qi}`
                  const isSubmitted = quizSubmitted.includes(readingId!)
                  const userAnswer = quizAnswers[qid]
                  return (
                    <div key={qi} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{qi + 1}. {q.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options.map((opt: string, oi: number) => {
                          let bg = BEIGE_CARD, border = BEIGE_BORDER, color = TEXT_MUTED
                          if (!isSubmitted && userAnswer === oi) { bg = PRIMARY_BG; border = PRIMARY; color = PRIMARY_DARK }
                          if (isSubmitted && oi === q.correct) { bg = '#F0FDF8'; border = GREEN; color = GREEN_DARK }
                          if (isSubmitted && userAnswer === oi && oi !== q.correct) { bg = '#FFF1F2'; border = '#F87171'; color = '#DC2626' }
                          return (
                            <button key={oi} onClick={() => !isSubmitted && setQuizAnswers(prev => ({ ...prev, [qid]: oi }))}
                              onMouseEnter={() => !isSubmitted && setHover(`opt-${qid}-${oi}`)}
                              onMouseLeave={() => setHover(null)}
                              style={{ ...btn(`opt-${qid}-${oi}`, { padding: '12px 16px', borderRadius: 12, border: `2px solid ${border}`, background: bg, color, fontSize: 14, fontWeight: 600, textAlign: 'left', fontFamily: 'inherit' }, { filter: 'brightness(0.96)' }), cursor: isSubmitted ? 'default' : 'pointer' }}>
                              {isSubmitted && oi === q.correct && '✓ '}{isSubmitted && userAnswer === oi && oi !== q.correct && '✗ '}{opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {!quizSubmitted.includes(readingId!) ? (
                  <button onClick={() => setQuizSubmitted(prev => [...prev, readingId!])}
                    onMouseEnter={() => setHover('submit')} onMouseLeave={() => setHover(null)}
                    style={btn('submit', { padding: '12px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
                    Submit answers →
                  </button>
                ) : (
                  <div style={{ background: '#F0FDF8', borderRadius: 12, padding: 16, marginTop: 8, border: `2px solid ${GREEN}` }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: GREEN_DARK, margin: 0 }}>
                      Score: {readingLesson.quiz.filter((q: any, qi: number) => quizAnswers[`${readingId}-${qi}`] === q.correct).length} / {readingLesson.quiz.length} 🎉
                    </p>
                  </div>
                )}
              </div>
            )}

            {readingLesson.activity && (
              <div style={{ background: '#F0FDF8', borderRadius: 14, padding: 16, marginBottom: 16, border: `2px solid #C6F0E0` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>🏃 Try it yourself</div>
                <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{readingLesson.activity}</p>
              </div>
            )}
            {readingLesson.parent_tip && (
              <div style={{ background: '#FFF7ED', borderLeft: `4px solid #F0A868`, borderRadius: '0 12px 12px 0', padding: '10px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C27830', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>👨‍👩‍👧 Parent tip</div>
                <p style={{ fontSize: 13, color: '#6B5A3E', margin: 0 }}>{readingLesson.parent_tip}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="no-print" style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🧭</span>
          <div>
            <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: TEXT }}>Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
            <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{child?.name} · {child?.city}, {child?.country}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['children','journal','worksheets'].map(page => (
            <button key={page} onClick={() => router.push(`/${page === 'children' ? 'dashboard/children' : page}`)}
              onMouseEnter={() => setHover(`nav-${page}`)} onMouseLeave={() => setHover(null)}
              style={btn(`nav-${page}`, { padding: '8px 16px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { background: BEIGE, borderColor: PRIMARY, color: PRIMARY_DARK })}>
              {page === 'children' ? '👨‍👧 Children' : page === 'journal' ? '📖 Journal' : '📄 Worksheets'}
            </button>
          ))}
          <button onClick={() => window.print()}
            onMouseEnter={() => setHover('print')} onMouseLeave={() => setHover(null)}
            style={btn('print', { padding: '8px 16px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: PRIMARY_DARK, fontFamily: 'inherit' }, { background: PRIMARY_BG, borderColor: PRIMARY })}>
            🖨️ Print
          </button>
          <button onClick={() => { localStorage.removeItem('cachedPlan'); localStorage.removeItem('cachedPlanChild'); localStorage.removeItem('cachedLessons'); router.push('/dashboard/children') }}
            onMouseEnter={() => setHover('newplan')} onMouseLeave={() => setHover(null)}
            style={btn('newplan', { padding: '8px 16px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
            + New plan
          </button>
          <button onClick={handleLogout}
            onMouseEnter={() => setHover('logout')} onMouseLeave={() => setHover(null)}
            style={btn('logout', { padding: '8px 16px', borderRadius: 100, border: '2px solid #F87171', background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: '#F87171', fontFamily: 'inherit' }, { background: '#FFF1F2' })}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        {plan?.week_theme && (
          <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, #B8A0D8)`, borderRadius: 20, padding: '20px 24px', marginBottom: 24, color: 'white' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>This week's theme</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, marginTop: 4 }}>{plan.week_theme}</div>
          </div>
        )}

        <div className="no-print" style={{ background: BEIGE_CARD, borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: `2px solid ${BEIGE_BORDER}`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600, marginBottom: 6 }}>{completed.length} of {totalLessons} lessons completed</div>
            <div style={{ height: 8, background: BEIGE, borderRadius: 100, overflow: 'hidden', border: `1px solid ${BEIGE_BORDER}` }}>
              <div style={{ height: '100%', width: `${totalLessons ? (completed.length / totalLessons) * 100 : 0}%`, background: GREEN, borderRadius: 100, transition: 'width 0.3s' }}/>
            </div>
          </div>
          <div style={{ fontSize: 28 }}>{completed.length === totalLessons && totalLessons > 0 ? '🎉' : '📚'}</div>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
          {days.map(day => {
            const dayData = plan?.days?.find((d: any) => d.day === day)
            const dayLessons = dayData?.lessons || []
            const dayCompleted = dayLessons.filter((_: any, i: number) => completed.includes(`${day}-${i}`)).length
            const isActive = activeDay === day
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                onMouseEnter={() => setHover(`day-${day}`)} onMouseLeave={() => setHover(null)}
                style={btn(`day-${day}`,
                  { padding: '10px 18px', borderRadius: 100, border: `2px solid ${isActive ? PRIMARY : BEIGE_BORDER}`, background: isActive ? PRIMARY : BEIGE_CARD, color: isActive ? 'white' : TEXT_MUTED, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'inherit' },
                  { borderColor: PRIMARY, color: isActive ? 'white' : PRIMARY_DARK, background: isActive ? PRIMARY_DARK : PRIMARY_BG }
                )}>
                {day} {dayCompleted === dayLessons.length && dayLessons.length > 0 ? '✓' : ''}
              </button>
            )
          })}
        </div>

        {activeDay_ && (
          <div>
            {activeDay_.focus && (
              <p style={{ color: TEXT_MUTED, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>📍 {activeDay_.focus}</p>
            )}
            {activeDay_.lessons.map((lesson: any, i: number) => {
              const id = `${activeDay}-${i}`
              const done = completed.includes(id)
              const isExpanded = expanded.includes(id)
              const color = subjectColors[lesson.subject] || PRIMARY
              const isCached = !!lessonCache[id]

              return (
                <div key={i} style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, marginBottom: 16, border: `2px solid ${done ? GREEN : BEIGE_BORDER}`, opacity: done ? 0.85 : 1, animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 100, background: `${color}22`, color: color, fontSize: 12, fontWeight: 700 }}>{lesson.subject}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isCached && <span style={{ fontSize: 11, color: GREEN_DARK, fontWeight: 700 }}>✓ Ready</span>}
                      <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>⏱ {lesson.duration}</span>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 19, color: TEXT, marginBottom: 10 }}>{lesson.title}</h3>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {lesson.milestone && <span style={{ padding: '4px 10px', borderRadius: 100, background: '#FFFBEB', color: '#D97706', fontSize: 11, fontWeight: 700 }}>🎯 {lesson.milestone}</span>}
                    {lesson.method && <span style={{ padding: '4px 10px', borderRadius: 100, background: BEIGE, color: TEXT_MUTED, fontSize: 11, fontWeight: 700 }}>🏛 {lesson.method}</span>}
                    {lesson.materials && <span style={{ padding: '4px 10px', borderRadius: 100, background: '#F0FDF8', color: GREEN_DARK, fontSize: 11, fontWeight: 700 }}>🧰 {lesson.materials}</span>}
                  </div>

                  {lesson.goal && (
                    <div style={{ background: PRIMARY_BG, borderRadius: 12, padding: '12px 16px', marginBottom: 12, border: `2px solid ${PRIMARY_BORDER}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>🎯 Goal</div>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{lesson.goal}</p>
                    </div>
                  )}

                  <button onClick={() => loadReading(id, lesson)} disabled={loadingReading === id}
                    onMouseEnter={() => setHover(`read-${id}`)} onMouseLeave={() => setHover(null)}
                    style={btn(`read-${id}`, { width: '100%', padding: '11px', borderRadius: 12, border: `2px solid ${PRIMARY}`, background: PRIMARY_BG, color: PRIMARY_DARK, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', marginBottom: 10 }, { background: PRIMARY, color: 'white' })}>
                    {loadingReading === id ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span style={{ width: 14, height: 14, border: `2px solid ${PRIMARY_BORDER}`, borderTopColor: PRIMARY_DARK, borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                        Loading...
                      </span>
                    ) : isCached ? '📖 Read & Learn ⚡' : '📖 Read & Learn'}
                  </button>

                  <button onClick={() => toggleExpand(id)}
                    onMouseEnter={() => setHover(`exp-${id}`)} onMouseLeave={() => setHover(null)}
                    style={btn(`exp-${id}`, { width: '100%', padding: '10px', borderRadius: 12, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE, color: PRIMARY_DARK, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', marginBottom: 10 }, { borderColor: PRIMARY, background: PRIMARY_BG })}>
                    {isExpanded ? '▲ Hide lesson details' : '▼ Show lesson details'}
                  </button>

                  {isExpanded && (
                    <div style={{ marginBottom: 12 }}>
                      {lesson.activity && (
                        <div style={{ background: '#F0FDF8', borderRadius: 14, padding: 16, marginBottom: 12, border: `1px solid #C6F0E0` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>🏃 Activity</div>
                          <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, margin: 0 }}>{lesson.activity}</p>
                        </div>
                      )}
                      {lesson.reflection && (
                        <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 12, border: `1px solid #FDE68A` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>💬 Reflection</div>
                          <p style={{ fontSize: 14, color: '#6B5A3E', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{lesson.reflection}"</p>
                        </div>
                      )}
                      {lesson.local_tip && (
                        <div style={{ background: PRIMARY_BG, borderLeft: `4px solid ${PRIMARY}`, borderRadius: '0 12px 12px 0', padding: '10px 14px', marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>📍 Local tip — {child?.city}</div>
                          <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>{lesson.local_tip}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={() => toggleComplete(id)}
                    onMouseEnter={() => setHover(`done-${id}`)} onMouseLeave={() => setHover(null)}
                    style={btn(`done-${id}`, { width: '100%', padding: '12px', borderRadius: 12, border: `2px solid ${done ? GREEN : BEIGE_BORDER}`, background: done ? '#F0FDF8' : BEIGE_CARD, color: done ? GREEN_DARK : TEXT_MUTED, fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: done ? GREEN_DARK : PRIMARY, background: done ? '#E0FAF0' : PRIMARY_BG })}>
                    {done ? '✓ Completed!' : '○ Mark as completed'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
