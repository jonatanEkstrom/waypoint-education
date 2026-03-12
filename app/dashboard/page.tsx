'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function DashboardPage() {
  const [child, setChild] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState('Monday')
  const [completed, setCompleted] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const [readingLesson, setReadingLesson] = useState<any>(null)
  const [readingId, setReadingId] = useState<string | null>(null)
  const [loadingReading, setLoadingReading] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({})
  const [quizSubmitted, setQuizSubmitted] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/dashboard/children'); return }
    const childData = JSON.parse(stored)
    setChild(childData)

    const cachedPlan = localStorage.getItem('cachedPlan')
    const cachedPlanChild = localStorage.getItem('cachedPlanChild')

    if (cachedPlan && cachedPlanChild === childData.name + childData.city) {
      setPlan(JSON.parse(cachedPlan))
      setLoading(false)
    } else {
      generatePlan(childData)
    }
  }, [])

  async function generatePlan(childData: any) {
    setLoading(true)
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
      const plan = JSON.parse(cleaned)
      setPlan(plan)
      localStorage.setItem('cachedPlan', JSON.stringify(plan))
      localStorage.setItem('cachedPlanChild', childData.name + childData.city)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadReading(id: string, lesson: any) {
    if (loadingReading) return
    setLoadingReading(id)
    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: lesson.subject,
          title: lesson.title,
          age_group: child?.age_group,
          city: child?.city,
          curriculum: child?.curriculum
        })
      })
      const data = await res.json()
      if (data.material) {
        setReadingLesson(data.material)
        setReadingId(id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingReading(null)
    }
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
    'Math': '#0D9488', 'Science': '#059669', 'Language Arts': '#D97706',
    'History': '#7C3AED', 'Geography': '#2563EB', 'Art': '#DB2777',
    'Music': '#EA580C', 'Physical Education': '#16A34A', 'Coding': '#0891B2',
    'Life Skills': '#65A30D'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🧭</div>
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#1E1B2E' }}>Creating your week plan...</h2>
      <p style={{ color: '#8B87A8', fontSize: 15 }}>Claude is crafting lessons just for {child?.name} in {child?.city} ✨</p>
      <p style={{ color: '#B8B4D0', fontSize: 13 }}>This takes about 15 seconds</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6FF' }}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Reading modal */}
      {readingLesson && readingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16, overflowY: 'auto'
        }}>
          <div style={{
            background: 'white', borderRadius: 24, padding: 32,
            maxWidth: 680, width: '100%', maxHeight: '90vh',
            overflowY: 'auto', position: 'relative'
          }}>
            <button onClick={() => { setReadingLesson(null); setReadingId(null); setQuizAnswers({}); setQuizSubmitted([]) }}
              style={{ position: 'absolute', top: 16, right: 16, background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18 }}>
              ✕
            </button>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#635BFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>📖 Read & Learn</div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#1E1B2E', marginBottom: 24 }}>{readingLesson.reading_title}</h2>

            {/* Reading text */}
            <div style={{ background: '#F8F6FF', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              {readingLesson.reading_text?.split('\n\n').map((para: string, i: number) => (
                <p key={i} style={{ fontSize: 16, color: '#1E1B2E', lineHeight: 1.8, marginBottom: 12, margin: '0 0 12px 0' }}>{para}</p>
              ))}
            </div>

            {/* Quiz */}
            {readingLesson.quiz && readingLesson.quiz.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#635BFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>🧠 Check your understanding</div>
                {readingLesson.quiz.map((q: any, qi: number) => {
                  const qid = `${readingId}-${qi}`
                  const isSubmitted = quizSubmitted.includes(readingId!)
                  const userAnswer = quizAnswers[qid]
                  return (
                    <div key={qi} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1B2E', marginBottom: 10 }}>{qi + 1}. {q.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options.map((opt: string, oi: number) => {
                          let bg = 'white'
                          let border = '#E4E0F5'
                          let color = '#4B5563'
                          if (!isSubmitted && userAnswer === oi) { bg = '#E8E6FF'; border = '#635BFF'; color = '#635BFF' }
                          if (isSubmitted && oi === q.correct) { bg = '#ECFDF5'; border = '#10B981'; color = '#059669' }
                          if (isSubmitted && userAnswer === oi && oi !== q.correct) { bg = '#FFF1F2'; border = '#F43F5E'; color = '#E11D48' }
                          return (
                            <button key={oi}
                              onClick={() => !isSubmitted && setQuizAnswers(prev => ({ ...prev, [qid]: oi }))}
                              style={{ padding: '12px 16px', borderRadius: 12, border: `2px solid ${border}`, background: bg, color, cursor: isSubmitted ? 'default' : 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'left', fontFamily: 'inherit' }}>
                              {isSubmitted && oi === q.correct && '✓ '}{isSubmitted && userAnswer === oi && oi !== q.correct && '✗ '}{opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {!quizSubmitted.includes(readingId!) ? (
                  <button
                    onClick={() => setQuizSubmitted(prev => [...prev, readingId!])}
                    style={{ padding: '12px 24px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Submit answers →
                  </button>
                ) : (
                  <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 16, marginTop: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#059669', margin: 0 }}>
                      Score: {readingLesson.quiz.filter((q: any, qi: number) => quizAnswers[`${readingId}-${qi}`] === q.correct).length} / {readingLesson.quiz.length} 🎉
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Activity */}
            {readingLesson.activity && (
              <div style={{ background: '#F0FDF4', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>🏃 Try it yourself</div>
                <p style={{ fontSize: 14, color: '#1E1B2E', margin: 0, lineHeight: 1.7 }}>{readingLesson.activity}</p>
              </div>
            )}

            {/* Parent tip */}
            {readingLesson.parent_tip && (
              <div style={{ background: '#FFF7ED', borderLeft: '3px solid #EA580C', borderRadius: '0 12px 12px 0', padding: '10px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>👨‍👩‍👧 Parent tip</div>
                <p style={{ fontSize: 13, color: '#4B5563', margin: 0 }}>{readingLesson.parent_tip}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="no-print" style={{ background: 'white', borderBottom: '2px solid #E4E0F5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🧭</span>
          <div>
            <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#1E1B2E' }}>Waypoint <span style={{ color: '#635BFF' }}>Education</span></span>
            <div style={{ fontSize: 12, color: '#8B87A8', fontWeight: 600 }}>{child?.name} · {child?.city}, {child?.country}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/dashboard/children')} style={{ padding: '8px 16px', borderRadius: 100, border: '2px solid #E4E0F5', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#8B87A8', fontFamily: 'inherit' }}>👨‍👧 Children</button>
          <button onClick={() => router.push('/journal')} style={{ padding: '8px 16px', borderRadius: 100, border: '2px solid #E4E0F5', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#8B87A8', fontFamily: 'inherit' }}>📖 Journal</button>
          <button onClick={() => router.push('/worksheets')} style={{ padding: '8px 16px', borderRadius: 100, border: '2px solid #E4E0F5', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#8B87A8', fontFamily: 'inherit' }}>📄 Worksheets</button>
          <button onClick={() => window.print()} style={{ padding: '8px 16px', borderRadius: 100, border: '2px solid #E4E0F5', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#635BFF', fontFamily: 'inherit' }}>🖨️ Print</button>
          <button onClick={() => { localStorage.removeItem('cachedPlan'); localStorage.removeItem('cachedPlanChild'); router.push('/dashboard/children') }} style={{ padding: '8px 16px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>+ New plan</button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: 100, border: '2px solid #F43F5E', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#F43F5E', fontFamily: 'inherit' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>

        {plan?.week_theme && (
          <div style={{ background: 'linear-gradient(135deg, #635BFF, #8B5CF6)', borderRadius: 20, padding: '20px 24px', marginBottom: 24, color: 'white' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>This week's theme</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, marginTop: 4 }}>{plan.week_theme}</div>
          </div>
        )}

        <div className="no-print" style={{ background: 'white', borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: '2px solid #E4E0F5', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#8B87A8', fontWeight: 600, marginBottom: 6 }}>{completed.length} of {totalLessons} lessons completed</div>
            <div style={{ height: 8, background: '#F3F4F6', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${totalLessons ? (completed.length / totalLessons) * 100 : 0}%`, background: '#10B981', borderRadius: 100, transition: 'width 0.3s' }}/>
            </div>
          </div>
          <div style={{ fontSize: 28 }}>{completed.length === totalLessons && totalLessons > 0 ? '🎉' : '📚'}</div>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
          {days.map(day => {
            const dayData = plan?.days?.find((d: any) => d.day === day)
            const dayLessons = dayData?.lessons || []
            const dayCompleted = dayLessons.filter((_: any, i: number) => completed.includes(`${day}-${i}`)).length
            return (
              <button key={day} onClick={() => setActiveDay(day)} style={{ padding: '10px 18px', borderRadius: 100, border: `2px solid ${activeDay === day ? '#635BFF' : '#E4E0F5'}`, background: activeDay === day ? '#635BFF' : 'white', color: activeDay === day ? 'white' : '#8B87A8', cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                {day} {dayCompleted === dayLessons.length && dayLessons.length > 0 ? '✓' : ''}
              </button>
            )
          })}
        </div>

        {activeDay_ && (
          <div>
            {activeDay_.focus && (
              <p style={{ color: '#8B87A8', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>📍 {activeDay_.focus}</p>
            )}
            {activeDay_.lessons.map((lesson: any, i: number) => {
              const id = `${activeDay}-${i}`
              const done = completed.includes(id)
              const isExpanded = expanded.includes(id)
              const color = subjectColors[lesson.subject] || '#635BFF'

              return (
                <div key={i} style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 16, border: `2px solid ${done ? '#10B981' : '#E4E0F5'}`, opacity: done ? 0.85 : 1 }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 100, background: `${color}20`, color: color, fontSize: 12, fontWeight: 700 }}>{lesson.subject}</span>
                    <span style={{ fontSize: 12, color: '#8B87A8', fontWeight: 600 }}>⏱ {lesson.duration}</span>
                  </div>

                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 19, color: '#1E1B2E', marginBottom: 10 }}>{lesson.title}</h3>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {lesson.milestone && <span style={{ padding: '4px 10px', borderRadius: 100, background: '#FEF3C7', color: '#D97706', fontSize: 11, fontWeight: 700 }}>🎯 {lesson.milestone}</span>}
                    {lesson.method && <span style={{ padding: '4px 10px', borderRadius: 100, background: '#F3F4F6', color: '#6B7280', fontSize: 11, fontWeight: 700 }}>🏛 {lesson.method}</span>}
                    {lesson.materials && <span style={{ padding: '4px 10px', borderRadius: 100, background: '#F0FDF4', color: '#059669', fontSize: 11, fontWeight: 700 }}>🧰 {lesson.materials}</span>}
                  </div>

                  {lesson.goal && (
                    <div style={{ background: '#EEF2FF', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#635BFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>🎯 Goal</div>
                      <p style={{ fontSize: 14, color: '#1E1B2E', margin: 0, lineHeight: 1.6 }}>{lesson.goal}</p>
                    </div>
                  )}

                  {/* Read & Learn button */}
                  <button
                    onClick={() => loadReading(id, lesson)}
                    disabled={loadingReading === id}
                    style={{ width: '100%', padding: '11px', borderRadius: 12, border: '2px solid #635BFF', background: '#E8E6FF', color: '#635BFF', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', marginBottom: 10 }}>
                    {loadingReading === id ? '✨ Loading reading...' : '📖 Read & Learn'}
                  </button>

                  <button onClick={() => toggleExpand(id)} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '2px solid #E4E0F5', background: '#F8F6FF', color: '#635BFF', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', marginBottom: 10 }}>
                    {isExpanded ? '▲ Hide lesson details' : '▼ Show lesson details'}
                  </button>

                  {isExpanded && (
                    <div style={{ marginBottom: 12 }}>
                      {lesson.activity && (
                        <div style={{ background: '#F0FDF4', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>🏃 Activity</div>
                          <p style={{ fontSize: 14, color: '#1E1B2E', lineHeight: 1.7, margin: 0 }}>{lesson.activity}</p>
                        </div>
                      )}
                      {lesson.reflection && (
                        <div style={{ background: '#FEF9EE', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>💬 Reflection</div>
                          <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{lesson.reflection}"</p>
                        </div>
                      )}
                      {lesson.local_tip && (
                        <div style={{ background: '#F8F6FF', borderLeft: '3px solid #635BFF', borderRadius: '0 12px 12px 0', padding: '10px 14px', marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#635BFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>📍 Local tip — {child?.city}</div>
                          <p style={{ fontSize: 13, color: '#4B5563', margin: 0 }}>{lesson.local_tip}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={() => toggleComplete(id)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: `2px solid ${done ? '#10B981' : '#E4E0F5'}`, background: done ? '#ECFDF5' : 'white', color: done ? '#10B981' : '#8B87A8', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>
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
