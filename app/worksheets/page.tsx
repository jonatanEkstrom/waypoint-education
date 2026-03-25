'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

const subjects = ["Math","Science","Language Arts","History","Geography","Art","Music","Physical Education","Coding","Life Skills"]

const subjectColors: any = {
  'Math': { text: '#C4748E', bg: '#FFF0F5', border: '#F5C6D5' },
  'Science': { text: GREEN_DARK, bg: '#EDF7F2', border: '#D5F0E3' },
  'Language Arts': { text: '#C49040', bg: '#FFF8EC', border: '#F5DFA0' },
  'History': { text: PRIMARY_DARK, bg: PRIMARY_BG, border: PRIMARY_BORDER },
  'Geography': { text: '#6080C4', bg: '#F0F5FF', border: '#C6D5F5' },
  'Art': { text: '#C4748E', bg: '#FFF0F5', border: '#F5C6D5' },
  'Music': { text: '#C49040', bg: '#FFF8EC', border: '#F5DFA0' },
  'Physical Education': { text: GREEN_DARK, bg: '#EDF7F2', border: '#D5F0E3' },
  'Coding': { text: '#6080C4', bg: '#F0F5FF', border: '#C6D5F5' },
  'Life Skills': { text: PRIMARY_DARK, bg: PRIMARY_BG, border: PRIMARY_BORDER },
}

export default function WorksheetsPage() {
  const [child, setChild] = useState<any>(null)
  const [subject, setSubject] = useState('')
  const [theme, setTheme] = useState('')
  const [loading, setLoading] = useState(false)
  const [worksheet, setWorksheet] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
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
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
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
        question: q, answer: shortAnswers[i] || ''
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

  const sc = subjectColors[subject] || { text: PRIMARY, bg: PRIMARY_BG, border: PRIMARY_BORDER }
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

  const maxScore = worksheet
    ? worksheet.matching.pairs.length + worksheet.fillblank.sentences.length + worksheet.truefalse.statements.length + worksheet.shortanswer.questions.length
    : 0

  function printBlank() {
    const content = `<!DOCTYPE html><html><head><title>${worksheet.title}</title><style>
      body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #2D2D2D; }
      h1 { font-size: 26px; margin-bottom: 8px; }
      h2 { font-size: 17px; margin: 28px 0 10px 0; border-bottom: 2px solid #E8E2D9; padding-bottom: 6px; }
      .header { background: ${sc.bg}; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; border: 2px solid ${sc.border}; }
      .info { display: flex; gap: 24px; justify-content: center; margin-top: 12px; font-size: 14px; }
      .pair-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
      .pair-item { border: 2px solid #E8E2D9; border-radius: 8px; padding: 8px 16px; width: 45%; }
      .blank-line { display: inline-block; border-bottom: 2px solid #333; width: 120px; margin: 0 8px; }
      .tf-item { margin-bottom: 14px; }
      .tf-boxes { display: flex; gap: 16px; margin-top: 6px; }
      .tf-box { border: 2px solid #333; border-radius: 8px; padding: 6px 20px; font-weight: bold; font-size: 14px; }
      .answer-line { border-bottom: 1px solid #ccc; height: 28px; margin-bottom: 4px; }
      @media print { body { padding: 16px; } }
    </style></head><body>
      <div class="header">
        <h1>${worksheet.title}</h1>
        <p>${worksheet.subtitle}</p>
        <div class="info">
          <span>👤 Name: ${child?.name}</span>
          <span>📅 Date: _______________</span>
          <span>⭐ Score: _____ / ${maxScore}</span>
        </div>
      </div>
      <h2>🔗 Match the pairs</h2>
      <p style="font-size:13px;color:#9E9188">${worksheet.matching.instruction}</p>
      ${worksheet.matching.pairs.map((p: any) => `<div class="pair-row"><div class="pair-item">${p.left}</div><div class="pair-item">${p.right}</div></div>`).join('')}
      <h2>✏️ Fill in the blank</h2>
      <p style="font-size:13px;color:#9E9188">${worksheet.fillblank.instruction}</p>
      ${worksheet.fillblank.sentences.map((s: any, i: number) => `<p style="margin-bottom:12px">${i+1}. ${s.before} <span class="blank-line"></span> ${s.after}</p>`).join('')}
      <h2>🤔 True or False?</h2>
      <p style="font-size:13px;color:#9E9188">${worksheet.truefalse.instruction}</p>
      ${worksheet.truefalse.statements.map((s: any, i: number) => `<div class="tf-item"><p style="margin:0 0 4px 0">${i+1}. ${s.text}</p><div class="tf-boxes"><div class="tf-box">TRUE</div><div class="tf-box">FALSE</div></div></div>`).join('')}
      <h2>💬 Short answer</h2>
      <p style="font-size:13px;color:#9E9188">${worksheet.shortanswer.instruction}</p>
      ${worksheet.shortanswer.questions.map((q: string, i: number) => `<div style="margin-bottom:20px"><p style="margin:0 0 6px 0">${i+1}. ${q}</p><div class="answer-line"></div><div class="answer-line"></div></div>`).join('')}
    </body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(content); win.document.close(); win.print() }
  }

  function printFilled() {
    const content = `<!DOCTYPE html><html><head><title>${worksheet.title} – Results</title><style>
      body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #2D2D2D; }
      h1 { font-size: 26px; margin-bottom: 8px; }
      h2 { font-size: 17px; margin: 28px 0 10px 0; border-bottom: 2px solid #E8E2D9; padding-bottom: 6px; }
      .header { background: ${sc.bg}; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; border: 2px solid ${sc.border}; }
      .info { display: flex; gap: 24px; justify-content: center; margin-top: 12px; font-size: 14px; }
      .correct { color: #6AAF8A; font-weight: bold; }
      .wrong { color: #E07575; font-weight: bold; }
      .pair-row { display: flex; justify-content: space-between; margin-bottom: 10px; gap: 12px; }
      .pair-item { border: 2px solid #A8D5BA; border-radius: 8px; padding: 8px 16px; background: #EDF7F2; flex: 1; text-align: center; }
      @media print { body { padding: 16px; } }
    </style></head><body>
      <div class="header">
        <h1>${worksheet.title} – Results</h1>
        <p>${worksheet.subtitle}</p>
        <div class="info">
          <span>👤 ${child?.name}</span>
          <span>📅 ${new Date().toLocaleDateString()}</span>
          <span>⭐ Score: ${totalScore()} / ${maxScore}</span>
        </div>
      </div>
      <h2>🔗 Match the pairs</h2>
      ${worksheet.matching.pairs.map((p: any) => `<div class="pair-row"><div class="pair-item">${p.left}</div><div class="pair-item">${p.right}</div></div>`).join('')}
      <h2>✏️ Fill in the blank</h2>
      ${worksheet.fillblank.sentences.map((s: any, i: number) => {
        const ans = blankAnswers[i] || '___'
        const correct = ans.trim().toLowerCase() === s.answer.toLowerCase()
        return `<p style="margin-bottom:10px">${i+1}. ${s.before} <span class="${correct ? 'correct' : 'wrong'}">${ans}</span> ${s.after} ${!correct ? `<span style="color:#6AAF8A;font-size:12px">(${s.answer})</span>` : ''}</p>`
      }).join('')}
      <h2>🤔 True or False?</h2>
      ${worksheet.truefalse.statements.map((s: any, i: number) => {
        const ans = tfAnswers[i]
        const correct = ans === s.answer
        return `<div style="margin-bottom:14px"><p style="margin:0 0 4px 0">${i+1}. ${s.text}</p><p class="${ans !== undefined && ans !== null ? (correct ? 'correct' : 'wrong') : ''}" style="margin:0;font-size:14px">${ans !== undefined && ans !== null ? (ans ? '👍 TRUE' : '👎 FALSE') : 'Not answered'} ${!correct && ans !== undefined && ans !== null ? `→ Correct: ${s.answer ? 'TRUE' : 'FALSE'}` : ''}</p></div>`
      }).join('')}
      <h2>💬 Short answer</h2>
      ${worksheet.shortanswer.questions.map((q: string, i: number) => {
        const ans = shortAnswers[i] || 'Not answered'
        const fb = shortFeedback[i]
        return `<div style="margin-bottom:16px"><p style="margin:0 0 4px 0;font-weight:bold">${i+1}. ${q}</p><p style="margin:0;font-style:italic">${ans}</p>${fb ? `<p style="margin:4px 0 0;font-size:13px;color:${fb.correct ? '#6AAF8A' : '#E07575'}">${fb.correct ? '✓ Correct' : '✗ Not quite'} — ${fb.explanation}</p>` : ''}</div>`
      }).join('')}
    </body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(content); win.document.close(); win.print() }
  }

  const sectionStyle = { background: BEIGE_CARD, borderRadius: 20, padding: 24, border: `2px solid ${BEIGE_BORDER}`, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }
  const sectionTitle = { fontSize: 16, fontWeight: 800, color: TEXT, marginBottom: 4, fontFamily: 'Georgia,serif' }
  const instructionStyle = { fontSize: 13, color: TEXT_MUTED, marginBottom: 16 }

  function btnStyle(active: boolean, correct?: boolean, wrong?: boolean): React.CSSProperties {
    return {
      padding: '10px 16px', borderRadius: 12,
      border: `2px solid ${wrong ? '#F4A7A7' : correct ? GREEN : active ? PRIMARY : BEIGE_BORDER}`,
      background: wrong ? '#FFF1F2' : correct ? '#EDF7F2' : active ? PRIMARY_BG : BEIGE_CARD,
      color: wrong ? '#E07575' : correct ? GREEN_DARK : active ? PRIMARY : TEXT_MUTED,
      cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>

      {/* Topbar */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: TEXT_MUTED, padding: '0 8px 0 0' }}>←</button>
          <span style={{ fontSize: 20 }}>📄</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>Worksheets</span>
        </div>
        {!isMobile && <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{child?.name} · {child?.city}</div>}
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: isMobile ? '16px 12px' : 24 }}>

        {/* Generator */}
        <div style={sectionStyle}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 19, color: TEXT, marginBottom: 6 }}>Create a worksheet ✨</h2>
          <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 20 }}>An interactive worksheet made just for {child?.name}.</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Subject</label>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {subjects.map(sub => {
                const c = subjectColors[sub] || { text: PRIMARY, bg: PRIMARY_BG, border: PRIMARY_BORDER }
                const sel = subject === sub
                return (
                  <button key={sub} onClick={() => setSubject(sub)}
                    style={{ padding: '8px 16px', borderRadius: 100, border: `2px solid ${sel ? c.border : BEIGE_BORDER}`, background: sel ? c.bg : BEIGE_CARD, color: sel ? c.text : TEXT_MUTED, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                    {sub}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Theme (optional)</label>
            <input value={theme} onChange={e => setTheme(e.target.value)}
              placeholder="e.g. dinosaurs, space, cooking..."
              style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: `2px solid ${BEIGE_BORDER}`, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const, background: BEIGE, color: TEXT }} />
          </div>

          <button onClick={generateWorksheet} disabled={loading || !subject}
            style={{ width: '100%', padding: 14, borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 800, cursor: loading || !subject ? 'not-allowed' : 'pointer', opacity: loading || !subject ? 0.4 : 1, fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {loading ? '✨ Creating worksheet...' : '✨ Generate worksheet'}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <p style={{ color: TEXT_MUTED, fontSize: 15, fontWeight: 600 }}>Creating worksheet for {child?.name}...</p>
            <p style={{ color: BEIGE_BORDER, fontSize: 13 }}>This takes about 10 seconds ✨</p>
          </div>
        )}

        {worksheet && !loading && (
          <>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${GREEN})`, borderRadius: 20, padding: 24, marginBottom: 20, color: 'white', textAlign: 'center' as const }}>
              <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 22, margin: '0 0 8px 0' }}>{worksheet.title}</h1>
              <p style={{ margin: '0 0 16px 0', opacity: 0.9, fontSize: 14 }}>{worksheet.subtitle}</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>👤 {child?.name}</div>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>📅 {new Date().toLocaleDateString()}</div>
                <button onClick={printBlank} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', color: PRIMARY }}>🖨️ Print blank</button>
                <button onClick={printFilled} style={{ background: 'white', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', color: PRIMARY }}>📋 Print results</button>
              </div>
            </div>

            {/* Matching */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>🔗 Match the pairs</div>
              <div style={instructionStyle}>{worksheet.matching.instruction}</div>
              <div style={{ overflowX: 'auto' as const }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, minWidth: 300 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    {worksheet.matching.pairs.map((pair: any, i: number) => {
                      const isMatched = matchedPairs[i] !== undefined
                      const isSelected = selectedLeft === i
                      return <button key={i} onClick={() => handleLeftClick(i)} style={btnStyle(isSelected, isMatched)}>{isMatched ? '✓ ' : ''}{pair.left}</button>
                    })}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    {shuffledRight.map((item: string, i: number) => {
                      const isMatched = isRightMatched(i)
                      const isWrong = wrongMatch === i
                      return <button key={i} onClick={() => handleRightClick(i)} style={btnStyle(false, isMatched, isWrong)}>{isMatched ? '✓ ' : ''}{item}</button>
                    })}
                  </div>
                </div>
              </div>
              {Object.keys(matchedPairs).length === worksheet.matching.pairs.length && (
                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 20 }}>🎉 All matched!</div>
              )}
            </div>

            {/* Fill in the blank */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>✏️ Fill in the blank</div>
              <div style={instructionStyle}>{worksheet.fillblank.instruction}</div>
              {worksheet.fillblank.sentences.map((sentence: any, i: number) => {
                const userAnswer = blankAnswers[i] || ''
                const isCorrect = blankChecked && userAnswer.trim().toLowerCase() === sentence.answer.toLowerCase()
                const isWrong = blankChecked && userAnswer.trim().toLowerCase() !== sentence.answer.toLowerCase()
                return (
                  <div key={i} style={{ marginBottom: 16, fontSize: 15, lineHeight: 2 }}>
                    <span>{sentence.before} </span>
                    <input value={userAnswer} onChange={e => setBlankAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                      style={{ borderBottom: `2px solid ${isCorrect ? GREEN : isWrong ? '#F4A7A7' : PRIMARY}`, borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none', width: 120, fontSize: 15, fontFamily: 'inherit', background: 'transparent', textAlign: 'center' as const, color: isCorrect ? GREEN_DARK : isWrong ? '#E07575' : TEXT }} />
                    <span> {sentence.after}</span>
                    {isWrong && <span style={{ fontSize: 12, color: GREEN_DARK, marginLeft: 8 }}>({sentence.answer})</span>}
                  </div>
                )
              })}
              <button onClick={() => setBlankChecked(true)}
                style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Check answers ✓
              </button>
            </div>

            {/* True or False */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>🤔 True or False?</div>
              <div style={instructionStyle}>{worksheet.truefalse.instruction}</div>
              {worksheet.truefalse.statements.map((statement: any, i: number) => {
                const userAnswer = tfAnswers[i]
                const isCorrect = tfChecked && userAnswer === statement.answer
                const isWrong = tfChecked && userAnswer !== undefined && userAnswer !== statement.answer
                return (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 14, color: TEXT, marginBottom: 8, fontWeight: 600 }}>{i + 1}. {statement.text}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => !tfChecked && setTfAnswers(prev => ({ ...prev, [i]: true }))}
                        style={{ ...btnStyle(userAnswer === true, tfChecked && statement.answer === true, tfChecked && userAnswer === true && !isCorrect), minWidth: 80 }}>
                        👍 True
                      </button>
                      <button onClick={() => !tfChecked && setTfAnswers(prev => ({ ...prev, [i]: false }))}
                        style={{ ...btnStyle(userAnswer === false, tfChecked && statement.answer === false, tfChecked && userAnswer === false && !isCorrect), minWidth: 80 }}>
                        👎 False
                      </button>
                      {isWrong && <span style={{ fontSize: 12, color: GREEN_DARK, alignSelf: 'center' }}>Answer: {statement.answer ? 'True' : 'False'}</span>}
                    </div>
                  </div>
                )
              })}
              <button onClick={() => setTfChecked(true)}
                style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>
                Check answers ✓
              </button>
            </div>

            {/* Short answer */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>💬 Short answer</div>
              <div style={instructionStyle}>{worksheet.shortanswer.instruction}</div>
              {worksheet.shortanswer.questions.map((q: string, i: number) => {
                const feedback = shortFeedback[i]
                return (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 8 }}>{i + 1}. {q}</p>
                    <textarea rows={3} value={shortAnswers[i] || ''} onChange={e => setShortAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                      disabled={shortChecked}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: `2px solid ${feedback ? (feedback.correct ? GREEN : '#F4A7A7') : BEIGE_BORDER}`, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, background: feedback ? (feedback.correct ? '#EDF7F2' : '#FFF1F2') : BEIGE, color: TEXT }}
                      placeholder="Write your answer here..." />
                    {feedback && (
                      <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 12, background: feedback.correct ? '#EDF7F2' : '#FFF1F2', border: `2px solid ${feedback.correct ? GREEN : '#F4A7A7'}` }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: feedback.correct ? GREEN_DARK : '#E07575', margin: '0 0 4px 0' }}>{feedback.correct ? '✓ Great answer!' : '✗ Not quite'}</p>
                        <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>{feedback.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
              {!shortChecked && (
                <button onClick={checkShortAnswers} disabled={shortChecking}
                  style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, cursor: shortChecking ? 'not-allowed' : 'pointer', opacity: shortChecking ? 0.6 : 1, fontFamily: 'inherit' }}>
                  {shortChecking ? '✨ Checking...' : 'Check answers ✓'}
                </button>
              )}
            </div>

            {/* Score */}
            <div style={{ ...sectionStyle, textAlign: 'center' as const, background: `linear-gradient(135deg, ${PRIMARY_BG}, #EDF7F2)`, border: `2px solid ${PRIMARY_BORDER}` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{totalScore() === maxScore ? '🏆' : totalScore() >= maxScore * 0.7 ? '⭐' : '💪'}</div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: TEXT, marginBottom: 4 }}>Score: {totalScore()} / {maxScore}</div>
              <div style={{ fontSize: 13, color: TEXT_MUTED }}>{totalScore() === maxScore ? 'Perfect score! Amazing work! 🎉' : totalScore() >= maxScore * 0.7 ? 'Great job! Keep it up! 🌟' : 'Good effort! Try again! 💪'}</div>
              <div style={{ fontSize: 28, marginTop: 12 }}>
                {[...Array(5)].map((_, i) => <span key={i}>{i < Math.round((totalScore() / maxScore) * 5) ? '⭐' : '☆'}</span>)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}