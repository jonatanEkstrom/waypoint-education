'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const subjectColors: any = {"Math":"#0ABFBC","Science":"#10B981","Language Arts":"#F59E0B","History":"#F43F5E","Geography":"#0ABFBC","Art":"#8B5CF6","Music":"#F59E0B","Physical Education":"#10B981","Coding":"#635BFF","Life Skills":"#F97316"}
const subjectBg: any = {"Math":"#E0F8F7","Science":"#D1FAE5","Language Arts":"#FEF3C7","History":"#FFE4E6","Geography":"#E0F8F7","Art":"#EDE9FE","Music":"#FEF3C7","Physical Education":"#D1FAE5","Coding":"#E8E6FF","Life Skills":"#FFEDD5"}
const milestones: any = {"Math":{"4–6 years":"Counting & Early Number","7–9 years":"Numbers & Measurement","10–12 years":"Fractions & Geometry","13–15 years":"Algebra & Data","16–18 years":"Advanced Mathematics"},"Science":{"4–6 years":"Exploring the Natural World","7–9 years":"Living Things & Ecosystems","10–12 years":"Forces & Matter","13–15 years":"Biology & Chemistry","16–18 years":"Advanced Sciences"},"Language Arts":{"4–6 years":"Early Literacy","7–9 years":"Reading Comprehension","10–12 years":"Writing & Expression","13–15 years":"Critical Analysis","16–18 years":"Advanced Communication"},"default":{"4–6 years":"Foundation Skills","7–9 years":"Core Development","10–12 years":"Building Competence","13–15 years":"Advanced Application","16–18 years":"Mastery"}}
const curricula: any = {"charlotte-mason":{icon:"🌿",name:"Charlotte Mason",method:(s:string,n:string,c:string)=>({method:"🌿 Observe → Narrate → Record",desc:`${n} observes real-world examples of ${s.toLowerCase()} in ${c}, narrates what they discovered, then records it in a nature journal.`})},"classical":{icon:"🏛️",name:"Classical (Trivium)",method:(s:string,n:string,c:string)=>({method:"🏛️ Memorize → Understand → Express",desc:`${n} memorizes key facts about ${s.toLowerCase()}, works through logical questions, then expresses conclusions — drawing on examples from ${c}.`})},"unschooling":{icon:"🦋",name:"Unschooling",method:(s:string,n:string,c:string)=>({method:"🦋 Follow curiosity → Explore freely",desc:`${n} starts with a genuine question about ${s.toLowerCase()} and follows it wherever it leads — using ${c} as a living classroom.`})},"montessori":{icon:"🧩",name:"Montessori",method:(s:string,n:string,c:string)=>({method:"🧩 Prepare → Discover → Reflect",desc:`${n} independently chooses a hands-on activity related to ${s.toLowerCase()}, using real objects from ${c}.`})},"eclectic":{icon:"🎨",name:"Eclectic",method:(s:string,n:string,c:string)=>({method:"🎨 Best method for the moment",desc:`${n} engages with ${s.toLowerCase()} through whichever approach fits best today — always rooted in ${c}.`})}}

function getMilestone(subject: string, age: string) {
  return (milestones[subject] || milestones["default"])[age] || "Core Learning"
}

function buildLessons(child: any) {
  const { name, age_group: age, subjects, curriculum: cid, city } = child
  const c = curricula[cid] || curricula["eclectic"]
  const subPool = [...subjects, ...subjects, ...subjects].slice(0, 15)
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"]
  const durations = ["30 min","45 min","60 min","40 min","50 min"]
  const titleFns = [(s:string) => `${city} Through the Lens of ${s}`, (s:string) => `The ${s} of ${city}`, (s:string) => `${s} in the Wild`, (s:string) => `Living ${s}: A ${c.name} Approach`, (s:string) => `${name}'s ${s} Challenge`]
  return days.map((day, di) => ({
    day,
    lessons: [0,1,2].map(li => {
      const subject = subPool[(di*3+li) % subPool.length]
      const { method, desc } = c.method(subject, name, city)
      return { subject, title: titleFns[(di+li)%titleFns.length](subject), duration: durations[(di+li)%durations.length], method, description: desc, milestone: getMilestone(subject, age) }
    })
  }))
}

export default function DashboardPage() {
  const [child, setChild] = useState<any>(null)
  const [days, setDays] = useState<any[]>([])
  const [activeDay, setActiveDay] = useState(0)
  const [completed, setCompleted] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/onboarding'); return }
    const c = JSON.parse(stored)
    setChild(c)
    setDays(buildLessons(c))
  }, [])

  function toggleLesson(di: number, li: number) {
    const key = `${di}_${li}`
    setCompleted((prev: any) => ({ ...prev, [key]: !prev[key] }))
  }

  const totalDone = Object.values(completed).filter(Boolean).length
  const pct = Math.round((totalDone / 15) * 100)

  function handlePrint() {
    window.print()
  }

  if (!child) return <div style={{ minHeight:'100vh', background:'#F8F6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🧭</div>

  const currInfo = curricula[child.curriculum] || curricula["eclectic"]

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .lesson-card { break-inside: avoid; border: 1px solid #ddd !important; box-shadow: none !important; }
          .day-section { break-inside: avoid; }
        }
        .print-only { display: none; }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#F8F6FF', padding:'24px 16px' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>

          {/* Nav */}
          <div className="no-print" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
            <span style={{ fontFamily:'Georgia,serif', fontSize:20, fontWeight:700, color:'#1E1B2E' }}>🧭 Waypoint <span style={{ color:'#635BFF' }}>Education</span></span>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => router.push('/journal')} style={{ background:'none', border:'none', color:'#8B87A8', fontSize:13, cursor:'pointer', fontWeight:700 }}>📖 Journal</button>
              <button onClick={handlePrint} style={{ background:'none', border:'2px solid #635BFF', borderRadius:100, color:'#635BFF', fontSize:13, cursor:'pointer', fontWeight:700, padding:'8px 16px' }}>🖨️ Print week</button>
              <button onClick={() => router.push('/pricing')} style={{ background:'none', border:'none', color:'#635BFF', fontSize:13, cursor:'pointer', fontWeight:700 }}>✨ Upgrade</button>
            </div>
          </div>

          {/* Print header */}
          <div className="print-only" style={{ marginBottom:24, borderBottom:'2px solid #E4E0F5', paddingBottom:16 }}>
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:28, color:'#1E1B2E', marginBottom:4 }}>🧭 Waypoint Education</h1>
            <p style={{ color:'#8B87A8', fontSize:14 }}>Week plan for {child.name} · {child.age_group} · {currInfo.icon} {currInfo.name} · 📍 {child.city}, {child.country}</p>
            <p style={{ color:'#8B87A8', fontSize:12, marginTop:4 }}>Printed {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
          </div>

          {/* Trial banner */}
          <div className="no-print" style={{ background:'linear-gradient(135deg,#E8E6FF,#EEF0FF)', border:'2px solid rgba(99,91,255,0.2)', borderRadius:20, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ background:'#635BFF', color:'white', fontSize:20, fontWeight:800, width:48, height:48, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>10</div>
            <div>
              <div style={{ fontFamily:'Georgia,serif', fontSize:15, color:'#1E1B2E', marginBottom:2 }}>You're on your free trial 🎉</div>
              <div style={{ fontSize:13, color:'#8B87A8', fontWeight:600 }}>Full access for 10 days. Then choose Pro or Family to continue.</div>
            </div>
          </div>

          {/* Header */}
          <div style={{ background:'white', borderRadius:20, padding:22, border:'2px solid #E4E0F5', marginBottom:20, boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize:12, color:'#8B87A8', fontWeight:700 }}>📍 {child.city}, {child.country}</span>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:100, background:'#E8E6FF', color:'#635BFF', fontSize:12, fontWeight:700, marginLeft:12 }}>{currInfo.icon} {currInfo.name}</div>
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:22, margin:'8px 0 4px', color:'#1E1B2E' }}>{child.name}'s {child.city} Discovery Week 🧭</h1>
            <p style={{ color:'#8B87A8', fontSize:13, fontWeight:600 }}>{child.name} · {child.age_group} · {child.learn_style}</p>
          </div>

          {/* Progress */}
          <div className="no-print" style={{ background:'white', borderRadius:16, padding:'16px 20px', border:'2px solid #E4E0F5', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#8B87A8', fontWeight:600, marginBottom:8 }}>
              <span>{totalDone} of 15 lessons completed</span>
              <span style={{ fontWeight:800, color:'#635BFF' }}>{pct}%</span>
            </div>
            <div style={{ height:8, background:'#E4E0F5', borderRadius:100, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#635BFF,#0ABFBC)', borderRadius:100, transition:'width 0.5s' }}/>
            </div>
          </div>

          {/* Day tabs - screen only */}
          <div className="no-print" style={{ display:'flex', gap:8, marginBottom:20, overflowX:'auto' }}>
            {days.map((d, i) => (
              <button key={d.day} onClick={() => setActiveDay(i)} style={{ padding:'9px 18px', borderRadius:100, border:`2px solid ${activeDay===i?'#635BFF':'#E4E0F5'}`, background:activeDay===i?'#E8E6FF':'white', color:activeDay===i?'#635BFF':'#8B87A8', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit', whiteSpace:'nowrap' }}>
                {[0,1,2].every(li => completed[`${i}_${li}`]) ? '✅ ' : ''}{d.day}
              </button>
            ))}
          </div>

          {/* Screen view - single day */}
          <div className="no-print">
            {days[activeDay]?.lessons.map((lesson: any, li: number) => {
              const key = `${activeDay}_${li}`
              const done = !!completed[key]
              const color = subjectColors[lesson.subject] || "#635BFF"
              const bg = subjectBg[lesson.subject] || "#E8E6FF"
              return (
                <div key={li} className="lesson-card" style={{ background: done ? '#F0FDF4' : 'white', border:`2px solid ${done?'#10B981':'#E4E0F5'}`, borderRadius:20, padding:22, marginBottom:14, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ padding:'4px 12px', borderRadius:100, background:bg, color, fontSize:12, fontWeight:700 }}>{lesson.subject}</span>
                    <span style={{ fontSize:12, color:'#8B87A8', fontWeight:600 }}>⏱ {lesson.duration}</span>
                  </div>
                  <h3 style={{ fontFamily:'Georgia,serif', fontSize:18, marginBottom:8, color: done ? '#8B87A8' : '#1E1B2E', textDecoration: done ? 'line-through' : 'none' }}>{lesson.title}</h3>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:100, background:'#FEF3C7', color:'#92400E', fontSize:11, fontWeight:700, marginBottom:8 }}>📍 Milestone: {lesson.milestone}</div>
                  <div style={{ display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius:100, background:'#F0EDF8', color:'#8B87A8', fontSize:11, fontWeight:700, marginBottom:10, marginLeft:6 }}>{lesson.method}</div>
                  <p style={{ color:'#666', fontSize:14, lineHeight:1.7, marginBottom:14 }}>{lesson.description}</p>
                  <div style={{ background:'linear-gradient(135deg,#E8E6FF,#EEF0FF)', borderRadius:12, padding:'12px 14px', borderLeft:'4px solid #635BFF', marginBottom:14 }}>
                    <div style={{ fontSize:11, color:'#635BFF', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>📍 Local tip — {child.city}</div>
                    <p style={{ color:'#555', fontSize:13, lineHeight:1.6, margin:0 }}>{lesson.description}</p>
                  </div>
                  <button onClick={() => toggleLesson(activeDay, li)} style={{ width:'100%', padding:'12px 16px', borderRadius:14, border:`2px solid ${done?'#10B981':'#E4E0F5'}`, background:done?'#F0FDF4':'white', color:done?'#059669':'#8B87A8', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <span style={{ width:18, height:18, borderRadius:'50%', border:`2px solid currentColor`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>{done?'✓':''}</span>
                    {done ? 'Completed! ✨' : 'Mark as completed'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Print view - all days */}
          <div className="print-only">
            {days.map((day: any, di: number) => (
              <div key={day.day} className="day-section" style={{ marginBottom:32 }}>
                <h2 style={{ fontFamily:'Georgia,serif', fontSize:20, color:'#635BFF', marginBottom:16, paddingBottom:8, borderBottom:'2px solid #E4E0F5' }}>{day.day}</h2>
                {day.lessons.map((lesson: any, li: number) => (
                  <div key={li} className="lesson-card" style={{ background:'white', border:'2px solid #E4E0F5', borderRadius:12, padding:16, marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontWeight:700, color: subjectColors[lesson.subject] || '#635BFF' }}>{lesson.subject}</span>
                      <span style={{ fontSize:12, color:'#8B87A8' }}>⏱ {lesson.duration}</span>
                    </div>
                    <h3 style={{ fontFamily:'Georgia,serif', fontSize:16, marginBottom:6, color:'#1E1B2E' }}>{lesson.title}</h3>
                    <p style={{ fontSize:11, color:'#92400E', marginBottom:6, fontWeight:600 }}>📍 Milestone: {lesson.milestone}</p>
                    <p style={{ fontSize:12, color:'#8B87A8', marginBottom:6, fontWeight:600 }}>{lesson.method}</p>
                    <p style={{ fontSize:13, color:'#444', lineHeight:1.6, marginBottom:8 }}>{lesson.description}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#8B87A8' }}>
                      <span style={{ width:16, height:16, border:'2px solid #C4BFDA', borderRadius:4, display:'inline-block' }}></span>
                      <span>Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <p style={{ textAlign:'center', fontSize:11, color:'#C4BFDA', marginTop:32 }}>Generated by Waypoint Education · waypointeducation.com</p>
          </div>

          {/* CTA */}
          <div className="no-print" style={{ textAlign:'center', padding:'40px 28px', borderRadius:28, background:'linear-gradient(135deg,#635BFF,#8B85FF)', marginTop:32 }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🧭</div>
            <h3 style={{ fontFamily:'Georgia,serif', fontSize:22, marginBottom:8, color:'white' }}>Love this week's plan?</h3>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, lineHeight:1.7, marginBottom:20, fontWeight:600 }}>Get a new AI-generated week plan every week, with milestone tracking as you go.</p>
            <button onClick={() => router.push('/pricing')} style={{ padding:'15px 36px', borderRadius:100, border:'none', background:'white', color:'#635BFF', fontSize:15, fontWeight:800, cursor:'pointer' }}>See plans & pricing →</button>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:12, fontWeight:600 }}>From $12.99/mo · Cancel anytime</p>
          </div>

        </div>
      </div>
    </>
  )
}