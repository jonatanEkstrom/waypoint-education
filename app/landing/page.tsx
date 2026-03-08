'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrame: number
    let rotation = 0

    const waypoints = [
      { lat: 13.7, lng: 100.5, label: '🏛 Bangkok' },
      { lat: 41.9, lng: 12.5, label: '🏟 Rome' },
      { lat: 35.7, lng: 139.7, label: '⛩ Tokyo' },
      { lat: -33.9, lng: 18.4, label: '🦁 Cape Town' },
      { lat: 40.4, lng: -3.7, label: '🎨 Madrid' },
      { lat: 27.2, lng: 78.0, label: '🕌 Agra' },
      { lat: 51.5, lng: -0.1, label: '🎡 London' },
      { lat: 48.8, lng: 2.3, label: '🗼 Paris' },
      { lat: -13.5, lng: -71.9, label: '🏔 Machu Picchu' },
      { lat: 30.0, lng: 31.2, label: '🐪 Cairo' },
    ]

    function latLngTo3D(lat: number, lng: number, radius: number, rot: number) {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + rot) * (Math.PI / 180)
      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta)
      }
    }

    function drawGlobe() {
      const w = canvas!.width
      const h = canvas!.height
      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) * 0.42

      ctx!.clearRect(0, 0, w, h)

      // Glow
      const glow = ctx!.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.2)
      glow.addColorStop(0, 'rgba(99,91,255,0.15)')
      glow.addColorStop(1, 'rgba(99,91,255,0)')
      ctx!.fillStyle = glow
      ctx!.beginPath()
      ctx!.arc(cx, cy, r * 1.2, 0, Math.PI * 2)
      ctx!.fill()

      // Ocean
      const ocean = ctx!.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r)
      ocean.addColorStop(0, '#4F46E5')
      ocean.addColorStop(1, '#1E1B4B')
      ctx!.fillStyle = ocean
      ctx!.beginPath()
      ctx!.arc(cx, cy, r, 0, Math.PI * 2)
      ctx!.fill()

      // Grid lines
      ctx!.strokeStyle = 'rgba(139,92,246,0.2)'
      ctx!.lineWidth = 0.5

      for (let lat = -80; lat <= 80; lat += 20) {
        ctx!.beginPath()
        let first = true
        for (let lng = -180; lng <= 180; lng += 2) {
          const p = latLngTo3D(lat, lng, r, rotation)
          if (p.z > 0) {
            const sx = cx + p.x
            const sy = cy - p.y
            if (first) { ctx!.moveTo(sx, sy); first = false }
            else ctx!.lineTo(sx, sy)
          } else { first = true }
        }
        ctx!.stroke()
      }

      for (let lng = -180; lng <= 180; lng += 20) {
        ctx!.beginPath()
        let first = true
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = latLngTo3D(lat, lng, r, rotation)
          if (p.z > 0) {
            const sx = cx + p.x
            const sy = cy - p.y
            if (first) { ctx!.moveTo(sx, sy); first = false }
            else ctx!.lineTo(sx, sy)
          } else { first = true }
        }
        ctx!.stroke()
      }

      // Globe edge
      const edge = ctx!.createLinearGradient(cx - r, cy, cx + r, cy)
      edge.addColorStop(0, 'rgba(99,91,255,0.8)')
      edge.addColorStop(0.5, 'transparent')
      edge.addColorStop(1, 'rgba(99,91,255,0.4)')
      ctx!.strokeStyle = edge
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.arc(cx, cy, r, 0, Math.PI * 2)
      ctx!.stroke()

      // Shine
      const shine = ctx!.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.6)
      shine.addColorStop(0, 'rgba(255,255,255,0.12)')
      shine.addColorStop(1, 'rgba(255,255,255,0)')
      ctx!.fillStyle = shine
      ctx!.beginPath()
      ctx!.arc(cx, cy, r, 0, Math.PI * 2)
      ctx!.fill()

      // Waypoints
      waypoints.forEach(wp => {
        const p = latLngTo3D(wp.lat, wp.lng, r, rotation)
        if (p.z > 0) {
          const sx = cx + p.x
          const sy = cy - p.y
          const size = 4 + (p.z / r) * 4
          const alpha = 0.4 + (p.z / r) * 0.6

          // Pulse
          ctx!.beginPath()
          ctx!.arc(sx, sy, size * 2.5, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(251,191,36,${alpha * 0.2})`
          ctx!.fill()

          ctx!.beginPath()
          ctx!.arc(sx, sy, size, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(251,191,36,${alpha})`
          ctx!.fill()

          if (p.z > r * 0.3) {
            ctx!.font = `bold ${10 + (p.z / r) * 4}px system-ui`
            ctx!.fillStyle = `rgba(255,255,255,${alpha})`
            ctx!.fillText(wp.label, sx + size + 4, sy + 4)
          }
        }
      })

      rotation += 0.15
      animFrame = requestAnimationFrame(drawGlobe)
    }

    drawGlobe()
    return () => cancelAnimationFrame(animFrame)
  }, [])

  return (
    <canvas ref={canvasRef} width={440} height={440}
      style={{ width: '100%', maxWidth: 440, height: 'auto' }} />
  )
}

function VintageMap() {
  const stops = [
    { city: 'New York', emoji: '🗽', x: 20, y: 35 },
    { city: 'London', emoji: '🎡', x: 45, y: 20 },
    { city: 'Rome', emoji: '🏛', x: 52, y: 28 },
    { city: 'Cairo', emoji: '🐪', x: 55, y: 42 },
    { city: 'Bangkok', emoji: '🛕', x: 75, y: 48 },
    { city: 'Tokyo', emoji: '⛩', x: 85, y: 30 },
    { city: 'Sydney', emoji: '🦘', x: 88, y: 72 },
  ]

  return (
    <div style={{ background: '#FDF6E3', borderRadius: 20, padding: 24, border: '3px solid #D4A853', position: 'relative', overflow: 'hidden', minHeight: 280 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'repeating-linear-gradient(0deg, #8B6914 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #8B6914 0px, transparent 1px, transparent 40px)' }}/>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#8B6914', textAlign: 'center', marginBottom: 16, fontFamily: 'Georgia,serif', letterSpacing: '0.1em' }}>✦ WAYPOINT LEARNING JOURNEY ✦</div>
      <svg width="100%" height="200" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0,0 L4,2 L0,4 Z" fill="#D4A853"/>
          </marker>
        </defs>
        {stops.slice(0, -1).map((stop, i) => (
          <line key={i}
            x1={stop.x} y1={stop.y}
            x2={stops[i+1].x} y2={stops[i+1].y}
            stroke="#D4A853" strokeWidth="0.8" strokeDasharray="2,1.5"
            markerEnd="url(#arrow)" opacity="0.7"/>
        ))}
        {stops.map((stop, i) => (
          <g key={stop.city}>
            <circle cx={stop.x} cy={stop.y} r="3" fill="#D4A853" opacity="0.9"/>
            <circle cx={stop.x} cy={stop.y} r="5" fill="none" stroke="#D4A853" strokeWidth="0.5" opacity="0.5"/>
            <text x={stop.x} y={stop.y - 5} textAnchor="middle" fontSize="5" fill="#8B6914" fontFamily="Georgia,serif">{stop.emoji}</text>
            <text x={stop.x} y={stop.y + 9} textAnchor="middle" fontSize="3.5" fill="#8B6914" fontFamily="Georgia,serif">{stop.city}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
        {['📚 Math in Tokyo', '🌿 Science in Bangkok', '🎨 Art in Rome'].map(t => (
          <span key={t} style={{ fontSize: 11, color: '#8B6914', fontWeight: 600, fontFamily: 'Georgia,serif' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [children, setChildren] = useState(1)

  const basePrice = billing === 'monthly' ? 12.99 : billing === 'quarterly' ? 10.99 : 8.99
  const extraChildren = Math.max(0, children - 1) * 6
  const totalMonthly = basePrice + extraChildren
  const totalYearly = (totalMonthly * 12).toFixed(2)
  const savings = billing !== 'monthly' ? ((12.99 + extraChildren - totalMonthly) * 12).toFixed(0) : null

  const features = [
    { icon: '🗺️', title: 'Location-based lessons', desc: 'Every lesson connects to where you are right now — markets, temples, beaches and more.' },
    { icon: '🤖', title: 'AI-powered planning', desc: 'Claude generates a full 5-day lesson plan in seconds, tailored to your child\'s age and learning style.' },
    { icon: '📄', title: 'Interactive worksheets', desc: 'Fun, printable worksheets with matching, fill-in-the-blank, quizzes and AI grading.' },
    { icon: '📖', title: 'Travel journal', desc: 'Document your adventures with AI-written stories based on your child\'s own words.' },
    { icon: '👨‍👩‍👧', title: 'Parent tips included', desc: 'Every lesson comes with practical guidance on how to teach it — no teaching degree required.' },
    { icon: '🧠', title: 'Built-in quizzes', desc: 'Mini quizzes after each lesson to reinforce learning and track progress.' },
  ]

  const faqs = [
    { q: 'Do I need teaching experience?', a: 'Not at all! Every lesson includes a parent tip explaining exactly how to teach it. Waypoint is designed for parents, not teachers.' },
    { q: 'What ages does it work for?', a: 'Waypoint supports children from 4 to 18 years. Lessons are automatically adapted to your child\'s age group.' },
    { q: 'Can I use it if we\'re not traveling?', a: 'Absolutely! Waypoint works great for any homeschooling family, whether you\'re traveling the world or staying local.' },
    { q: 'What happens after the free trial?', a: 'After 10 days, your subscription starts automatically. You can cancel anytime before the trial ends — no questions asked.' },
    { q: 'Can I add more children later?', a: 'Yes! You can add children at any time. Each additional child costs $6/month on top of your base plan.' },
    { q: 'Which teaching philosophies are supported?', a: 'Charlotte Mason, Classical (Trivium), Unschooling, Montessori, and Eclectic. You choose when you set up your child\'s profile.' },
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#1E1B2E' }}>

      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '2px solid #E4E0F5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700 }}>🧭 Waypoint <span style={{ color: '#635BFF' }}>Education</span></span>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/auth')} style={{ padding: '8px 20px', borderRadius: 100, border: '2px solid #E4E0F5', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#635BFF', fontFamily: 'inherit' }}>Sign in</button>
          <button onClick={() => router.push('/auth')} style={{ padding: '8px 20px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>Start free trial →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0F0C29 0%, #1E1B4B 50%, #24243e 100%)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: 1, minWidth: 300, maxWidth: 540 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,91,255,0.3)', color: '#A5B4FC', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 24, border: '1px solid rgba(99,91,255,0.4)' }}>
              ✨ AI-powered homeschooling for worldschooling families
            </div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 48, lineHeight: 1.15, marginBottom: 24, color: 'white' }}>
              The world is their classroom.<br/>
              <span style={{ color: '#A5B4FC' }}>We write the lesson plans.</span>
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 40 }}>
              AI-generated weekly lesson plans tailored to your child's age, location and learning style. From Bangkok to Barcelona — school follows you.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/auth')} style={{ padding: '16px 36px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(99,91,255,0.5)' }}>
                Start 10-day free trial →
              </button>
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Credit card required · Cancel before day 10 to avoid charges</p>
          </div>
          <div style={{ flex: 1, minWidth: 280, maxWidth: 440, display: 'flex', justifyContent: 'center' }}>
            <Globe />
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div style={{ background: 'white', padding: '24px', borderBottom: '2px solid #E4E0F5' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {['🌍 Works in any country', '👶 Ages 4–18', '📚 6 teaching philosophies', '⚡ Plan ready in 30 seconds'].map(item => (
            <span key={item} style={{ fontSize: 14, fontWeight: 700, color: '#6B7280' }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ background: '#F8F6FF', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 36, textAlign: 'center', marginBottom: 16 }}>Everything you need to homeschool anywhere</h2>
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 17, marginBottom: 56 }}>No planning stress. No missed school days. Just learning that moves with you.</p>

          {/* Vintage map */}
          <div style={{ marginBottom: 48 }}>
            <VintageMap />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: 'white', borderRadius: 20, padding: 28, border: '2px solid #E4E0F5' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 36, textAlign: 'center', marginBottom: 56 }}>Loved by worldschooling families</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { quote: "We've been traveling Southeast Asia for 8 months. Waypoint has been a lifesaver — the kids actually look forward to lessons now!", name: 'Sarah M.', location: 'Chiang Mai, Thailand', emoji: '🇹🇭' },
              { quote: "I was terrified about homeschooling while traveling. Waypoint made it so easy. The local tips are incredible — yesterday we learned about Roman history at an actual forum!", name: 'Marco & Lisa', location: 'Rome, Italy', emoji: '🇮🇹' },
              { quote: "The worksheets are amazing. My daughter loves the matching games and the AI grading means I don't have to do it myself!", name: 'Emma K.', location: 'Barcelona, Spain', emoji: '🇪🇸' },
            ].map(t => (
              <div key={t.name} style={{ background: '#F8F6FF', borderRadius: 20, padding: 28, border: '2px solid #E4E0F5' }}>
                <div style={{ fontSize: 24, marginBottom: 16 }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontSize: 15, color: '#1E1B2E', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 20 }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 100, background: '#E8E6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{t.emoji}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#8B87A8' }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ background: '#F8F6FF', padding: '80px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 36, marginBottom: 16 }}>Simple, transparent pricing</h2>
          <p style={{ color: '#6B7280', fontSize: 17, marginBottom: 40 }}>Start free for 10 days. Cancel before day 10 to avoid charges.</p>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32, background: 'white', borderRadius: 100, padding: 6, border: '2px solid #E4E0F5', width: 'fit-content', margin: '0 auto 32px' }}>
            {(['monthly', 'quarterly', 'yearly'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{ padding: '8px 20px', borderRadius: 100, border: 'none', background: billing === b ? '#635BFF' : 'transparent', color: billing === b ? 'white' : '#8B87A8', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                {b === 'monthly' ? 'Monthly' : b === 'quarterly' ? 'Quarterly' : 'Yearly'}
                {b === 'quarterly' && <span style={{ marginLeft: 6, background: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: 100, fontSize: 10 }}>-15%</span>}
                {b === 'yearly' && <span style={{ marginLeft: 6, background: '#DCFCE7', color: '#16A34A', padding: '2px 6px', borderRadius: 100, fontSize: 10 }}>-31%</span>}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '2px solid #635BFF', boxShadow: '0 8px 32px rgba(99,91,255,0.12)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🧭</div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: 48, fontWeight: 700, color: '#1E1B2E' }}>${totalMonthly.toFixed(2)}</span>
              <span style={{ color: '#8B87A8', fontSize: 16 }}>/month</span>
              {billing !== 'monthly' && <div style={{ fontSize: 13, color: '#059669', fontWeight: 700, marginTop: 4 }}>Save ${savings}/year compared to monthly</div>}
              {billing === 'yearly' && <div style={{ fontSize: 13, color: '#8B87A8', marginTop: 4 }}>Billed as ${totalYearly}/year</div>}
            </div>

            <div style={{ background: '#F8F6FF', borderRadius: 16, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#8B87A8', fontWeight: 700, marginBottom: 12 }}>NUMBER OF CHILDREN</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => setChildren(n)} style={{ width: 48, height: 48, borderRadius: 12, border: `2px solid ${children === n ? '#635BFF' : '#E4E0F5'}`, background: children === n ? '#635BFF' : 'white', color: children === n ? 'white' : '#8B87A8', cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: 'inherit' }}>{n}</button>
                ))}
              </div>
              {children > 1 && <div style={{ fontSize: 12, color: '#8B87A8', marginTop: 8 }}>Base ${billing === 'monthly' ? '12.99' : billing === 'quarterly' ? '10.99' : '8.99'} + {children - 1} extra {children === 2 ? 'child' : 'children'} × $6</div>}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', textAlign: 'left' }}>
              {[
                'AI-generated weekly lesson plans',
                'Interactive worksheets with AI grading',
                'Travel journal with AI stories',
                'Works in every country & city',
                `Up to ${children} ${children === 1 ? 'child' : 'children'}`,
                '10-day free trial included'
              ].map(item => (
                <li key={item} style={{ padding: '8px 0', fontSize: 15, color: '#4B5563', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span> {item}
                </li>
              ))}
            </ul>

            <button onClick={() => router.push('/auth')} style={{ width: '100%', padding: '16px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(99,91,255,0.35)' }}>
              Start 10-day free trial →
            </button>
            <p style={{ fontSize: 12, color: '#8B87A8', marginTop: 12, fontWeight: 600 }}>Credit card required · Cancel before day 10 to avoid charges</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 36, textAlign: 'center', marginBottom: 56 }}>Frequently asked questions</h2>
          {faqs.map(faq => (
            <div key={faq.q} style={{ borderBottom: '2px solid #E4E0F5', padding: '24px 0' }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, marginBottom: 10 }}>{faq.q}</h3>
              <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #0F0C29, #1E1B4B)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🌍</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 40, color: 'white', marginBottom: 16 }}>Ready to start your worldschooling journey?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, marginBottom: 40 }}>Join families in 50+ countries who never skip a school day.</p>
          <button onClick={() => router.push('/auth')} style={{ padding: '18px 48px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(99,91,255,0.5)' }}>
            Start free for 10 days →
          </button>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 13, fontWeight: 600 }}>Credit card required · Cancel before day 10 to avoid charges</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#0F0C29', padding: '32px 24px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: 'white' }}>🧭 Waypoint <span style={{ color: '#635BFF' }}>Education</span></span>
        <p style={{ color: '#4B5563', fontSize: 13, marginTop: 8 }}>© 2026 Waypoint Education · The world is their classroom.</p>
      </div>

    </div>
  )
}