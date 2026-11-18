'use client'
import { useState } from 'react'
import Link from 'next/link'

const PRIMARY = '#9B8EC4'
const PRIMARY_BG = '#F0EBF9'
const PRIMARY_BORDER = '#DDD0F0'
const BEIGE = '#FAF7F2'
const BEIGE_BORDER = '#E8E2D9'
const GREEN = '#A8D5BA'
const GREEN_DARK = '#6AAF8A'
const GREEN_BG = '#EDF7F2'
const GREEN_BORDER = '#D5F0E3'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

export type QuizItem = { question: string; options: string[]; answer_index: number; explanation: string }

export type LessonData = {
  concept_id: string
  concept_name: string
  nc_reference?: string
  stage: number
  stage_name: string
  progress: { concept_number: number; total_concepts: number; lessons_per_concept: number; concepts_completed: number }
  reading_title: string
  introduction?: string
  main_content?: string
  example?: string
  activity?: { title: string; materials?: string; time?: string; description: string } | null
  mission?: { title: string; description: string; record?: string } | null
  quiz?: QuizItem[]
  discussion_questions?: string[]
  fun_fact?: string
  parent_tip?: string
  journal_prompt?: string
}

const STAGE_EMOJI: Record<string, string> = { Discover: '🧭', Practise: '🎯', Explore: '🗺️' }

const label = (color: string): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
})

function Quiz({ items, onScore }: { items: QuizItem[]; onScore: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const answered = Object.keys(answers).length
  const score = items.reduce((n, q, i) => n + (answers[i] === q.answer_index ? 1 : 0), 0)

  function choose(qi: number, oi: number) {
    if (answers[qi] !== undefined) return
    const next = { ...answers, [qi]: oi }
    setAnswers(next)
    if (Object.keys(next).length === items.length) {
      onScore(items.reduce((n, q, i) => n + (next[i] === q.answer_index ? 1 : 0), 0))
    }
  }

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
      <div style={label(PRIMARY)}>✏️ Quick check · {answered}/{items.length}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((q, qi) => {
          const picked = answers[qi]
          return (
            <div key={qi}>
              <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 8px 0', lineHeight: 1.5 }}>{qi + 1}. {q.question}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi
                  const isRight = oi === q.answer_index
                  const show = picked !== undefined
                  const bg = show && isRight ? GREEN_BG : show && isPicked ? '#FEF2F2' : BEIGE
                  const border = show && isRight ? GREEN_DARK : show && isPicked ? '#F4A7A7' : BEIGE_BORDER
                  return (
                    <button key={oi} onClick={() => choose(qi, oi)} disabled={show}
                      style={{ padding: '10px 14px', borderRadius: 12, border: `2px solid ${border}`, background: bg, color: TEXT, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: show ? 'default' : 'pointer', textAlign: 'left', minHeight: 44 }}>
                      {show && isRight ? '✓ ' : show && isPicked ? '✗ ' : ''}{opt}
                    </button>
                  )
                })}
              </div>
              {picked !== undefined && q.explanation && (
                <p style={{ fontSize: 13, color: picked === q.answer_index ? GREEN_DARK : '#B45309', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                  {picked === q.answer_index ? 'Great! ' : 'Not quite. '}{q.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>
      {answered === items.length && (
        <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12, background: score === items.length ? GREEN_BG : PRIMARY_BG, fontSize: 14, fontWeight: 700, color: TEXT }}>
          {score === items.length ? '🌟 Perfect score! ' : score >= items.length / 2 ? '👏 Well done! ' : '💪 Good try — '}
          {score}/{items.length} correct.
          {score < items.length / 2 && ' Have another look at the lesson together before moving on.'}
        </div>
      )}
    </div>
  )
}

export default function LessonView({ lesson, isMobile, completing, onComplete }: {
  lesson: LessonData
  isMobile: boolean
  completing: boolean
  onComplete: (quizScore: number | null, quizTotal: number) => void
}) {
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const quiz = lesson.quiz ?? []
  const p = lesson.progress
  const lessonNumber = (p.concept_number - 1) * p.lessons_per_concept + lesson.stage
  const totalLessons = p.total_concepts * p.lessons_per_concept
  const pct = Math.round(((lessonNumber - 1) / totalLessons) * 100)

  return (
    <div>
      {/* Stage + progress */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ padding: '4px 12px', borderRadius: 100, background: PRIMARY, color: 'white', fontSize: 12, fontWeight: 700 }}>
          {STAGE_EMOJI[lesson.stage_name] ?? '📘'} Lesson {lesson.stage} of {p.lessons_per_concept} · {lesson.stage_name}
        </span>
        <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>
          Topic {p.concept_number} of {p.total_concepts}: {lesson.concept_name}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 100, background: BEIGE_BORDER, overflow: 'hidden', marginBottom: 18 }} aria-label={`${pct}% of this subject complete`}>
        <div style={{ width: `${pct}%`, height: '100%', background: GREEN_DARK }} />
      </div>

      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: '0 0 6px 0' }}>{lesson.reading_title}</h2>
      {lesson.nc_reference && (
        <p style={{ fontSize: 12, color: TEXT_MUTED, margin: '0 0 18px 0' }}>📎 {lesson.nc_reference}</p>
      )}

      {lesson.introduction && (
        <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
          <div style={label(PRIMARY)}>🎯 Let&apos;s begin</div>
          <p style={{ fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.75 }}>{lesson.introduction}</p>
        </div>
      )}

      {lesson.main_content && (
        <div style={{ background: BEIGE, borderRadius: 14, padding: 20, marginBottom: 16, border: `2px solid ${BEIGE_BORDER}` }}>
          <div style={label(TEXT_MUTED)}>📚 The lesson</div>
          {lesson.main_content.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontSize: 15, color: TEXT, lineHeight: 1.8, margin: '0 0 10px 0' }}>{para}</p>
          ))}
        </div>
      )}

      {lesson.example && (
        <div style={{ background: GREEN_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${GREEN_BORDER}` }}>
          <div style={label(GREEN_DARK)}>💡 Example</div>
          {lesson.example.split('\n').filter(Boolean).map((line, i) => (
            <p key={i} style={{ fontSize: 15, color: TEXT, margin: '0 0 6px 0', lineHeight: 1.75 }}>{line}</p>
          ))}
        </div>
      )}

      {lesson.activity && (
        <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
          <div style={label(PRIMARY)}>🏃 Activity — {lesson.activity.title}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            {lesson.activity.time && <span style={{ padding: '3px 10px', borderRadius: 100, background: PRIMARY, color: 'white', fontSize: 11, fontWeight: 700 }}>⏱ {lesson.activity.time}</span>}
            {lesson.activity.materials && <span style={{ padding: '3px 10px', borderRadius: 100, background: GREEN_BG, color: GREEN_DARK, fontSize: 11, fontWeight: 700, border: `1px solid ${GREEN_BORDER}` }}>🧰 {lesson.activity.materials}</span>}
          </div>
          <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{lesson.activity.description}</p>
        </div>
      )}

      {lesson.mission && (
        <div style={{ background: 'linear-gradient(135deg, #FFF7E6, #FDEBD3)', borderRadius: 14, padding: 18, marginBottom: 16, border: '2px solid #F5D9A8' }}>
          <div style={label('#B7791F')}>🗺️ Explorer mission — {lesson.mission.title}</div>
          <p style={{ fontSize: 15, color: TEXT, margin: '0 0 8px 0', lineHeight: 1.7 }}>{lesson.mission.description}</p>
          {lesson.mission.record && <p style={{ fontSize: 13, color: '#8A5A12', margin: 0, fontWeight: 600 }}>📝 Bring back: {lesson.mission.record}</p>}
        </div>
      )}

      {quiz.length > 0 && <Quiz items={quiz} onScore={setQuizScore} />}

      {lesson.discussion_questions && lesson.discussion_questions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={label(TEXT_MUTED)}>💬 Talk together</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lesson.discussion_questions.map((q, i) => (
              <div key={i} style={{ background: BEIGE, borderRadius: 12, padding: '12px 16px', border: `2px solid ${BEIGE_BORDER}`, fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{q}</div>
            ))}
          </div>
        </div>
      )}

      {lesson.fun_fact && (
        <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 16, border: '2px solid #FDE68A' }}>
          <div style={label('#D97706')}>⚡ Fun fact</div>
          <p style={{ fontSize: 15, color: '#92400E', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>{lesson.fun_fact}</p>
        </div>
      )}

      {lesson.journal_prompt && (
        <div style={{ background: BEIGE, borderRadius: 14, padding: 16, marginBottom: 16, border: `2px dashed ${BEIGE_BORDER}`, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={label(TEXT_MUTED)}>📖 Journal idea</div>
            <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{lesson.journal_prompt}</p>
          </div>
          <Link href="/journal" style={{ padding: '8px 16px', borderRadius: 100, border: `2px solid ${PRIMARY_BORDER}`, color: PRIMARY, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Open journal →</Link>
        </div>
      )}

      {lesson.parent_tip && (
        <div style={{ background: '#FFF8EC', borderLeft: '4px solid #F5DFA0', borderRadius: '0 12px 12px 0', padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ ...label('#C49040'), marginBottom: 4 }}>👨‍👩‍👧 Parent tip</div>
          <p style={{ fontSize: 13, color: '#6B5A3E', margin: 0, lineHeight: 1.6 }}>{lesson.parent_tip}</p>
        </div>
      )}

      <button onClick={() => onComplete(quizScore, quiz.length)} disabled={completing}
        style={{ width: '100%', padding: '13px 16px', minHeight: 48, borderRadius: 12, border: 'none', background: GREEN, color: '#2F6B4A', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: completing ? 'default' : 'pointer', opacity: completing ? 0.7 : 1 }}>
        {completing ? 'Saving…' : lesson.stage === p.lessons_per_concept ? '🏅 Finish topic & continue' : '✓ Lesson done — next lesson'}
      </button>
      {quiz.length > 0 && quizScore === null && (
        <p style={{ fontSize: 12, color: TEXT_MUTED, textAlign: 'center', margin: '8px 0 0 0' }}>Tip: try the quick check before moving on.</p>
      )}
    </div>
  )
}
