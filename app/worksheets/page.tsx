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
  const [worksheet, setWorksheet] = useState('')
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/onboarding'); return }
    setChild(JSON.parse(stored))
  }, [])

  async function generateWorksheet() {
    if (!subject) return
    setLoading(true)
    setWorksheet('')
    try {
      const res = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          theme,
          age_group: child?.age_group,
          name: child?.name,
          city: child?.city
        })
      })
      const data = await res.json()
      if (data.html) setWorksheet(data.html)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function printWorksheet() {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(worksheet)
      win.document.close()
      win.print()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6FF' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '2px solid #E4E0F5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#1E1B2E' }}>📄 Worksheets</span>
        </div>
        <div style={{ fontSize: 12, color: '#8B87A8', fontWeight: 600 }}>{child?.name} · {child?.city}</div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>

        {/* Generator */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '2px solid #E4E0F5', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#1E1B2E', marginBottom: 6 }}>Create a worksheet ✨</h2>
          <p style={{ color: '#8B87A8', fontSize: 13, marginBottom: 20 }}>Claude will create a fun, printable worksheet just for {child?.name}.</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#8B87A8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Subject</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {subjects.map(s => {
                const color = subjectColors[s] || '#635BFF'
                const selected = subject === s
                return (
                  <button key={s} onClick={() => setSubject(s)} style={{ padding: '8px 16px', borderRadius: 100, border: `2px solid ${selected ? color : '#E4E0F5'}`, background: selected ? `${color}20` : 'white', color: selected ? color : '#8B87A8', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#8B87A8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Theme (optional)</label>
            <input
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="e.g. dinosaurs, space, cooking, animals..."
              style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '2px solid #E4E0F5', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={generateWorksheet}
            disabled={loading || !subject}
            style={{ width: '100%', padding: '14px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', opacity: loading || !subject ? 0.4 : 1, fontFamily: 'inherit' }}
          >
            {loading ? '✨ Creating worksheet...' : '✨ Generate worksheet'}
          </button>
        </div>

        {/* Worksheet preview */}
        {worksheet && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#1E1B2E' }}>Preview</h3>
              <button onClick={printWorksheet} style={{ padding: '10px 20px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                🖨️ Print / Save PDF
              </button>
            </div>
            <div style={{ background: 'white', borderRadius: 20, border: '2px solid #E4E0F5', overflow: 'hidden' }}>
              <iframe
                srcDoc={worksheet}
                style={{ width: '100%', height: '800px', border: 'none' }}
                title="Worksheet preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}