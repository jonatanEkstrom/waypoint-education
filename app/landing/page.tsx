'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'

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

export default function LandingPage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [children, setChildren] = useState(1)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
    { q: 'What happens after the free month?', a: 'After 30 days, you choose whether to continue with a paid plan or cancel — no pressure, no automatic charges for founding members.' },
    { q: 'Can I add more children later?', a: 'Yes! You can add children at any time. Each additional child costs $6/month on top of your base plan.' },
    { q: 'Which teaching philosophies are supported?', a: 'Charlotte Mason, Classical (Trivium), Unschooling, Montessori, and Eclectic. You choose when you set up your child\'s profile.' },
  ]

  async function handleBetaSignup() {
    if (!email) return
    setSubmitted(true)
  }

  const btn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer'
  })

  const sectionPad = isMobile ? '48px 16px' : '80px 24px'

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: TEXT, background: BEIGE }}>

      {/* Nav */}
      <nav style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 20, fontWeight: 700, color: TEXT }}>🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/auth')}
            onMouseEnter={() => setHover('signin')} onMouseLeave={() => setHover(null)}
            style={btn('signin', { padding: isMobile ? '7px 12px' : '8px 20px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY })}>
            Sign in
          </button>
          <button onClick={() => document.getElementById('beta')?.scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={() => setHover('navjoin')} onMouseLeave={() => setHover(null)}
            style={btn('navjoin', { padding: isMobile ? '7px 12px' : '8px 20px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
            {isMobile ? '→' : 'Join beta →'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, #EDF7F2 50%, #FFF8EC 100%)`, padding: isMobile ? '60px 16px 48px' : '100px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: PRIMARY_BG, color: PRIMARY, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 24, border: `1px solid ${PRIMARY_BORDER}` }}>
            🌍 Now accepting founding families — free for 30 days
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 32 : 52, lineHeight: isMobile ? 1.2 : 1.1, marginBottom: 20, color: TEXT }}>
            The world is their classroom.<br/>
            <span style={{ color: PRIMARY }}>We write the lesson plans.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 19, color: TEXT_MUTED, lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            AI-generated weekly lesson plans tailored to your child's age, location and learning style. From Bangkok to Barcelona — school follows you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexDirection: isMobile ? 'column' as const : 'row' as const, alignItems: 'center', marginBottom: 20 }}>
            <button onClick={() => document.getElementById('beta')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={() => setHover('herojoin')} onMouseLeave={() => setHover(null)}
              style={btn('herojoin', { padding: isMobile ? '15px 28px' : '18px 40px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: isMobile ? 16 : 18, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(155,142,196,0.35)', width: isMobile ? '100%' : 'auto' }, { background: PRIMARY_DARK })}>
              Join 50 founding families →
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={() => setHover('herofeatures')} onMouseLeave={() => setHover(null)}
              style={btn('herofeatures', { padding: isMobile ? '15px 28px' : '18px 40px', borderRadius: 100, border: `2px solid ${PRIMARY_BORDER}`, background: BEIGE_CARD, color: PRIMARY, fontSize: isMobile ? 16 : 18, fontWeight: 800, fontFamily: 'inherit', width: isMobile ? '100%' : 'auto' }, { background: PRIMARY_BG })}>
              See how it works
            </button>
          </div>
          <p style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>Free for 30 days · No credit card required · Cancel anytime</p>
        </div>
      </div>

      {/* Social proof */}
      <div style={{ background: BEIGE_CARD, padding: isMobile ? '20px 16px' : '28px 24px', borderBottom: `2px solid ${BEIGE_BORDER}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: isMobile ? 12 : 32, justifyContent: 'center', flexWrap: 'wrap' as const, alignItems: 'center' }}>
          {['🌍 Works in any country', '👶 Ages 4–18', '📚 6 philosophies', '⚡ Plan in 30 seconds'].map(item => (
            <span key={item} style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: TEXT_MUTED }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Beta signup */}
      <div id="beta" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${GREEN})`, padding: sectionPad, textAlign: 'center' as const }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: isMobile ? 40 : 48, marginBottom: 16 }}>🧭</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 36, color: 'white', marginBottom: 12 }}>Join 50 founding families</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: isMobile ? 15 : 17, marginBottom: 12 }}>Get free access for 30 days. Help shape the future of Waypoint.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 8, flexDirection: isMobile ? 'column' as const : 'row' as const }}>
            {['✓ 30 days free', '✓ No credit card', '✓ Your feedback shapes us'].map(p => (
              <span key={p} style={{ flex: 1, fontSize: 12, fontWeight: 700, color: 'white', textAlign: 'center' as const, padding: isMobile ? '4px 0' : 0 }}>{p}</span>
            ))}
          </div>
          {!submitted ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexDirection: isMobile ? 'column' as const : 'row' as const }}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, padding: '16px 20px', borderRadius: 100, border: 'none', fontSize: 15, fontFamily: 'inherit', outline: 'none', color: TEXT }} />
              <button onClick={handleBetaSignup}
                onMouseEnter={() => setHover('betajoin')} onMouseLeave={() => setHover(null)}
                style={btn('betajoin', { padding: '16px 28px', borderRadius: 100, border: 'none', background: TEXT, color: 'white', fontSize: 15, fontWeight: 800, fontFamily: 'inherit', whiteSpace: 'nowrap' as const }, { background: '#1a1a1a' })}>
                Get free access →
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: '24px', marginTop: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: 0 }}>You're on the list! We'll be in touch shortly.</p>
              <button onClick={() => router.push('/auth')} style={{ marginTop: 16, padding: '12px 28px', borderRadius: 100, border: 'none', background: 'white', color: PRIMARY, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                Or create your account now →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ background: BEIGE, padding: sectionPad }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 36, textAlign: 'center', marginBottom: 12, color: TEXT }}>Everything you need to homeschool anywhere</h2>
          <p style={{ textAlign: 'center', color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, marginBottom: 36 }}>No planning stress. No missed school days. Just learning that moves with you.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: BEIGE_CARD, borderRadius: 20, padding: isMobile ? 20 : 28, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, marginBottom: 8, color: TEXT }}>{f.title}</h3>
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founding families */}
      <div style={{ background: BEIGE_CARD, padding: sectionPad, textAlign: 'center' as const }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 16 }}>🌍</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 36, marginBottom: 16, color: TEXT }}>Be among the first founding families</h2>
          <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, lineHeight: 1.7, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            We're building Waypoint with a small group of worldschooling families who care deeply about real-world education. Your feedback will shape everything.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const, marginBottom: 32 }}>
            {['🗺️ 30 days free', '✉️ Direct access to the founders', '🛠️ Shape the product roadmap'].map(item => (
              <span key={item} style={{ background: PRIMARY_BG, color: PRIMARY, padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, border: `1px solid ${PRIMARY_BORDER}` }}>{item}</span>
            ))}
          </div>
          <button
            onClick={() => document.getElementById('beta')?.scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={() => setHover('foundingbtn')} onMouseLeave={() => setHover(null)}
            style={btn('foundingbtn', { padding: '14px 32px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 16, fontWeight: 800, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
            Claim your founding family spot →
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ background: BEIGE, padding: sectionPad }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' as const }}>
          <div style={{ display: 'inline-block', background: '#EDF7F2', color: GREEN_DARK, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 16, border: `1px solid ${GREEN}` }}>
            🎁 First 50 families get 30 days free
          </div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 36, marginBottom: 12, color: TEXT }}>Simple, transparent pricing</h2>
          <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, marginBottom: 32 }}>After your free month, choose the plan that fits your family.</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' as const, marginBottom: 28, background: BEIGE_CARD, borderRadius: 100, padding: 5, border: `2px solid ${BEIGE_BORDER}`, width: 'fit-content', margin: '0 auto 28px' }}>
            {(['monthly', 'quarterly', 'yearly'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)}
                style={{ padding: isMobile ? '7px 12px' : '8px 20px', borderRadius: 100, border: 'none', background: billing === b ? PRIMARY : 'transparent', color: billing === b ? 'white' : TEXT_MUTED, cursor: 'pointer', fontSize: isMobile ? 12 : 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {b === 'monthly' ? 'Monthly' : b === 'quarterly' ? 'Quarterly' : 'Yearly'}
                {b === 'quarterly' && <span style={{ marginLeft: 4, background: '#FFF8EC', color: '#C49040', padding: '2px 5px', borderRadius: 100, fontSize: 10 }}>-15%</span>}
                {b === 'yearly' && <span style={{ marginLeft: 4, background: '#EDF7F2', color: GREEN_DARK, padding: '2px 5px', borderRadius: 100, fontSize: 10 }}>-31%</span>}
              </button>
            ))}
          </div>
          <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: isMobile ? 20 : 40, border: `2px solid ${PRIMARY}`, boxShadow: '0 8px 32px rgba(155,142,196,0.12)' }}>
            <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 8 }}>🧭</div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 36 : 48, fontWeight: 700, color: TEXT }}>${totalMonthly.toFixed(2)}</span>
              <span style={{ color: TEXT_MUTED, fontSize: 16 }}>/month</span>
              {billing !== 'monthly' && <div style={{ fontSize: 13, color: GREEN_DARK, fontWeight: 700, marginTop: 4 }}>Save ${savings}/year compared to monthly</div>}
              {billing === 'yearly' && <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>Billed as ${totalYearly}/year</div>}
            </div>
            <div style={{ background: BEIGE, borderRadius: 16, padding: 16, marginBottom: 20, border: `1px solid ${BEIGE_BORDER}` }}>
              <div style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 700, marginBottom: 12 }}>NUMBER OF CHILDREN</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => setChildren(n)}
                    style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${children === n ? PRIMARY : BEIGE_BORDER}`, background: children === n ? PRIMARY : BEIGE_CARD, color: children === n ? 'white' : TEXT_MUTED, cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s' }}>{n}</button>
                ))}
              </div>
              {children > 1 && <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 8 }}>Base ${billing === 'monthly' ? '12.99' : billing === 'quarterly' ? '10.99' : '8.99'} + {children - 1} extra {children === 2 ? 'child' : 'children'} × $6</div>}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', textAlign: 'left' as const }}>
              {[
                'AI-generated weekly lesson plans',
                'Interactive worksheets with AI grading',
                'Travel journal with AI stories',
                'Works in every country & city',
                `Up to ${children} ${children === 1 ? 'child' : 'children'}`,
                '30-day free trial for founding families'
              ].map(item => (
                <li key={item} style={{ padding: '8px 0', fontSize: 14, color: TEXT, display: 'flex', gap: 10, alignItems: 'center', borderBottom: `1px solid ${BEIGE_BORDER}` }}>
                  <span style={{ color: GREEN_DARK, fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <button onClick={() => document.getElementById('beta')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={() => setHover('pricingbtn')} onMouseLeave={() => setHover(null)}
              style={btn('pricingbtn', { width: '100%', padding: '16px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 16, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(155,142,196,0.3)' }, { background: PRIMARY_DARK })}>
              Join as a founding family →
            </button>
            <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 12, fontWeight: 600 }}>30 days free · No credit card required · Cancel anytime</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: BEIGE_CARD, padding: sectionPad }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 36, textAlign: 'center', marginBottom: isMobile ? 28 : 56, color: TEXT }}>Frequently asked questions</h2>
          {faqs.map(faq => (
            <div key={faq.q} style={{ borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '20px 0' }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 17, marginBottom: 8, color: TEXT }}>{faq.q}</h3>
              <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: TEXT, padding: '28px 24px', textAlign: 'center' as const }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: 'white' }}>🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
        <p style={{ color: '#9E9188', fontSize: 13, marginTop: 8, marginBottom: 12 }}>© 2026 Waypoint Education · The world is their classroom.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>

    </div>
  )
}
