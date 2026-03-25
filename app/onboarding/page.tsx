'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Country, City } from 'country-state-city'
import { supabase } from '../lib/supabase'

const ageGroups = ["4–6 years","7–9 years","10–12 years","13–15 years","16–18 years"]
const subjects = ["Math","Science","Language Arts","History","Geography","Art","Music","Physical Education","Coding","Life Skills"]
const learnStyles = ["Hands-on & building","Reading & writing","Visual & video","Discussion & exploration"]
const curricula = [
  {id:"charlotte-mason",icon:"🌿",name:"Charlotte Mason",desc:"Short, focused lessons using living books and nature study."},
  {id:"classical",icon:"🏛️",name:"Classical (Trivium)",desc:"Grammar, Logic and Rhetoric stages matched to your child's age."},
  {id:"unschooling",icon:"🦋",name:"Unschooling / Child-led",desc:"Learning follows the child's natural curiosity."},
  {id:"montessori",icon:"🧩",name:"Montessori",desc:"Self-directed work with hands-on materials."},
  {id:"eclectic",icon:"🎨",name:"Eclectic / Mix it up",desc:"Take the best from every philosophy."},
]

const PRIMARY = '#9B8EC4'
const PRIMARY_DARK = '#7B6BAA'
const PRIMARY_BG = '#F0EBF9'
const PRIMARY_BORDER = '#DDD0F0'
const BEIGE = '#FAF7F2'
const BEIGE_CARD = '#FFFFFF'
const BEIGE_BORDER = '#E8E2D9'
const GREEN = '#A8D5BA'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

const AVATAR_COLORS = ['#9B8EC4','#A8D5BA','#F4A7A7','#F5DFA0','#A0C4E8','#F0B8D0']
const allCountries = Country.getAllCountries()

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [curriculum, setCurriculum] = useState('')
  const [learnStyle, setLearnStyle] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [citySearch, setCitySearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const filteredCountries = allCountries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  ).slice(0, 8)

  const allCities = selectedCountry ? City.getCitiesOfCountry(selectedCountry.isoCode) || [] : []
  const filteredCities = allCities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 8)

  function toggleSubject(s: string) {
    if (selectedSubjects.includes(s)) setSelectedSubjects(selectedSubjects.filter(x => x !== s))
    else if (selectedSubjects.length < 5) setSelectedSubjects([...selectedSubjects, s])
  }

  function selectCountry(country: any) {
    setSelectedCountry(country)
    setCountrySearch(country.name)
    setShowCountryDropdown(false)
    setSelectedCity('')
    setCitySearch('')
  }

  function selectCity(city: any) {
    setSelectedCity(city.name)
    setCitySearch(city.name)
    setShowCityDropdown(false)
  }

  async function handleFinish() {
    if (loading) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const country = selectedCountry?.name || countrySearch
      const city = selectedCity || citySearch

      // Räkna befintliga barn för color_index
      const { data: existing } = await supabase.from('children').select('id').eq('user_id', user.id)
      const colorIndex = (existing?.length || 0) % AVATAR_COLORS.length

      const { data: saved } = await supabase.from('children').insert({
        name,
        age_group: age,
        city,
        country,
        curriculum,
        learn_style: learnStyle,
        subjects: selectedSubjects,
        notes,
        color_index: colorIndex,
        user_id: user.id
      }).select().single()

      const childData = {
        id: saved?.id || Date.now().toString(),
        name,
        age_group: age,
        city,
        country,
        curriculum,
        learn_style: learnStyle,
        subjects: selectedSubjects,
        notes,
        color_index: colorIndex
      }

      localStorage.removeItem('cachedPlan')
      localStorage.removeItem('cachedPlanChild')
      localStorage.removeItem('cachedLessons')
      localStorage.setItem('activeChild', JSON.stringify(childData))

      router.push('/dashboard')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 14,
    border: `2px solid ${BEIGE_BORDER}`, fontSize: 15, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', background: BEIGE, color: TEXT
  }

  const tagStyle = (sel: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 100,
    border: `2px solid ${sel ? PRIMARY : BEIGE_BORDER}`,
    background: sel ? PRIMARY_BG : BEIGE_CARD,
    color: sel ? PRIMARY : TEXT_MUTED,
    cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
  })

  const ccardStyle = (sel: boolean): React.CSSProperties => ({
    width: '100%', padding: '16px 20px', borderRadius: 18,
    border: `2px solid ${sel ? PRIMARY : BEIGE_BORDER}`,
    background: sel ? PRIMARY_BG : BEIGE_CARD,
    cursor: 'pointer', textAlign: 'left', marginBottom: 10, fontFamily: 'inherit'
  })

  const primaryBtn: React.CSSProperties = {
    flex: 1, padding: '15px', borderRadius: 100, border: 'none',
    background: PRIMARY, color: 'white', fontSize: 16, fontWeight: 800,
    cursor: 'pointer', fontFamily: 'inherit'
  }

  const backBtn: React.CSSProperties = {
    padding: '14px 24px', borderRadius: 100,
    border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD,
    color: TEXT_MUTED, fontSize: 15, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit'
  }

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: BEIGE_CARD, border: `2px solid ${BEIGE_BORDER}`,
    borderRadius: 14, marginTop: 4, zIndex: 100,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    maxHeight: 280, overflowY: 'auto'
  }

  const stepLabels = ['Child', 'Philosophy', 'Location', 'Style']

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: isMobile ? '20px 12px' : 24, paddingTop: isMobile ? 20 : 40 }}>
      <div style={{ width: '100%', maxWidth: 540 }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: TEXT, fontWeight: 700 }}>
            🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span>
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {stepLabels.map((l, i) => (
            <div key={l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ height: 5, width: '100%', borderRadius: 100, background: i+1 < step ? GREEN : i+1 === step ? PRIMARY : BEIGE_BORDER }}/>
              <span style={{ fontSize: 10, fontWeight: 700, color: i+1 < step ? '#6AAF8A' : i+1 === step ? PRIMARY : TEXT_MUTED }}>{l}</span>
            </div>
          ))}
        </div>

        <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: isMobile ? 20 : 32, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {step === 1 && (
            <>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: TEXT, marginBottom: 6 }}>Tell us about your child 👦</h2>
              <p style={{ color: TEXT_MUTED, marginBottom: 24, fontSize: 15 }}>This shapes every lesson we create.</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Child's name</label>
                <input style={inputStyle} placeholder="e.g. Sofia" value={name} onChange={e => setName(e.target.value)}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Age group</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ageGroups.map(a => <button key={a} style={tagStyle(age === a)} onClick={() => setAge(a)}>{a}</button>)}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Priority subjects (up to 5)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {subjects.map(sub => <button key={sub} style={tagStyle(selectedSubjects.includes(sub))} onClick={() => toggleSubject(sub)}>{sub}</button>)}
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <button style={{ ...primaryBtn, opacity: name && age && selectedSubjects.length > 0 ? 1 : 0.4, width: '100%' }}
                  onClick={() => { if (name && age && selectedSubjects.length > 0) setStep(2) }}>
                  Continue →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, marginBottom: 6 }}>Learning philosophy (not an official curriculum) 📚</h2>
              <p style={{ color: TEXT_MUTED, marginBottom: 4, fontSize: 15 }}>The foundation every lesson is built on.</p>
              <p style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 20, fontStyle: 'italic' as const }}>Waypoint is inspired by homeschooling philosophies, not official curricula.</p>
              {curricula.map(c => (
                <button key={c.id} style={ccardStyle(curriculum === c.id)} onClick={() => setCurriculum(c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{c.icon}</span>
                    <span style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, color: curriculum === c.id ? PRIMARY : TEXT }}>{c.name}</span>
                  </div>
                  <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>{c.desc}</p>
                </button>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button style={backBtn} onClick={() => setStep(1)}>←</button>
                <button style={{ ...primaryBtn, opacity: curriculum ? 1 : 0.4 }} onClick={() => { if (curriculum) setStep(3) }}>Continue →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: TEXT, marginBottom: 6 }}>Where are you right now? 📍</h2>
              <p style={{ color: TEXT_MUTED, marginBottom: 24, fontSize: 15 }}>We'll weave your location into every lesson.</p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Country</label>
                <div style={{ position: 'relative' }}>
                  <input style={inputStyle} placeholder="Search country..." value={countrySearch}
                    onChange={e => { setCountrySearch(e.target.value); setShowCountryDropdown(true); setSelectedCountry(null) }}
                    onFocus={() => setShowCountryDropdown(true)} />
                  {showCountryDropdown && countrySearch.length > 0 && filteredCountries.length > 0 && (
                    <div style={dropdownStyle}>
                      {filteredCountries.map(c => (
                        <div key={c.isoCode} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 14, borderBottom: `1px solid ${BEIGE_BORDER}`, fontFamily: 'inherit' }}
                          onMouseDown={() => selectCountry(c)}
                          onMouseEnter={e => (e.currentTarget.style.background = BEIGE)}
                          onMouseLeave={e => (e.currentTarget.style.background = BEIGE_CARD)}>
                          {c.flag} {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>City</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inputStyle, opacity: selectedCountry ? 1 : 0.5 }}
                    placeholder={selectedCountry ? "Search city..." : "Select a country first"}
                    value={citySearch} disabled={!selectedCountry}
                    onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); setSelectedCity('') }}
                    onFocus={() => setShowCityDropdown(true)} />
                  {showCityDropdown && citySearch.length > 0 && filteredCities.length > 0 && (
                    <div style={dropdownStyle}>
                      {filteredCities.map((c, i) => (
                        <div key={i} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 14, borderBottom: `1px solid ${BEIGE_BORDER}`, fontFamily: 'inherit' }}
                          onMouseDown={() => selectCity(c)}
                          onMouseEnter={e => (e.currentTarget.style.background = BEIGE)}
                          onMouseLeave={e => (e.currentTarget.style.background = BEIGE_CARD)}>
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button style={backBtn} onClick={() => setStep(2)}>←</button>
                <button style={{ ...primaryBtn, opacity: selectedCountry && (selectedCity || citySearch) ? 1 : 0.4 }}
                  onClick={() => { if (selectedCountry && (selectedCity || citySearch)) setStep(4) }}>Continue →</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: TEXT, marginBottom: 6 }}>How does {name} learn best? 🎨</h2>
              <p style={{ color: TEXT_MUTED, marginBottom: 24, fontSize: 15 }}>We'll adapt every lesson to match.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {learnStyles.map(ls => (
                  <button key={ls} onClick={() => setLearnStyle(ls)}
                    style={{ padding: '15px 18px', borderRadius: 16, border: `2px solid ${learnStyle === ls ? PRIMARY : BEIGE_BORDER}`, background: learnStyle === ls ? PRIMARY_BG : BEIGE_CARD, color: learnStyle === ls ? PRIMARY : TEXT_MUTED, cursor: 'pointer', textAlign: 'left', fontSize: 15, fontFamily: 'inherit', fontWeight: 600 }}>
                    {ls}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Anything else? (optional)</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="e.g. dyslexic, bilingual, loves outdoor learning..."
                  value={notes} onChange={e => setNotes(e.target.value)}/>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={backBtn} onClick={() => setStep(3)}>←</button>
                <button style={{ ...primaryBtn, opacity: learnStyle && !loading ? 1 : 0.4 }}
                  onClick={() => { if (learnStyle && !loading) handleFinish() }}>
                  {loading ? 'Saving...' : 'Generate my week plan ✨'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
