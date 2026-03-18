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
const CURRICULUMS = ['Unschooling', 'Classical', 'Charlotte Mason', 'Montessori', 'Eclectic', 'Traditional']
const LEARN_STYLES = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing']
const AGE_GROUPS = ['4–6 years', '7–9 years', '10–12 years', '13–15 years', '16–18 years']

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selected, setSelected] = useState<Child | null>(null)
  const [adding, setAdding] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [form, setForm] = useState({
    name: '', age_group: '7–9 years', city: '', country: '',
    curriculum: 'Eclectic', learn_style: 'Visual', subjects: [] as string[], notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    loadChildren()
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
        color_index: c.color_index || 0
      }))
      setChildren(mapped)
    }
  }

  async function saveChild() {
    if (!form.name || !form.city) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const colorIndex = children.length % AVATAR_COLORS.length
    const { data } = await supabase.from('children').insert({
      name: form.name, age_group: form.age_group, city: form.city, country: form.country,
      curriculum: form.curriculum, learn_style: form.learn_style, subjects: form.subjects,
      notes: form.notes, color_index: colorIndex, user_id: user.id
    }).select()
    if (data) {
      await loadChildren()
      setAdding(false)
      setForm({ name: '', age_group: '7–9 years', city: '', country: '', curriculum: 'Eclectic', learn_style: 'Visual', subjects: [], notes: '' })
    }
  }

  async function removeChild(id: string) {
    await supabase.from('children').delete().eq('id', id)
    setSelected(null)
    loadChildren()
  }

  function startPlan(child: Child) {
    localStorage.setItem('activeChild', JSON.stringify(child))
    localStorage.removeItem('cachedPlan')
    localStorage.removeItem('cachedPlanChild')
    localStorage.removeItem('cachedLessons')
    router.push('/dashboard')
  }

  const btn = (id: string, base: React.CSSProperties, hoverStyle: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hoverStyle : {}), transition: 'all 0.15s ease', cursor: 'pointer'
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${BEIGE_BORDER}`,
    background: BEIGE, fontSize: 14, color: TEXT, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const
  }

  // Om mobil och man valt ett barn eller lägger till — visa bara det, inte listan
  const showDetail = (selected || adding) && isMobile
  const showList = !showDetail || !isMobile

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Topbar */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMobile && showDetail && (
            <button onClick={() => { setSelected(null); setAdding(false) }}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '0 8px 0 0', color: TEXT_MUTED }}>
              ←
            </button>
          )}
          <span style={{ fontSize: 20 }}>🧭</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
        </div>
        {!isMobile && (
          <button onClick={() => router.push('/dashboard')}
            onMouseEnter={() => setHover('back')} onMouseLeave={() => setHover(null)}
            style={btn('back', { padding: '8px 18px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
            ← Dashboard
          </button>
        )}
      </div>

      <div style={{
        maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px',
        display: isMobile ? 'block' : 'flex', gap: 24, alignItems: 'flex-start'
      }}>

        {/* Left: list */}
        {showList && (
          <div style={{ width: isMobile ? '100%' : 280, flexShrink: 0, marginBottom: isMobile ? 0 : 0 }}>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, marginBottom: 4 }}>My Travelers</h1>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 20 }}>{children.length} {children.length === 1 ? 'child' : 'children'} registered</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {children.map(child => (
                <button key={child.id} onClick={() => { setSelected(child); setAdding(false) }}
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

              <button onClick={() => { setAdding(true); setSelected(null) }}
                onMouseEnter={() => setHover('add')} onMouseLeave={() => setHover(null)}
                style={btn('add', { padding: '14px 16px', borderRadius: 16, border: `2px dashed ${BEIGE_BORDER}`, background: 'transparent', fontSize: 14, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit', width: '100%' }, { borderColor: PRIMARY, color: PRIMARY })}>
                + Add child
              </button>
            </div>
          </div>
        )}

        {/* Right: detail or form */}
        {(!isMobile || showDetail) && (selected || adding) && (
          <div style={{ flex: 1, animation: 'fadeIn 0.2s ease', marginTop: isMobile ? 0 : 0 }}>

            {selected && !adding && (
              <div style={{ background: BEIGE_CARD, borderRadius: 24, overflow: 'hidden', border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${GREEN})`, padding: '24px 24px 20px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                      {selected.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, margin: 0 }}>{selected.name}</h2>
                      <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 13 }}>{selected.age_group} · {selected.city}, {selected.country}</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: 24 }}>
                  {selected.subjects?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>Interests</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                        {selected.subjects.map((s: string) => (
                          <span key={s} style={{ padding: '4px 12px', borderRadius: 100, background: PRIMARY_BG, color: PRIMARY, fontSize: 13, fontWeight: 600, border: `1px solid ${PRIMARY_BORDER}` }}>{s}</span>
                        ))}
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

                  <button onClick={() => removeChild(selected.id)}
                    onMouseEnter={() => setHover('remove')} onMouseLeave={() => setHover(null)}
                    style={btn('remove', { width: '100%', padding: '12px', borderRadius: 14, border: `2px solid #F4A7A7`, background: BEIGE_CARD, color: '#E07575', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { background: '#FFF1F2' })}>
                    Remove {selected.name}
                  </button>
                </div>
              </div>
            )}

            {adding && (
              <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: 24, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: TEXT, marginBottom: 20 }}>Add a new traveler</h2>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Name</label>
                    <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Child's name" style={inputStyle} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>City</label>
                      <input value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} placeholder="City" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Country</label>
                      <input value={form.country} onChange={e => setForm(p => ({...p, country: e.target.value}))} placeholder="Country" style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Age group</label>
                    <select value={form.age_group} onChange={e => setForm(p => ({...p, age_group: e.target.value}))} style={inputStyle}>
                      {AGE_GROUPS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Learning philosophy</label>
                    <select value={form.curriculum} onChange={e => setForm(p => ({...p, curriculum: e.target.value}))} style={inputStyle}>
                      {CURRICULUMS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Learning style</label>
                    <select value={form.learn_style} onChange={e => setForm(p => ({...p, learn_style: e.target.value}))} style={inputStyle}>
                      {LEARN_STYLES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Interests</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      {['Math', 'Science', 'History', 'Art', 'Music', 'Coding', 'Nature', 'Sports', 'Language', 'Technology'].map(s => {
                        const on = form.subjects.includes(s)
                        return (
                          <button key={s} onClick={() => setForm(p => ({ ...p, subjects: on ? p.subjects.filter(x => x !== s) : [...p.subjects, s] }))}
                            onMouseEnter={() => setHover(`subj-${s}`)} onMouseLeave={() => setHover(null)}
                            style={btn(`subj-${s}`, { padding: '6px 14px', borderRadius: 100, border: `2px solid ${on ? PRIMARY : BEIGE_BORDER}`, background: on ? PRIMARY_BG : BEIGE_CARD, color: on ? PRIMARY : TEXT_MUTED, fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY })}>
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                    <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Extra notes, goals, special interests..." rows={3} style={{ ...inputStyle, resize: 'vertical' as const }} />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={saveChild}
                      onMouseEnter={() => setHover('save')} onMouseLeave={() => setHover(null)}
                      style={btn('save', { flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
                      Save traveler
                    </button>
                    <button onClick={() => { setAdding(false); setSelected(null) }}
                      onMouseEnter={() => setHover('cancel')} onMouseLeave={() => setHover(null)}
                      style={btn('cancel', { padding: '14px 20px', borderRadius: 14, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, color: TEXT_MUTED, fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY })}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Desktop: empty state */}
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