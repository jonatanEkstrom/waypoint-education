'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const subjects = ["Math","Science","Language Arts","History","Geography","Art","Music","Physical Education","Coding","Life Skills"]

const subjectColors: any = {
  'Math': '#0D9488', 'Science': '#059669', 'Language Arts': '#D97706',
  'History': '#7C3AED', 'Geography': '#2563EB', 'Art': '#DB2777',
  'Music': '#EA580C', 'Physical Education': '#16A34A', 'Coding': '#0891B2',
  'Life Skills': '#65A30D'
}

export default function WorksheetsPage() {
  const [child, setChild] = useState<any>(null)
  const [subject, setSubject] = useState('')
  const [theme, setTheme] = useState('')
  const [loading, setLoading] = useState(false)
  const [worksheet, setWorksheet] = useState<any>(null)
  const router = useRouter()

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<{[key: number]: number}>({})
  const [wrongMatch, setWrongMatch] = useState<number | null>(null)
  const [shuffledRight, setShuffledRight] = useState<string[]>([])

  const [blankAnswers, setBlankAnswers] = useState<{[key: number]: string}>({})
  const [blankChecked, setBlankChecked] = useState(false)

  const [tfAnswers, setTfAnswers] = useState<{[key: number]: boolean | null}>({})
  const [tfChecked, setTfChecked] = useState(false)

  const [shortAnswers, setShortAnswers] = useState<{[key: number]: string}>({})
  const [shortFeedback, setShortFeedback] = useState<{[key: number]: any}>({})
  const [shortChecking, setShortChecking] = useState(false)
  const [shortChecked, setShortChecked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/onboarding'); return }
    setChild(JSON.parse(stored))
  }, [])

  async function generateWorksheet() {
    if (!subject) return
    setLoading(true)
    setWorksheet(null)
    setSelectedLeft(null)
    setMatchedPairs({})
    setBlankAnswers({})
    setBlankChecked(false)
    setTfAnswers({})
    setTfChecked(false)
    setShortAnswers({})
    setShortFeedback({})
    setShortChecked(false)
    try {
      const res = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, theme, age_group: child?.age_group, name: child?.name, city: child?.city })
      })
      const data = await res.json()
      if (data.worksheet) {
        setWorksheet(data.worksheet)
        const rights = data.worksheet.matching.pairs.map((p: any) => p.right)
        setShuffledRight([...rights].sort(() => Math.random() - 0.5))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function checkShortAnswers() {
    if (shortChecking) return
    setShortChecking(true)
    try {
      const questions = worksheet.shortanswer.questions.map((q: string, i: number) => ({
        question: q,
        answer: shortAnswers[i] || ''
      }))
      const res = await fetch('/api/check-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, age_group: child?.age_group, subject })
      })
      const data = await res.json()
      if (data.feedback) {
        const feedbackMap: any = {}
        data.feedback.forEach((f: any, i: number) => { feedbackMap[i] = f })
        setShortFeedback(feedbackMap)
        setShortChecked(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setShortChecking(false)
    }
  }

  function handleLeftClick(i: number) {
    if (matchedPairs[i] !== undefined) return
    setSelectedLeft(i)
  }

  function handleRightClick(rightIndex: number) {
    if (selectedLeft === null) return
    const correctRight = worksheet.matching.pairs[selectedLeft].right
    if (shuffledRight[rightIndex] === correctRight) {
      setMatchedPairs(prev => ({ ...prev, [selectedLeft]: rightIndex }))
      setSelectedLeft(null)
    } else {
      setWrongMatch(rightIndex)
      setTimeout(() => { setWrongMatch(null); setSelectedLeft(null) }, 800)
    }
  }

  function isRightMatched(rightIndex: number) {
    return Object.values(matchedPairs).includes(rightIndex)
  }

  function printWorksheet() {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${worksheet.title}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #1E1B2E; }
          h1 { font-size: 28px; margin-bottom: 8px; }
          h2 { font-size: 18px; margin: 24px 0 12px 0; border-bottom: 2px solid #eee; padding-bottom: 8px; }
          .header { background: ${color}22; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; }
          .info { display: flex; gap: 24px; justify-content: center; margin-top: 12px; font-size: 14px; }
          .pair-row { display: flex; justify-content: space-between; margin-bottom: 16px; }
          .pair-item { border: 2px solid #E4E0F5; border-radius: 8px; padding: 8px 16px; width: 45%; }
          .blank-line { display: inline-block; border-bottom: 2px solid #333; width: 120px; margin: 0 8px; }
          .tf-item { margin-bottom: 16px; }
          .tf-boxes { display: flex; gap: 16px; margin-top: 8px; }
          .tf-box { border: 2px solid #333; border-radius: 8px; padding: 8px 24px; font-weight: bold; }
          .answer-lines { margin-top: 8px; }
          .answer-line { border-bottom: 1px solid #ccc; height: 28px; margin-bottom: 4px; }
          .stars { font-size: 24px; margin-top: 16px; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${worksheet.title}</h1>
          <p>${worksheet.subtitle}</p>
          <div class="info">
            <span>👤 Name: ${child?.name}</span>
            <span>📅 Date: ${new Date().toLocaleDateString()}</span>
            <span>⭐ Score: _____ / ${worksheet.matching.pairs.length + worksheet.fillblank.sentences.length + worksheet.truefalse.statements.length + worksheet.shortanswer.questions.length}</span>
          </div>
        </div>

        <h2>🔗 Match the pairs</h2>
        <p>${worksheet.matching.instruction}</p>
        ${worksheet.matching.pairs.map((p: any) => `
          <div class="pair-row">
            <div class="pair-item">${p.left}</div>
            <div class="pair-item">${p.right}</div>
          </div>
        `).join('')}

        <h2>✏️ Fill in the blank</h2>
        <p>${worksheet.fillblank.instruction}</p>
        ${worksheet.fillblank.sentences.map((s: any, i: number) => `
          <p>${i + 1}. ${s.before} <span class="blank-line"></span> ${s.after}</p>
        `).join('')}

        <h2>🤔 True or False?</h2>
        <p>${worksheet.truefalse.instruction}</p>
        ${worksheet.truefalse.statements.map((s: any, i: number) => `
          <div class="tf-item">
            <p>${i + 1}. ${s.text}</p>
            <div class="tf-boxes">
              <div class="tf-box">TRUE</div>
              <div class="tf-box">FALSE</div>
            </div>
          </div>
        `).join('')}

        <h2>💬 Short answer</h2>
        <p>${worksheet.shortanswer.instruction}</p>
        ${worksheet.shortanswer.questions.map((q: string, i: number) => `
          <div style="margin-bottom: 20px">
            <p>${i + 1}. ${q}</p>
            <div class="answer-lines">
              <div class="answer-line"></div>
              <div class="answer-line"></div>
              <div class="answer-line"></div>
            </div>
          </div>
        `).join('')}

        <div style="text-align: center; margin-top: 32px; border: 2px solid ${color}; border-radius: 16px; padding: 20px;">
          <p style="font-size: 20px; font-weight: bold;">⭐ Great job, ${child?.name}! ⭐</p>
          <div class="stars">☆ ☆ ☆ ☆ ☆</div>
        </div>
      </body>
      </html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
  }

  const color = subjectColors[subject] || '#635BFF'

  const shortScore = Object.values(shortFeedback).filter((f: any) => f.correct).length

  const totalScore = () => {
    let score = 0
    if (worksheet) {
      score += Object.keys(matchedPairs).length
      worksheet.fillblank.sentences.forEach((s: any, i: number) => {
        if (blankAnswers[i]?.trim().toLowerCase() === s.answer.toLowerCase()) score++
      })
      worksheet.truefalse.statements.forEach((s: any, i: number) => {
        if (tfAnswers[i] === s.answer) score++
      })
      score += shortScore
    }
    return score
  }

  const maxScore = worksheet ? worksheet.matching.pairs.length + worksheet.fillblank.sentences.length + worksheet.truefalse.statements.length + worksheet.shortanswer.questions.length : 0

  const s: any = {
    section: { background: 'white', borderRadius: 20, padding: 24, border: '2px solid #E4E0F5', marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 800, color: '#1E1B2E', marginBottom: 4, fontFamily: 'Georgia,serif' },
    instruction: { fontSize: 13, color: '#8B87A8', marginBottom: 16 },
    btn: (active: boolean, correct?: boolean, wrong?: boolean) => ({
      padding: '10px 16px', borderRadius: 12, border: `2px solid ${wrong ? '#F43F5E' : correct ? '#10B981' : active ? color : '#E4E0F5'}`,
      background: wrong ? '#FFF1F2' : correct ? '#F0FDF4' : active ? `${color}20` : 'white',
      color: wrong ? '#F43F5E' : correct ? '#10B981' : active ? color : '#4B5563',
      cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s'
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6FF' }}>
      <div style={{ background: 'white', borderBottom: '2px solid #E4E0F5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#1E1B2E' }}>📄 Worksheets</span>
        </div>
        <div style={{ fontSize: 12, color: '#8B87A8', fontWeight: 600 }}>{child?.name} · {child?.city}</div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
        <div style={s.section}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#1E1B2E', marginBottom: 6 }}>Create a worksheet ✨</h2>
          <p style={{ color: '#8B87A8', fontSize: 13, marginBottom: 20 }}>Claude creates a fun interactive worksheet just for {child?.name}.</p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#8B87A8', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Subject</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {subjects.map(sub => {
                const c = subjectColors[sub] || '#635BFF'
                const sel = subject === sub
                return <button key={sub} onClick={() => setSubject(sub)} style={{ padding: '8px 16px', borderRadius: 100, border: `2px solid ${sel ? c : '#E4E0F5'}`, background: sel ? `${c}20` : 'white', color: sel ? c : '#8B87A8', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>{sub}</button>
              })}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#8B87A8', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Theme (optional)</label>
            <input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. dinosaurs, space, cooking..." style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '2px solid #E4E0F5', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>
          <button onClick={generateWorksheet} disabled={loading || !subject} style={{ width: '100%', padding: 14, borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 15, fontWeight: 800, cursor: loading || !subject ? 'not-allowed' : 'pointer', opacity: loading || !subject ? 0.4 : 1, fontFamily: 'inherit' }}>
            {loading ? '✨ Creating worksheet...' : '✨ Generate worksheet'}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <p style={{ color: '#8B87A8', fontSize: 15, fontWeight: 600 }}>Creating worksheet for {child?.name}...</p>
            <p style={{ color: '#B8B4D0', fontSize: 13 }}>This takes about 10 seconds ✨</p>
          </div>
        )}

        {worksheet && !loading && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, borderRadius: 20, padding: '24px', marginBottom: 20, color: 'white', textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 24, margin: '0 0 8px 0' }}>{worksheet.title}</h1>
              <p style={{ margin: '0 0 16px 0', opacity: 0.9, fontSize: 14 }}>{worksheet.subtitle}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>👤 {child?.name}</div>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>📅 {new Date().toLocaleDateString()}</div>
                <button onClick={printWorksheet} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', color: color }}>🖨️ Print / Save PDF</button>
              </div>
            </div>

            {/* Matching */}
            <div style={s.section}>
              <div style={s.sectionTitle}>🔗 Match the pairs</div>
              <div style={s.instruction}>{worksheet.matching.instruction}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {worksheet.matching.pairs.map((pair: any, i: number) => {
                    const isMatched = matchedPairs[i] !== undefined
                    const isSelected = selectedLeft === i
                    return <button key={i} onClick={() => handleLeftClick(i)} style={s.btn(isSelected, isMatched)}>{isMatched ? '✓ ' : ''}{pair.left}</button>
                  })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {shuffledRight.map((item: string, i: number) => {
                    const isMatched = isRightMatched(i)
                    const isWrong = wrongMatch === i
                    return <button key={i} onClick={() => handleRightClick(i)} style={s.btn(false, isMatched, isWrong)}>{isMatched ? '✓ ' : ''}{item}</button>
                  })}
                </div>
              </div>
              {Object.keys(matchedPairs).length === worksheet.matching.pairs.length && (
                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 20 }}>🎉 All matched!</div>
              )}
            </div>

            {/* Fill in the blank */}
            <div style={s.section}>
              <div style={s.sectionTitle}>✏️ Fill in the blank</div>
              <div style={s.instruction}>{worksheet.fillblank.instruction}</div>
              {worksheet.fillblank.sentences.map((sentence: any, i: number) => {
                const userAnswer = blankAnswers[i] || ''
                const isCorrect = blankChecked && userAnswer.trim().toLowerCase() === sentence.answer.toLowerCase()
                const isWrong = blankChecked && userAnswer.trim().toLowerCase() !== sentence.answer.toLowerCase()
                return (
                  <div key={i} style={{ marginBottom: 16, fontSize: 15, lineHeight: 2 }}>
                    <span style={{ color: '#1E1B2E' }}>{sentence.before} </span>
                    <input value={userAnswer} onChange={e => setBlankAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                      style={{ borderBottom: `2px solid ${isCorrect ? '#10B981' : isWrong ? '#F43F5E' : color}`, borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none', width: 120, fontSize: 15, fontFamily: 'inherit', background: 'transparent', textAlign: 'center', color: isCorrect ? '#10B981' : isWrong ? '#F43F5E' : '#1E1B2E' }} />
                    <span style={{ color: '#1E1B2E' }}> {sentence.after}</span>
                    {isWrong && <span style={{ fontSize: 12, color: '#10B981', marginLeft: 8 }}>({sentence.answer})</span>}
                  </div>
                )
              })}
              <button onClick={() => setBlankChecked(true)} style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: color, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Check answers ✓</button>
            </div>

            {/* True or False */}
            <div style={s.section}>
              <div style={s.sectionTitle}>🤔 True or False?</div>
              <div style={s.instruction}>{worksheet.truefalse.instruction}</div>
              {worksheet.truefalse.statements.map((statement: any, i: number) => {
                const userAnswer = tfAnswers[i]
                const isCorrect = tfChecked && userAnswer === statement.answer
                const isWrong = tfChecked && userAnswer !== undefined && userAnswer !== statement.answer
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 14, color: '#1E1B2E', marginBottom: 8, fontWeight: 600 }}>{i + 1}. {statement.text}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => !tfChecked && setTfAnswers(prev => ({ ...prev, [i]: true }))} style={{ ...s.btn(userAnswer === true, tfChecked && statement.answer === true, tfChecked && userAnswer === true && !isCorrect), minWidth: 80 }}>👍 True</button>
                      <button onClick={() => !tfChecked && setTfAnswers(prev => ({ ...prev, [i]: false }))} style={{ ...s.btn(userAnswer === false, tfChecked && statement.answer === false, tfChecked && userAnswer === false && !isCorrect), minWidth: 80 }}>👎 False</button>
                      {isWrong && <span style={{ fontSize: 12, color: '#10B981', alignSelf: 'center' }}>Answer: {statement.answer ? 'True' : 'False'}</span>}
                    </div>
                  </div>
                )
              })}
              <button onClick={() => setTfChecked(true)} style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: color, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>Check answers ✓</button>
            </div>

            {/* Short answer */}
            <div style={s.section}>
              <div style={s.sectionTitle}>💬 Short answer</div>
              <div style={s.instruction}>{worksheet.shortanswer.instruction}</div>
              {worksheet.shortanswer.questions.map((q: string, i: number) => {
                const feedback = shortFeedback[i]
                return (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1E1B2E', marginBottom: 8 }}>{i + 1}. {q}</p>
                    <textarea rows={3} value={shortAnswers[i] || ''} onChange={e => setShortAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                      disabled={shortChecked}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: `2px solid ${feedback ? (feedback.correct ? '#10B981' : '#F43F5E') : '#E4E0F5'}`, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const, background: feedback ? (feedback.correct ? '#F0FDF4' : '#FFF1F2') : 'white' }}
                      placeholder="Write your answer here..." />
                    {feedback && (
                      <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 12, background: feedback.correct ? '#F0FDF4' : '#FFF1F2', border: `2px solid ${feedback.correct ? '#10B981' : '#F43F5E'}` }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: feedback.correct ? '#059669' : '#E11D48', margin: '0 0 4px 0' }}>{feedback.correct ? '✓ Great answer!' : '✗ Not quite'}</p>
                        <p style={{ fontSize: 13, color: '#4B5563', margin: 0 }}>{feedback.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
              {!shortChecked && (
                <button onClick={checkShortAnswers} disabled={shortChecking} style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: color, color: 'white', fontSize: 13, fontWeight: 700, cursor: shortChecking ? 'not-allowed' : 'pointer', opacity: shortChecking ? 0.6 : 1, fontFamily: 'inherit' }}>
                  {shortChecking ? '✨ Checking...' : 'Check answers ✓'}
                </button>
              )}
            </div>

            {/* Score */}
            <div style={{ ...s.section, textAlign: 'center' as const, background: `linear-gradient(135deg, ${color}15, ${color}30)`, border: `2px solid ${color}40` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{totalScore() === maxScore ? '🏆' : totalScore() >= maxScore * 0.7 ? '⭐' : '💪'}</div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#1E1B2E', marginBottom: 4 }}>Score: {totalScore()} / {maxScore}</div>
              <div style={{ fontSize: 13, color: '#8B87A8' }}>{totalScore() === maxScore ? 'Perfect score! Amazing work! 🎉' : totalScore() >= maxScore * 0.7 ? 'Great job! Keep it up! 🌟' : 'Good effort! Try again! 💪'}</div>
              <div style={{ fontSize: 28, marginTop: 12 }}>{[...Array(5)].map((_, i) => <span key={i}>{i < Math.round((totalScore() / maxScore) * 5) ? '⭐' : '☆'}</span>)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}