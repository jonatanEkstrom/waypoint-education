'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JournalPage() {
  const [child, setChild] = useState<any>(null)
  const [keywords, setKeywords] = useState('')
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/onboarding'); return }
    setChild(JSON.parse(stored))
    const saved = localStorage.getItem('journalEntries')
    if (saved) setEntries(JSON.parse(saved))
  }, [])

  async function generateStory() {
    if (!keywords.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, name: child?.name, city: child?.city, age_group: child?.age_group })
      })
      const data = await res.json()
      setStory(data.story)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function saveEntry() {
    if (!story) return
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      keywords,
      story,
      city: child?.city
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('journalEntries', JSON.stringify(updated))
    setKeywords('')
    setStory('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6FF' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '2px solid #E4E0F5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#1E1B2E' }}>📖 Travel Journal</span>
        </div>
        <div style={{ fontSize: 12, color: '#8B87A8', fontWeight: 600 }}>{child?.name} · {child?.city}</div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>

        {/* New entry */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '2px solid #E4E0F5', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#1E1B2E', marginBottom: 6 }}>Today's adventure ✨</h2>
          <p style={{ color: '#8B87A8', fontSize: 13, marginBottom: 16 }}>What did {child?.name} see, do or learn today? Write a few keywords.</p>

          <textarea
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="e.g. temple, street food, counting money, butterflies..."
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '2px solid #E4E0F5', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', minHeight: 80, resize: 'vertical' }}
          />

          <button
            onClick={generateStory}
            disabled={loading || !keywords.trim()}
            style={{ marginTop: 12, padding: '12px 24px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading || !keywords.trim() ? 0.4 : 1, fontFamily: 'inherit' }}
          >
            {loading ? '✨ Writing story...' : '✨ Turn into a story'}
          </button>
        </div>

        {/* Generated story */}
        {story && (
          <div style={{ background: 'linear-gradient(135deg, #635BFF10, #8B5CF610)', borderRadius: 20, padding: 24, border: '2px solid #635BFF30', marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#1E1B2E', marginBottom: 12 }}>📝 {child?.name}'s story</h3>
            <p style={{ color: '#4B5563', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{story}</p>
            <button
              onClick={saveEntry}
              style={{ marginTop: 16, padding: '10px 20px', borderRadius: 100, border: 'none', background: '#10B981', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              💾 Save to journal
            </button>
          </div>
        )}

        {/* Past entries */}
        {entries.length > 0 && (
          <div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#1E1B2E', marginBottom: 16 }}>Past entries</h3>
            {entries.map(entry => (
              <div key={entry.id} style={{ background: 'white', borderRadius: 16, padding: 20, border: '2px solid #E4E0F5', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#635BFF' }}>📍 {entry.city}</span>
                  <span style={{ fontSize: 12, color: '#8B87A8', fontWeight: 600 }}>{entry.date}</span>
                </div>
                <p style={{ color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>{entry.story}</p>
                <div style={{ marginTop: 8, fontSize: 12, color: '#C4BFDA' }}>Keywords: {entry.keywords}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}