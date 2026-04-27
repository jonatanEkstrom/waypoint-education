'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

interface Child {
  id: string
  name: string
  age: string
  age_group: string
  city: string
  country: string
  curriculum: string
  learn_style: string
  subjects: string[]
  notes: string
  color_index: number
  language_learning: string
  reading_level?: string
  focus_time?: string
}

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

const AVATAR_COLORS = ['#9B8EC4', '#A8D5BA', '#F4A7A7', '#F5DFA0', '#A0C4E8', '#F0B8D0']

const AGE_GROUP_OPTIONS = [
  { emoji: '🌱', label: '3–4 years',  value: '3–4 years' },
  { emoji: '🌟', label: '5–6 years',  value: '5–6 years' },
  { emoji: '🚀', label: '7–9 years',  value: '7–9 years' },
  { emoji: '📚', label: '10–12 years', value: '10–12 years' },
  { emoji: '🎓', label: '13+ years',  value: '13+ years' },
]

const READING_LEVELS = [
  { value: 'letters', emoji: '🔤', title: 'Just starting',   desc: 'Learning letters and sounds' },
  { value: 'early',   emoji: '📖', title: 'Early reader',    desc: 'Can read simple words' },
  { value: 'fluent',  emoji: '🚀', title: 'Confident reader', desc: 'Reads books independently' },
]

const FOCUS_TIMES = [
  { value: '15min', emoji: '⚡', title: 'Short bursts', desc: 'About 15 minutes' },
  { value: '30min', emoji: '🔥', title: 'Good focus',   desc: 'About 30 minutes' },
  { value: '60min', emoji: '💪', title: 'Deep focus',   desc: '1 hour or more' },
]

const LEARN_STYLE_OPTIONS = [
  { value: 'Kinesthetic',     emoji: '👐', label: 'Hands-on' },
  { value: 'Visual',          emoji: '👀', label: 'Visual' },
  { value: 'Auditory',        emoji: '👂', label: 'Listening' },
  { value: 'Reading/Writing', emoji: '📝', label: 'Reading & Writing' },
]

const PASSIONS = [
  { emoji: '🦕', label: 'Dinosaurs' }, { emoji: '🚀', label: 'Space' },
  { emoji: '🎨', label: 'Art' },       { emoji: '🐾', label: 'Animals' },
  { emoji: '⚽', label: 'Sports' },    { emoji: '🎮', label: 'Gaming' },
  { emoji: '🌊', label: 'Ocean' },     { emoji: '🏰', label: 'History' },
  { emoji: '🔬', label: 'Science' },   { emoji: '🎵', label: 'Music' },
  { emoji: '🍳', label: 'Cooking' },   { emoji: '🌿', label: 'Nature' },
  { emoji: '💻', label: 'Coding' },    { emoji: '📖', label: 'Stories' },
  { emoji: '🧮', label: 'Math' },      { emoji: '🌍', label: 'Geography' },
]

const LANGUAGES = ['None', 'English', 'Swedish', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Mandarin']

const CURRICULUMS = ['Unschooling', 'Classical', 'Charlotte Mason', 'Montessori', 'Eclectic', 'Traditional']
const SUBJECT_OPTIONS = ['Math', 'Science', 'Language Arts', 'History', 'Geography', 'Art', 'Music', 'Physical Education', 'Coding', 'Nature', 'Life Skills', 'Technology']

const STEP_TITLES = [
  'Name & Age',
  'Reading Level',
  'Focus & Learning',
  'Passions',
  'Location & Language',
]

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [childrenLimit] = useState<number>(4)
  const [selected, setSelected] = useState<Child | null>(null)
  const [adding, setAdding] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [limitError, setLimitError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    age_group: '7–9 years', city: '', country: '',
    curriculum: 'Eclectic', learn_style: 'Visual',
    subjects: [] as string[], notes: '', language_learning: 'None',
    reading_level: '', focus_time: '',
  })
  const [hover, setHover] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [form, setForm] = useState({
    name: '', age_group: '', reading_level: '', focus_time: '',
    learn_style: '', subjects: [] as string[],
    city: '', country: '', language_learning: 'None',
  })
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data?.user?.id
      if (!uid) { router.push('/auth'); return }
      const stored = localStorage.getItem('activeChild')
      if (stored) {
        try {
          const active = JSON.parse(stored)
          if (active.user_id && active.user_id !== uid) localStorage.clear()
        } catch { localStorage.clear() }
      }
      loadChildren()
    })
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function loadChildren() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data } = await supabase.from('children').select('*').eq('user_id', user.id)
    if (data) {
      const mapped = data.map((c: any) => ({
        id: c.id, name: c.name, age: c.age_group, age_group: c.age_group,
        city: c.city, country: c.country || '', curriculum: c.curriculum,
        learn_style: c.learn_style, subjects: c.subjects || [], notes: c.notes || '',
        color_index: c.color_index || 0, language_learning: c.language_learning || 'None',
        reading_level: c.reading_level || '', focus_time: c.focus_time || '',
      }))
      setChildren(mapped)
      const stored = localStorage.getItem('activeChild')
      if (stored) {
        try {
          const active = JSON.parse(stored)
          if (!mapped.find(c => c.id === active.id)) {
            localStorage.removeItem('activeChild')
            localStorage.removeItem('cachedPlan')
            localStorage.removeItem('cachedPlanChild')
            localStorage.removeItem('cachedLessons')
            localStorage.removeItem('cachedLangPlan')
            localStorage.removeItem('cachedLangPlanKey')
          }
        } catch { localStorage.removeItem('activeChild') }
      }
    }
  }

  async function saveChild() {
    if (!form.name || !form.city) return
    if (children.length >= childrenLimit) { setLimitError(true); setAdding(false); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const colorIndex = children.length % AVATAR_COLORS.length
      const { data } = await supabase.from('children').insert({
        name: form.name, age_group: form.age_group, city: form.city, country: form.country,
        curriculum: 'Eclectic', learn_style: form.learn_style, subjects: form.subjects,
        notes: '', language_learning: form.language_learning,
        reading_level: form.reading_level, focus_time: form.focus_time,
        color_index: colorIndex, user_id: user.id,
      }).select()
      if (data) {
        await loadChildren()
        setAdding(false)
        setWizardStep(1)
        setForm({ name: '', age_group: '', reading_level: '', focus_time: '', learn_style: '', subjects: [], city: '', country: '', language_learning: 'None' })
      }
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (!selected) return
    const payload = {
      age_group: editForm.age_group, city: editForm.city, country: editForm.country,
      curriculum: editForm.curriculum, learn_style: editForm.learn_style,
      subjects: editForm.subjects, notes: editForm.notes,
      language_learning: editForm.language_learning,
      reading_level: editForm.reading_level, focus_time: editForm.focus_time,
    }
    const { data, error } = await supabase.from('children').update(payload).eq('id', selected.id).select().single()
    if (error) { console.error('saveEdit error:', error); return }
    const updatedChild: Child = {
      ...selected,
      age_group: data.age_group, age: data.age_group,
      city: data.city, country: data.country || '',
      curriculum: data.curriculum, learn_style: data.learn_style,
      subjects: data.subjects || [], notes: data.notes || '',
      language_learning: data.language_learning || 'None',
      reading_level: data.reading_level || '', focus_time: data.focus_time || '',
    }
    setSelected(updatedChild)
    setChildren(prev => prev.map(c => c.id === selected.id ? updatedChild : c))

    const langChanged = selected.language_learning !== updatedChild.language_learning
    const subjectsChanged = JSON.stringify((selected.subjects || []).sort()) !== JSON.stringify((updatedChild.subjects || []).sort())

    const stored = localStorage.getItem('activeChild')
    if (stored) {
      try {
        const active = JSON.parse(stored)
        if (active.id === selected.id) {
          localStorage.setItem('activeChild', JSON.stringify({ ...updatedChild, user_id: active.user_id }))
          if (langChanged || subjectsChanged) {
            localStorage.removeItem('cachedPlan')
            localStorage.removeItem('cachedPlanChild')
            localStorage.removeItem('cachedLessons')
          }
          if (langChanged) {
            localStorage.removeItem('cachedLangPlan')
            localStorage.removeItem('cachedLangPlanKey')
          }
        }
      } catch { /* ignore */ }
    }

    if (langChanged || subjectsChanged) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('weekly_plans').delete().eq('user_id', user.id).eq('child_name', selected.name)
          if (langChanged) await supabase.from('language_plans').delete().eq('user_id', user.id).eq('child_name', selected.name)
        }
      } catch (e) { console.error('[saveEdit] cache invalidation error:', e) }
    }

    setEditing(false)
  }

  async function removeChild(id: string) {
    await supabase.from('children').delete().eq('id', id)
    setSelected(null)
    loadChildren()
  }

  async function startPlan(child: Child) {
    const { data: { user } } = await supabase.auth.getUser()
    localStorage.setItem('activeChild', JSON.stringify({ ...child, user_id: user?.id }))
    localStorage.removeItem('cachedPlan')
    localStorage.removeItem('cachedPlanChild')
    localStorage.removeItem('cachedLessons')
    localStorage.removeItem('cachedLangPlan')
    localStorage.removeItem('cachedLangPlanKey')
    router.push('/dashboard')
  }

  async function handleManageSubscription() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Could not open subscription portal. Please try again.')
    } catch { alert('Could not open subscription portal. Please try again.') }
  }

  function openAdding() {
    if (children.length >= childrenLimit) { setLimitError(true); return }
    setLimitError(false); setAdding(true); setSelected(null); setWizardStep(1)
    setForm({ name: '', age_group: '', reading_level: '', focus_time: '', learn_style: '', subjects: [], city: '', country: '', language_learning: 'None' })
  }

  const btn = (id: string, base: React.CSSProperties, hoverStyle: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hoverStyle : {}), transition: 'all 0.15s ease', cursor: 'pointer'
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12, border: `2px solid ${BEIGE_BORDER}`,
    background: BEIGE, fontSize: 15, color: TEXT, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const
  }

  // Step validation
  const canProceed =
    wizardStep === 1 ? !!(form.name.trim() && form.age_group) :
    wizardStep === 2 ? !!form.reading_level :
    wizardStep === 3 ? !!(form.focus_time && form.learn_style) :
    wizardStep === 4 ? form.subjects.length > 0 :
    !!form.city.trim()

  const showDetail = (selected || adding) && isMobile
  const showList = !showDetail || !isMobile

  // ── Wizard card helper ──
  function SelectCard({ id, selected: isSelected, onClick, children: content }: { id: string; selected: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(id)} onMouseLeave={() => setHover(null)}
        style={{
          width: '100%', padding: '16px 20px', borderRadius: 18, border: `2px solid ${isSelected ? PRIMARY : hover === id ? PRIMARY_BORDER : BEIGE_BORDER}`,
          background: isSelected ? PRIMARY_BG : hover === id ? '#FDFBFF' : BEIGE_CARD,
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const,
          boxShadow: isSelected ? `0 4px 18px ${PRIMARY}22` : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'all 0.15s ease',
        }}
      >
        {content}
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { opacity:0; transform:translateX(18px) } to { opacity:1; transform:translateX(0) } }
      `}</style>

      {/* Topbar */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMobile && showDetail && (
            <button onClick={() => { setSelected(null); setAdding(false); setWizardStep(1) }}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '0 8px 0 0', color: TEXT_MUTED }}>←</button>
          )}
          <span style={{ fontSize: 20 }}>🧭</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleManageSubscription}
              onMouseEnter={() => setHover('portal')} onMouseLeave={() => setHover(null)}
              style={btn('portal', { padding: '8px 18px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
              Manage subscription
            </button>
            <button onClick={() => router.push('/dashboard')}
              onMouseEnter={() => setHover('back')} onMouseLeave={() => setHover(null)}
              style={btn('back', { padding: '8px 18px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
              ← Dashboard
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px', display: isMobile ? 'block' : 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Left: list */}
        {showList && (
          <div style={{ width: isMobile ? '100%' : 280, flexShrink: 0 }}>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, marginBottom: 4 }}>My Travelers</h1>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 20 }}>{children.length} {children.length === 1 ? 'child' : 'children'} registered</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {children.map(child => (
                <button key={child.id} onClick={() => { setSelected(child); setAdding(false); setEditing(false) }}
                  onMouseEnter={() => setHover(`child-${child.id}`)} onMouseLeave={() => setHover(null)}
                  style={btn(`child-${child.id}`,
                    { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, border: `2px solid ${selected?.id === child.id && !isMobile ? PRIMARY : BEIGE_BORDER}`, background: selected?.id === child.id && !isMobile ? PRIMARY_BG : BEIGE_CARD, cursor: 'pointer', textAlign: 'left' as const, fontFamily: 'inherit', width: '100%' },
                    { borderColor: PRIMARY, background: PRIMARY_BG }
                  )}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: AVATAR_COLORS[child.color_index % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {child.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: TEXT }}>{child.name}</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED }}>{child.age_group} · {child.city}</div>
                  </div>
                  {isMobile && <span style={{ color: TEXT_MUTED, fontSize: 18 }}>›</span>}
                </button>
              ))}

              <button onClick={openAdding}
                onMouseEnter={() => setHover('add')} onMouseLeave={() => setHover(null)}
                style={btn('add', { padding: '14px 16px', borderRadius: 16, border: `2px dashed ${children.length >= childrenLimit ? '#F4A7A7' : BEIGE_BORDER}`, background: 'transparent', fontSize: 14, fontWeight: 700, color: children.length >= childrenLimit ? '#E07575' : TEXT_MUTED, fontFamily: 'inherit', width: '100%' }, { borderColor: PRIMARY, color: PRIMARY })}>
                + Add child
              </button>
              {limitError && (
                <div style={{ background: '#FFF1F2', border: '1.5px solid #F4A7A7', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#E07575', fontWeight: 600 }}>
                  Maximum 4 children included in your plan.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right: detail or wizard */}
        {(!isMobile || showDetail) && (selected || adding) && (
          <div style={{ flex: 1, animation: 'fadeIn 0.2s ease' }}>

            {/* ── Child detail / edit view ── */}
            {selected && !adding && (
              <div style={{ background: BEIGE_CARD, borderRadius: 24, overflow: 'hidden', border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${GREEN})`, padding: '24px 24px 20px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                      {selected.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, margin: 0 }}>{selected.name}</h2>
                      <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 13 }}>
                        {editing ? 'Editing profile' : `${selected.age_group} · ${selected.city}${selected.country ? `, ${selected.country}` : ''}${selected.language_learning && selected.language_learning !== 'None' ? ` · 🗣️ ${selected.language_learning}` : ''}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: 24 }}>
                  {editing ? (
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Age group</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {AGE_GROUP_OPTIONS.map(ag => (
                            <button key={ag.value} type="button" onClick={() => setEditForm(p => ({ ...p, age_group: ag.value }))}
                              style={{ padding: '10px 8px', borderRadius: 12, border: `2px solid ${editForm.age_group === ag.value ? PRIMARY : BEIGE_BORDER}`, background: editForm.age_group === ag.value ? PRIMARY_BG : BEIGE_CARD, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const, fontSize: 11, fontWeight: 700, color: editForm.age_group === ag.value ? PRIMARY : TEXT_MUTED, transition: 'all 0.15s' }}>
                              <div style={{ fontSize: 18, marginBottom: 2 }}>{ag.emoji}</div>{ag.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>City</label>
                          <input value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} placeholder="City" style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Country</label>
                          <input value={editForm.country} onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))} placeholder="Country" style={inputStyle} />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Reading level</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {READING_LEVELS.map(r => (
                            <button key={r.value} type="button" onClick={() => setEditForm(p => ({ ...p, reading_level: r.value }))}
                              style={{ flex: 1, padding: '10px 6px', borderRadius: 12, border: `2px solid ${editForm.reading_level === r.value ? PRIMARY : BEIGE_BORDER}`, background: editForm.reading_level === r.value ? PRIMARY_BG : BEIGE_CARD, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const, fontSize: 11, fontWeight: 700, color: editForm.reading_level === r.value ? PRIMARY : TEXT_MUTED, transition: 'all 0.15s' }}>
                              <div style={{ fontSize: 20, marginBottom: 2 }}>{r.emoji}</div>{r.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Focus time</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {FOCUS_TIMES.map(f => (
                            <button key={f.value} type="button" onClick={() => setEditForm(p => ({ ...p, focus_time: f.value }))}
                              style={{ flex: 1, padding: '10px 6px', borderRadius: 12, border: `2px solid ${editForm.focus_time === f.value ? PRIMARY : BEIGE_BORDER}`, background: editForm.focus_time === f.value ? PRIMARY_BG : BEIGE_CARD, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const, fontSize: 11, fontWeight: 700, color: editForm.focus_time === f.value ? PRIMARY : TEXT_MUTED, transition: 'all 0.15s' }}>
                              <div style={{ fontSize: 20, marginBottom: 2 }}>{f.emoji}</div>{f.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Learning style</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {LEARN_STYLE_OPTIONS.map(ls => (
                            <button key={ls.value} type="button" onClick={() => setEditForm(p => ({ ...p, learn_style: ls.value }))}
                              style={{ padding: '10px 8px', borderRadius: 12, border: `2px solid ${editForm.learn_style === ls.value ? PRIMARY : BEIGE_BORDER}`, background: editForm.learn_style === ls.value ? PRIMARY_BG : BEIGE_CARD, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' as const, fontSize: 11, fontWeight: 700, color: editForm.learn_style === ls.value ? PRIMARY : TEXT_MUTED, transition: 'all 0.15s' }}>
                              <div style={{ fontSize: 18, marginBottom: 2 }}>{ls.emoji}</div>{ls.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Language learning</label>
                        <select value={editForm.language_learning} onChange={e => setEditForm(p => ({ ...p, language_learning: e.target.value }))} style={inputStyle}>
                          {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Interests</label>
                          <span style={{ fontSize: 12, color: editForm.subjects.length >= 8 ? '#E07575' : TEXT_MUTED, fontWeight: 600 }}>Max 8 ({editForm.subjects.length}/8)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                          {SUBJECT_OPTIONS.map(s => {
                            const on = editForm.subjects.includes(s)
                            const atMax = editForm.subjects.length >= 8
                            return (
                              <button key={s} onClick={() => { if (on || !atMax) setEditForm(p => ({ ...p, subjects: on ? p.subjects.filter(x => x !== s) : [...p.subjects, s] })) }}
                                onMouseEnter={() => setHover(`esubj-${s}`)} onMouseLeave={() => setHover(null)}
                                style={btn(`esubj-${s}`, { padding: '6px 14px', borderRadius: 100, border: `2px solid ${on ? PRIMARY : BEIGE_BORDER}`, background: on ? PRIMARY_BG : BEIGE_CARD, color: on ? PRIMARY : TEXT_MUTED, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', opacity: !on && atMax ? 0.4 : 1, cursor: !on && atMax ? 'default' : 'pointer' }, { borderColor: PRIMARY, color: PRIMARY })}>
                                {s}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                        <textarea value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} placeholder="Extra notes, goals, special interests..." rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Learning philosophy</label>
                        <select value={editForm.curriculum} onChange={e => setEditForm(p => ({ ...p, curriculum: e.target.value }))} style={inputStyle}>
                          {CURRICULUMS.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={saveEdit}
                          onMouseEnter={() => setHover('saveedit')} onMouseLeave={() => setHover(null)}
                          style={btn('saveedit', { flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
                          Save changes
                        </button>
                        <button onClick={() => setEditing(false)}
                          onMouseEnter={() => setHover('canceledit')} onMouseLeave={() => setHover(null)}
                          style={btn('canceledit', { padding: '14px 20px', borderRadius: 14, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, color: TEXT_MUTED, fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY })}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Profile chips */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 20 }}>
                        {selected.reading_level && (
                          <span style={{ padding: '4px 12px', borderRadius: 100, background: '#EAF3FC', color: '#4A90D9', fontSize: 12, fontWeight: 700, border: '1px solid #C5D8F6' }}>
                            {READING_LEVELS.find(r => r.value === selected.reading_level)?.emoji} {READING_LEVELS.find(r => r.value === selected.reading_level)?.title}
                          </span>
                        )}
                        {selected.focus_time && (
                          <span style={{ padding: '4px 12px', borderRadius: 100, background: '#FFF8EC', color: '#C17A00', fontSize: 12, fontWeight: 700, border: '1px solid #FBDFA3' }}>
                            {FOCUS_TIMES.find(f => f.value === selected.focus_time)?.emoji} {FOCUS_TIMES.find(f => f.value === selected.focus_time)?.title}
                          </span>
                        )}
                        {selected.learn_style && (
                          <span style={{ padding: '4px 12px', borderRadius: 100, background: PRIMARY_BG, color: PRIMARY, fontSize: 12, fontWeight: 700, border: `1px solid ${PRIMARY_BORDER}` }}>
                            {LEARN_STYLE_OPTIONS.find(l => l.value === selected.learn_style)?.emoji} {LEARN_STYLE_OPTIONS.find(l => l.value === selected.learn_style)?.label ?? selected.learn_style}
                          </span>
                        )}
                      </div>

                      {selected.subjects?.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>Passions</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                            {selected.subjects.map((s: string) => {
                              const passion = PASSIONS.find(p => p.label === s)
                              return (
                                <span key={s} style={{ padding: '4px 12px', borderRadius: 100, background: PRIMARY_BG, color: PRIMARY, fontSize: 13, fontWeight: 600, border: `1px solid ${PRIMARY_BORDER}` }}>
                                  {passion ? `${passion.emoji} ` : ''}{s}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {selected.notes && (
                        <div style={{ background: BEIGE, borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${BEIGE_BORDER}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>Notes</div>
                          <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{selected.notes}</p>
                        </div>
                      )}

                      <button onClick={() => startPlan(selected)}
                        onMouseEnter={() => setHover('generate')} onMouseLeave={() => setHover(null)}
                        style={btn('generate', { width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', marginBottom: 10 }, { background: PRIMARY_DARK })}>
                        📅 Generate this week's lesson plan
                      </button>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => {
                          setEditForm({
                            age_group: selected.age_group, city: selected.city, country: selected.country || '',
                            curriculum: selected.curriculum || 'Eclectic', learn_style: selected.learn_style || 'Visual',
                            subjects: selected.subjects || [], notes: selected.notes || '',
                            language_learning: selected.language_learning || 'None',
                            reading_level: selected.reading_level || '', focus_time: selected.focus_time || '',
                          })
                          setEditing(true)
                        }}
                          onMouseEnter={() => setHover('edit')} onMouseLeave={() => setHover(null)}
                          style={btn('edit', { flex: 1, padding: '12px', borderRadius: 14, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, color: TEXT_MUTED, fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => removeChild(selected.id)}
                          onMouseEnter={() => setHover('remove')} onMouseLeave={() => setHover(null)}
                          style={btn('remove', { flex: 1, padding: '12px', borderRadius: 14, border: `2px solid #F4A7A7`, background: BEIGE_CARD, color: '#E07575', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { background: '#FFF1F2' })}>
                          Remove {selected.name}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Wizard ── */}
            {adding && (
              <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: isMobile ? 24 : 32, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', animation: 'fadeIn 0.2s ease' }}>

                {/* Progress bar */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ flex: 1, height: 6, borderRadius: 100, background: n <= wizardStep ? PRIMARY : BEIGE_BORDER, transition: 'background 0.3s ease' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 28 }}>
                  <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Step {wizardStep} of 5</span>
                  <span style={{ fontSize: 13, color: TEXT_MUTED }}>· {STEP_TITLES[wizardStep - 1]}</span>
                </div>

                {/* ── Step 1: Name & Age ── */}
                {wizardStep === 1 && (
                  <div style={{ animation: 'slideIn 0.2s ease' }}>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, marginBottom: 6 }}>Who's the traveler? 🧭</h2>
                    <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>Let's start with the basics.</p>

                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="What's their name?"
                      autoFocus
                      style={{ ...inputStyle, fontSize: 18, fontWeight: 600, marginBottom: 28, padding: '16px 20px', borderRadius: 16 }}
                    />

                    <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 12 }}>How old are they?</p>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 10 }}>
                      {AGE_GROUP_OPTIONS.map(ag => (
                        <SelectCard key={ag.value} id={`age-${ag.value}`} selected={form.age_group === ag.value} onClick={() => setForm(p => ({ ...p, age_group: ag.value }))}>
                          <div style={{ fontSize: 32, marginBottom: 6 }}>{ag.emoji}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: form.age_group === ag.value ? PRIMARY : TEXT }}>{ag.label}</div>
                        </SelectCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 2: Reading Level ── */}
                {wizardStep === 2 && (
                  <div style={{ animation: 'slideIn 0.2s ease' }}>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, marginBottom: 6 }}>
                      How does {form.name || 'your child'} read? 📖
                    </h2>
                    <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>This helps us pitch lessons at the right level.</p>

                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                      {READING_LEVELS.map(r => (
                        <SelectCard key={r.value} id={`read-${r.value}`} selected={form.reading_level === r.value} onClick={() => setForm(p => ({ ...p, reading_level: r.value }))}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontSize: 36 }}>{r.emoji}</span>
                            <div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: form.reading_level === r.value ? PRIMARY : TEXT, marginBottom: 2 }}>{r.title}</div>
                              <div style={{ fontSize: 13, color: TEXT_MUTED }}>{r.desc}</div>
                            </div>
                            {form.reading_level === r.value && <span style={{ marginLeft: 'auto', color: PRIMARY, fontSize: 20 }}>✓</span>}
                          </div>
                        </SelectCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Focus Time + Learning Style ── */}
                {wizardStep === 3 && (
                  <div style={{ animation: 'slideIn 0.2s ease' }}>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, marginBottom: 6 }}>How do they learn? ⚡</h2>
                    <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>We'll plan sessions that fit their style.</p>

                    <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>How long can they focus?</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
                      {FOCUS_TIMES.map(f => (
                        <SelectCard key={f.value} id={`focus-${f.value}`} selected={form.focus_time === f.value} onClick={() => setForm(p => ({ ...p, focus_time: f.value }))}>
                          <div style={{ textAlign: 'center' as const }}>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>{f.emoji}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: form.focus_time === f.value ? PRIMARY : TEXT, marginBottom: 2 }}>{f.title}</div>
                            <div style={{ fontSize: 11, color: TEXT_MUTED }}>{f.desc}</div>
                          </div>
                        </SelectCard>
                      ))}
                    </div>

                    <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>How do they learn best?</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {LEARN_STYLE_OPTIONS.map(ls => (
                        <SelectCard key={ls.value} id={`style-${ls.value}`} selected={form.learn_style === ls.value} onClick={() => setForm(p => ({ ...p, learn_style: ls.value }))}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 24 }}>{ls.emoji}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: form.learn_style === ls.value ? PRIMARY : TEXT }}>{ls.label}</span>
                          </div>
                        </SelectCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Step 4: Passions ── */}
                {wizardStep === 4 && (
                  <div style={{ animation: 'slideIn 0.2s ease' }}>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, marginBottom: 4 }}>
                      What does {form.name || 'your child'} love? 🌟
                    </h2>
                    <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>Pick up to 6 passions — we'll weave them into every lesson.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {PASSIONS.map(p => {
                        const selected = form.subjects.includes(p.label)
                        const atMax = form.subjects.length >= 6
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              if (selected || !atMax)
                                setForm(prev => ({ ...prev, subjects: selected ? prev.subjects.filter(s => s !== p.label) : [...prev.subjects, p.label] }))
                            }}
                            style={{
                              padding: '14px 8px', borderRadius: 16, border: `2px solid ${selected ? PRIMARY : BEIGE_BORDER}`,
                              background: selected ? PRIMARY_BG : atMax && !selected ? BEIGE : BEIGE_CARD,
                              cursor: !selected && atMax ? 'not-allowed' : 'pointer',
                              opacity: !selected && atMax ? 0.4 : 1,
                              fontFamily: 'inherit', textAlign: 'center' as const,
                              transition: 'all 0.15s ease',
                              boxShadow: selected ? `0 4px 14px ${PRIMARY}22` : 'none',
                            }}
                          >
                            <div style={{ fontSize: isMobile ? 24 : 28, marginBottom: 4 }}>{p.emoji}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: selected ? PRIMARY : TEXT_MUTED, lineHeight: 1.2 }}>{p.label}</div>
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>
                      {form.subjects.length}/6 selected
                    </div>
                  </div>
                )}

                {/* ── Step 5: Location & Language ── */}
                {wizardStep === 5 && (
                  <div style={{ animation: 'slideIn 0.2s ease' }}>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, marginBottom: 6 }}>
                      Where in the world? 🌍
                    </h2>
                    <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>We'll make lessons feel local and personal.</p>

                    <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                      <div style={{ marginBottom: isMobile ? 14 : 0 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>City *</label>
                        <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Barcelona" autoFocus style={{ ...inputStyle, fontSize: 16, padding: '14px 18px', borderRadius: 14 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Country</label>
                        <input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="e.g. Spain" style={{ ...inputStyle, fontSize: 16, padding: '14px 18px', borderRadius: 14 }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Learning a language? (optional)</label>
                      <select value={form.language_learning} onChange={e => setForm(p => ({ ...p, language_learning: e.target.value }))} style={{ ...inputStyle, fontSize: 15, padding: '14px 18px', borderRadius: 14 }}>
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
                  <button
                    type="button"
                    onClick={() => wizardStep === 1 ? (setAdding(false)) : setWizardStep(s => s - 1)}
                    onMouseEnter={() => setHover('wback')} onMouseLeave={() => setHover(null)}
                    style={btn('wback', { padding: '14px 24px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, color: TEXT_MUTED, fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY })}>
                    {wizardStep === 1 ? 'Cancel' : '← Back'}
                  </button>

                  {wizardStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(s => s + 1)}
                      disabled={!canProceed}
                      onMouseEnter={() => setHover('wnext')} onMouseLeave={() => setHover(null)}
                      style={btn('wnext', { flex: 1, padding: '14px', borderRadius: 100, border: 'none', background: canProceed ? PRIMARY : BEIGE_BORDER, color: canProceed ? 'white' : TEXT_MUTED, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: canProceed ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease' }, { background: PRIMARY_DARK })}>
                      Next →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={saveChild}
                      disabled={saving || !canProceed}
                      onMouseEnter={() => setHover('wsave')} onMouseLeave={() => setHover(null)}
                      style={btn('wsave', { flex: 1, padding: '14px', borderRadius: 100, border: 'none', background: canProceed && !saving ? PRIMARY : BEIGE_BORDER, color: canProceed && !saving ? 'white' : TEXT_MUTED, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: canProceed && !saving ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease' }, { background: PRIMARY_DARK })}>
                      {saving ? 'Creating...' : 'Create Traveler 🚀'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Desktop empty state */}
        {!isMobile && !selected && !adding && (
          <div style={{ flex: 1, textAlign: 'center', padding: '60px 40px', color: TEXT_MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧭</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Select a traveler or add a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}
