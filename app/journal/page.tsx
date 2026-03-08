'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function JournalPage() {
  const [child, setChild] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [storyLoading, setStoryLoading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/onboarding'); return }
    const childData = JSON.parse(stored)
    setChild(childData)
    loadEntries(childData.profile_id || 'guest')
  }, [])

  async function loadEntries(userId: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setEntries(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function saveEntry() {
    if (!text.trim()) return
    setSaving(true)
    try {
      const entry = {
        user_id: child?.profile_id || 'guest',
        city: child?.city,
        country: child?.country,
        date: new Date().toLocaleDateString(),
        text: text.trim(),
        story: null
      }
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single()
      if (error) throw error
      setEntries(prev => [data, ...prev])
      setText('')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function generateStory(entry: any) {
    setStoryLoading(entry.id)
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: entry.text,
          city: entry.city,
          country: entry.country,
          name: child?.name,
          age_group: child?.age_group
        })
      })
      const data = await res.json()
      if (data.story) {
        const { error } = await supabase
          .from('journal_entries')
          .update({ story: data.story })
          .eq('id', entry.id)
        if (error) throw error
        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, story: data.story } : e))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setStoryLoading(null)
    }
  }

  async function deleteEntry(id: string) {
    try {
      await supabase.from('journal_entries').delete().eq('id', id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6FF' }}>
      <div style={{ background: 'white', borderBottom: '2px solid #E4E0F5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: '#1E1B2E' }}>📖 Travel Journal</span>
        </div>
        <div style={{ fontSize: 12, color: '#8B87A8', fontWeight: 600 }}>{child?.name} · {child?.city}</div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '2px solid #E4E0F5', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#1E1B2E', marginBottom: 6 }}>New entry ✍️</h2>
          <p style={{ color: '#8B87A8', fontSize: 13, marginBottom: 16 }}>What did {child?.name} experience today in {child?.city}?</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write about today's adventure..."
            rows={4}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: '2px solid #E4E0F5', fontSize: 15, fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const, marginBottom: 12 }}
          />
          <button onClick={saveEntry} disabled={saving || !text.trim()}
            style={{ width: '100%', padding: 14, borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 15, fontWeight: 800, cursor: saving || !text.trim() ? 'not-allowed' : 'pointer', opacity: saving || !text.trim() ? 0.4 : 1, fontFamily: 'inherit' }}>
            {saving ? 'Saving...' : 'Save entry 💾'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
            <p style={{ color: '#8B87A8' }}>Loading journal...</p>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8B87A8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div>
            <p style={{ fontSize: 15 }}>No entries yet — write your first memory!</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} style={{ background: 'white', borderRadius: 20, padding: 24, border: '2px solid #E4E0F5', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 100, background: '#E8E6FF', color: '#635BFF', fontSize: 12, fontWeight: 700 }}>📍 {entry.city}</span>
                  <span style={{ padding: '4px 12px', borderRadius: 100, background: '#F3F4F6', color: '#6B7280', fontSize: 12, fontWeight: 700 }}>📅 {entry.date}</span>
                </div>
                <button onClick={() => deleteEntry(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#D1D5DB' }}>🗑</button>
              </div>
              <p style={{ fontSize: 15, color: '#1E1B2E', lineHeight: 1.7, marginBottom: 16 }}>{entry.text}</p>
              {entry.story ? (
                <div style={{ background: 'linear-gradient(135deg, #F8F6FF, #EEF2FF)', borderRadius: 14, padding: 16, borderLeft: '3px solid #635BFF' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#635BFF', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>✨ AI Story</div>
                  <p style={{ fontSize: 14, color: '#1E1B2E', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{entry.story}</p>
                </div>
              ) : (
                <button onClick={() => generateStory(entry)} disabled={storyLoading === entry.id}
                  style={{ width: '100%', padding: '10px', borderRadius: 12, border: '2px solid #E4E0F5', background: '#F8F6FF', color: '#635BFF', cursor: storyLoading === entry.id ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', opacity: storyLoading === entry.id ? 0.6 : 1 }}>
                  {storyLoading === entry.id ? '✨ Generating story...' : '✨ Generate AI story'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}