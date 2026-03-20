'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const PRIMARY = '#9B8EC4'
const PRIMARY_DARK = '#7B6BAA'
const PRIMARY_BG = '#F0EBF9'
const PRIMARY_BORDER = '#DDD0F0'
const BEIGE = '#FAF7F2'
const BEIGE_CARD = '#FFFFFF'
const BEIGE_BORDER = '#E8E2D9'
const GREEN = '#A8D5BA'
const GREEN_DARK = '#6AAF8A'
const GREEN_BG = '#EDF7F2'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

const AVATAR_COLORS = ['#9B8EC4', '#A8D5BA', '#F4A7A7', '#F5DFA0', '#A0C4E8', '#F0B8D0']

export default function CommunityPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [myProfile, setMyProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'discover' | 'profile'>('discover')
  const [filterCity, setFilterCity] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [hover, setHover] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [child, setChild] = useState<any>(null)
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    visible: true
  })
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (stored) setChild(JSON.parse(stored))
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      // Load my profile
      const { data: mine } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (mine) {
        setMyProfile(mine)
        setForm({ display_name: mine.display_name, bio: mine.bio || '', visible: mine.visible })
      }

      // Load all visible profiles
      const { data: all } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('visible', true)
        .order('created_at', { ascending: false })

      setProfiles(all || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function saveProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !child) return

    const profileData = {
      user_id: user.id,
      display_name: form.display_name || child.name,
      city: child.city,
      country: child.country,
      children_ages: [child.age_group],
      interests: child.subjects || [],
      bio: form.bio,
      visible: form.visible
    }

    const { error } = await supabase
      .from('public_profiles')
      .upsert(profileData, { onConflict: 'user_id' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      loadData()
    }
  }

  const filtered = profiles.filter(p => {
    if (filterCity && !p.city.toLowerCase().includes(filterCity.toLowerCase())) return false
    if (filterCountry && !p.country.toLowerCase().includes(filterCountry.toLowerCase())) return false
    return true
  })

  const btn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer'
  })

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>

      {/* Topbar */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: TEXT_MUTED, padding: '0 8px 0 0' }}>←</button>
          <span style={{ fontSize: 20 }}>🌍</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>Community</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('discover')}
            onMouseEnter={() => setHover('tab-discover')} onMouseLeave={() => setHover(null)}
            style={btn('tab-discover', { padding: '8px 16px', borderRadius: 100, border: `2px solid ${tab === 'discover' ? PRIMARY : BEIGE_BORDER}`, background: tab === 'discover' ? PRIMARY : BEIGE_CARD, color: tab === 'discover' ? 'white' : TEXT_MUTED, fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: PRIMARY })}>
            🔍 Discover
          </button>
          <button onClick={() => setTab('profile')}
            onMouseEnter={() => setHover('tab-profile')} onMouseLeave={() => setHover(null)}
            style={btn('tab-profile', { padding: '8px 16px', borderRadius: 100, border: `2px solid ${tab === 'profile' ? PRIMARY : BEIGE_BORDER}`, background: tab === 'profile' ? PRIMARY : BEIGE_CARD, color: tab === 'profile' ? 'white' : TEXT_MUTED, fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: PRIMARY })}>
            👤 My profile
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <div style={{ background: '#FFFBEB', border: '2px solid #FDE68A', borderRadius: 16, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
  <span style={{ fontSize: 20 }}>🚧</span>
  <div>
    <span style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>Beta version</span>
    <span style={{ fontSize: 14, color: '#92400E' }}> — The full community with live location-based family discovery and chat is coming soon. You're among the first! 🌍</span>
  </div>
</div>

        {/* Discover tab */}
        {tab === 'discover' && (
          <>
            <div style={{ background: BEIGE_CARD, borderRadius: 20, padding: 20, border: `2px solid ${BEIGE_BORDER}`, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 19, color: TEXT, marginBottom: 16 }}>🌍 Find families near you</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>City</label>
                  <input value={filterCity} onChange={e => setFilterCity(e.target.value)}
                    placeholder="e.g. Chiang Mai"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: TEXT, boxSizing: 'border-box' as const }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Country</label>
                  <input value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                    placeholder="e.g. Thailand"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: TEXT, boxSizing: 'border-box' as const }} />
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: TEXT_MUTED }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
                <p>Loading families...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: TEXT_MUTED }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No families found yet</p>
                <p style={{ fontSize: 14 }}>Be the first to add your profile!</p>
                <button onClick={() => setTab('profile')}
                  style={{ marginTop: 16, padding: '12px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Add my profile →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
                <p style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>{filtered.length} {filtered.length === 1 ? 'family' : 'families'} found</p>
                {filtered.map((profile, i) => (
                  <div key={profile.id} style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                        {profile.display_name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>{profile.display_name}</div>
                        <div style={{ fontSize: 13, color: TEXT_MUTED }}>📍 {profile.city}, {profile.country}</div>
                      </div>
                    </div>

                    {profile.bio && (
                      <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.6, marginBottom: 16 }}>{profile.bio}</p>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      {profile.children_ages?.map((age: string) => (
                        <span key={age} style={{ padding: '4px 12px', borderRadius: 100, background: PRIMARY_BG, color: PRIMARY, fontSize: 12, fontWeight: 700, border: `1px solid ${PRIMARY_BORDER}` }}>👶 {age}</span>
                      ))}
                      {profile.interests?.slice(0, 4).map((interest: string) => (
                        <span key={interest} style={{ padding: '4px 12px', borderRadius: 100, background: GREEN_BG, color: GREEN_DARK, fontSize: 12, fontWeight: 700, border: `1px solid ${GREEN}` }}>{interest}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 19, color: TEXT, marginBottom: 8 }}>Your community profile</h2>
            <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 24 }}>Other families can find you based on your location.</p>

            {!child ? (
              <div style={{ textAlign: 'center', padding: 40, color: TEXT_MUTED }}>
                <p>Please set up a child profile first.</p>
                <button onClick={() => router.push('/dashboard/children')}
                  style={{ marginTop: 16, padding: '12px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Go to children →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
                <div style={{ background: BEIGE, borderRadius: 12, padding: 16, border: `1px solid ${BEIGE_BORDER}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>Location (from your child profile)</div>
                  <div style={{ fontSize: 15, color: TEXT, fontWeight: 600 }}>📍 {child.city}, {child.country}</div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>Update this by changing your child's location</div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Display name</label>
                  <input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))}
                    placeholder={child.name + "'s family"}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: TEXT, boxSizing: 'border-box' as const }} />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Bio (optional)</label>
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell other families a little about yourselves..."
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: TEXT, boxSizing: 'border-box' as const, resize: 'vertical' as const }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE }}>
                  <input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: 'pointer' }} id="visible" />
                  <label htmlFor="visible" style={{ fontSize: 14, color: TEXT, fontWeight: 600, cursor: 'pointer' }}>
                    Show my profile to other families
                  </label>
                </div>

                <button onClick={saveProfile}
                  onMouseEnter={() => setHover('save')} onMouseLeave={() => setHover(null)}
                  style={btn('save', { width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: saved ? GREEN : PRIMARY, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { background: saved ? GREEN_DARK : PRIMARY_DARK })}>
                  {saved ? '✓ Saved!' : 'Save profile'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}