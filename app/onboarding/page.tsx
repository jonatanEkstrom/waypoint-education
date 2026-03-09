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
  const [userId, setUserId] = useState<string>('guest')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id)
    })
  }, [])

  function toggleSubject(s: string) {
    if (selectedSubjects.includes(s)) setSelectedSubjects(selectedSubjects.filter(x => x !== s))
    else if (selectedSubjects.length < 5) setSelectedSubjects([...selectedSubjects, s])
  }

  const filteredCountries = allCountries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  ).slice(0, 8)

  const allCities = selectedCountry ? City.getCitiesOfCountry(selectedCountry.isoCode) || [] : []
  const filteredCities = allCities.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 8)

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
    setLoading(true)
    try {
      const childData = {
        name,
        age_group: age,
        subjects: selectedSubjects,
        curriculum,
        learn_style: learnStyle,
        notes,
        country: selectedCountry?.name || countrySearch,
        city: selectedCity || citySearch,
        profile_id: userId
      }
      localStorage.removeItem('cachedPlan')
      localStorage.removeItem('cachedPlanChild')
      localStorage.setItem('activeChild', JSON.stringify(childData))
      router.push('/dashboard')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const s: any = {
    screen: { minHeight:'100vh', background:'#F8F6FF', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
    card: { width:'100%', maxWidth:540, background:'white', borderRadius:24, padding:32, border:'2px solid #E4E0F5', boxShadow:'0 4px 24px rgba(99,91,255,0.08)' },
    label: { fontSize:12, color:'#8B87A8', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.05em', display:'block', marginBottom:8 },
    input: { width:'100%', padding:'13px 16px', borderRadius:14, border:'2px solid #E4E0F5', fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const },
    btn: { width:'100%', padding:15, borderRadius:100, border:'none', background:'#635BFF', color:'white', fontSize:16, fontWeight:800, cursor:'pointer', marginTop:24, fontFamily:'inherit' },
    tag: (sel: boolean) => ({ padding:'8px 16px', borderRadius:100, border:`2px solid ${sel?'#635BFF':'#E4E0F5'}`, background:sel?'#E8E6FF':'white', color:sel?'#635BFF':'#8B87A8', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' }),
    ccard: (sel: boolean) => ({ width:'100%', padding:'16px 20px', borderRadius:18, border:`2px solid ${sel?'#635BFF':'#E4E0F5'}`, background:sel?'#E8E6FF':'white', cursor:'pointer', textAlign:'left' as const, marginBottom:10, fontFamily:'inherit' }),
    dropdown: { position:'absolute' as const, top:'100%', left:0, right:0, background:'white', border:'2px solid #E4E0F5', borderRadius:14, marginTop:4, zIndex:100, boxShadow:'0 4px 16px rgba(0,0,0,0.1)', maxHeight:280, overflowY:'auto' as const },
    dropdownItem: { padding:'12px 16px', cursor:'pointer', fontSize:14, borderBottom:'1px solid #F3F4F6', fontFamily:'inherit' },
  }

  return (
    <div style={s.screen}>
      <div style={{ width:'100%', maxWidth:540 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <span style={{ fontFamily:'Georgia,serif', fontSize:22, color:'#1E1B2E', fontWeight:700 }}>🧭 Waypoint <span style={{ color:'#635BFF' }}>Education</span></span>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:28 }}>
          {['Child','Philosophy','Location','Style'].map((l,i) => (
            <div key={l} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ height:5, width:'100%', borderRadius:100, background: i+1<step?'#10B981':i+1===step?'#635BFF':'#E4E0F5' }}/>
              <span style={{ fontSize:10, fontWeight:700, color: i+1<step?'#10B981':i+1===step?'#635BFF':'#8B87A8' }}>{l}</span>
            </div>
          ))}
        </div>

        <div style={s.card}>
          {step === 1 && (
            <>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, marginBottom:6 }}>Tell us about your child 👦</h2>
              <p style={{ color:'#8B87A8', marginBottom:24, fontSize:15 }}>This shapes every lesson we create.</p>
              <div style={{ marginBottom:16 }}>
                <label style={s.label}>Child's name</label>
                <input style={s.input} placeholder="e.g. Sofia" value={name} onChange={e => setName(e.target.value)}/>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={s.label}>Age group</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {ageGroups.map(a => <button key={a} style={s.tag(age===a)} onClick={() => setAge(a)}>{a}</button>)}
                </div>
              </div>
              <div>
                <label style={s.label}>Priority subjects (up to 5)</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {subjects.map(sub => <button key={sub} style={s.tag(selectedSubjects.includes(sub))} onClick={() => toggleSubject(sub)}>{sub}</button>)}
                </div>
              </div>
              <button style={{ ...s.btn, opacity: name&&age&&selectedSubjects.length>0?1:0.4 }} onClick={() => { if(name&&age&&selectedSubjects.length>0) setStep(2) }}>Continue →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, marginBottom:6 }}>Choose your philosophy 📚</h2>
              <p style={{ color:'#8B87A8', marginBottom:24, fontSize:15 }}>The foundation every lesson is built on.</p>
              {curricula.map(c => (
                <button key={c.id} style={s.ccard(curriculum===c.id)} onClick={() => setCurriculum(c.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <span style={{ fontSize:20 }}>{c.icon}</span>
                    <span style={{ fontFamily:'Georgia,serif', fontSize:16, fontWeight:700, color: curriculum===c.id?'#635BFF':'#1E1B2E' }}>{c.name}</span>
                  </div>
                  <p style={{ fontSize:13, color:'#8B87A8', margin:0 }}>{c.desc}</p>
                </button>
              ))}
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button style={{ ...s.btn, background:'white', color:'#1E1B2E', border:'2px solid #E4E0F5', width:'auto', padding:'14px 24px', marginTop:0 }} onClick={() => setStep(1)}>←</button>
                <button style={{ ...s.btn, opacity: curriculum?1:0.4, marginTop:0 }} onClick={() => { if(curriculum) setStep(3) }}>Continue →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, marginBottom:6 }}>Where are you right now? 📍</h2>
              <p style={{ color:'#8B87A8', marginBottom:24, fontSize:15 }}>We'll weave your location into every lesson.</p>

              <div style={{ marginBottom:16 }}>
                <label style={s.label}>Country</label>
                <div style={{ position:'relative' }}>
                  <input
                    style={s.input}
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={e => { setCountrySearch(e.target.value); setShowCountryDropdown(true); setSelectedCountry(null) }}
                    onFocus={() => setShowCountryDropdown(true)}
                  />
                  {showCountryDropdown && countrySearch.length > 0 && filteredCountries.length > 0 && (
                    <div style={s.dropdown}>
                      {filteredCountries.map(c => (
                        <div key={c.isoCode} style={s.dropdownItem}
                          onMouseDown={() => selectCountry(c)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F8F6FF')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                          {c.flag} {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom:8 }}>
                <label style={s.label}>City</label>
                <div style={{ position:'relative' }}>
                  <input
                    style={{ ...s.input, opacity: selectedCountry ? 1 : 0.5 }}
                    placeholder={selectedCountry ? "Search city..." : "Select a country first"}
                    value={citySearch}
                    disabled={!selectedCountry}
                    onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); setSelectedCity('') }}
                    onFocus={() => setShowCityDropdown(true)}
                  />
                  {showCityDropdown && citySearch.length > 0 && filteredCities.length > 0 && (
                    <div style={s.dropdown}>
                      {filteredCities.map((c, i) => (
                        <div key={i} style={s.dropdownItem}
                          onMouseDown={() => selectCity(c)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#F8F6FF')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', gap:12, marginTop:24 }}>
                <button style={{ ...s.btn, background:'white', color:'#1E1B2E', border:'2px solid #E4E0F5', width:'auto', padding:'14px 24px', marginTop:0 }} onClick={() => setStep(2)}>←</button>
                <button style={{ ...s.btn, opacity: selectedCountry&&(selectedCity||citySearch)?1:0.4, marginTop:0 }} onClick={() => { if(selectedCountry&&(selectedCity||citySearch)) setStep(4) }}>Continue →</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, marginBottom:6 }}>How does {name} learn best? 🎨</h2>
              <p style={{ color:'#8B87A8', marginBottom:24, fontSize:15 }}>We'll adapt every lesson to match.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                {learnStyles.map(ls => (
                  <button key={ls} style={{ padding:'15px 18px', borderRadius:16, border:`2px solid ${learnStyle===ls?'#635BFF':'#E4E0F5'}`, background:learnStyle===ls?'#E8E6FF':'white', color:learnStyle===ls?'#635BFF':'#8B87A8', cursor:'pointer', textAlign:'left', fontSize:15, fontFamily:'inherit', fontWeight:600 }} onClick={() => setLearnStyle(ls)}>{ls}</button>
                ))}
              </div>
              <div style={{ marginBottom:8 }}>
                <label style={s.label}>Anything else? (optional)</label>
                <textarea style={{ ...s.input, minHeight:80, resize:'vertical' }} placeholder="e.g. dyslexic, bilingual, loves outdoor learning..." value={notes} onChange={e => setNotes(e.target.value)}/>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:16 }}>
                <button style={{ ...s.btn, background:'white', color:'#1E1B2E', border:'2px solid #E4E0F5', width:'auto', padding:'14px 24px', marginTop:0 }} onClick={() => setStep(3)}>←</button>
                <button style={{ ...s.btn, opacity: learnStyle&&!loading?1:0.4, marginTop:0 }} onClick={() => { if(learnStyle&&!loading) handleFinish() }}>
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