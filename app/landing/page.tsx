'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [children, setChildren] = useState(1)

  const basePrice = billing === 'monthly' ? 12.99 : billing === 'quarterly' ? 10.99 : 8.99
  const extraChildren = Math.max(0, children - 1) * 6
  const totalMonthly = basePrice + extraChildren
  const totalYearly = (totalMonthly * 12).toFixed(2)
  const savings = billing === 'yearly' ? ((12.99 + extraChildren - totalMonthly) * 12).toFixed(0) : billing === 'quarterly' ? ((12.99 + extraChildren - totalMonthly) * 12).toFixed(0) : null

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
      <div style={{ background: 'linear-gradient(135deg, #F8F6FF 0%, #EEF2FF 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: '#E8E6FF', color: '#635BFF', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            ✨ AI-powered homeschooling for worldschooling families
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 52, lineHeight: 1.15, marginBottom: 24, color: '#1E1B2E' }}>
            The world is their classroom.<br/>
            <span style={{ color: '#635BFF' }}>We write the lesson plans.</span>
          </h1>
          <p style={{ fontSize: 20, color: '#6B7280', lineHeight: 1.6, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            AI-generated weekly lesson plans tailored to your child's age, location and learning style. From Bangkok to Barcelona — school follows you.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/auth')} style={{ padding: '16px 36px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(99,91,255,0.35)' }}>
              Start 10-day free trial →
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '16px 36px', borderRadius: 100, border: '2px solid #E4E0F5', background: 'white', color: '#635BFF', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
              See how it works
            </button>
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: '#8B87A8', fontWeight: 600 }}>No credit card required · Cancel anytime</p>
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
          <p style={{ color: '#6B7280', fontSize: 17, marginBottom: 40 }}>Start free for 10 days. No credit card required.</p>

          {/* Billing toggle */}
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

            {/* Children selector */}
            <div style={{ background: '#F8F6FF', borderRadius: 16, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: '#8B87A8', fontWeight: 700, marginBottom: 12 }}>NUMBER OF CHILDREN</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => setChildren(n)} style={{ width: 48, height: 48, borderRadius: 12, border: `2px solid ${children === n ? '#635BFF' : '#E4E0F5'}`, background: children === n ? '#635BFF' : 'white', color: children === n ? 'white' : '#8B87A8', cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: 'inherit' }}>{n}</button>
                ))}
              </div>
              {children > 1 && <div style={{ fontSize: 12, color: '#8B87A8', marginTop: 8 }}>Base ${ billing === 'monthly' ? '12.99' : billing === 'quarterly' ? '10.99' : '8.99'} + {children - 1} extra {children === 2 ? 'child' : 'children'} × $6</div>}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', textAlign: 'left' }}>
              {['AI-generated weekly lesson plans', 'Interactive worksheets with AI grading', 'Travel journal with AI stories', 'Works in every country & city', 'Up to ' + children + (children === 1 ? ' child' : ' children'), '10-day free trial included'].map(item => (
                <li key={item} style={{ padding: '8px 0', fontSize: 15, color: '#4B5563', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span> {item}
                </li>
              ))}
            </ul>

            <button onClick={() => router.push('/auth')} style={{ width: '100%', padding: '16px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(99,91,255,0.35)' }}>
              Start 10-day free trial →
            </button>
            <p style={{ fontSize: 12, color: '#8B87A8', marginTop: 12, fontWeight: 600 }}>No credit card required · Cancel anytime</p>
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
      <div style={{ background: 'linear-gradient(135deg, #635BFF, #8B5CF6)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🌍</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 40, color: 'white', marginBottom: 16 }}>Ready to start your worldschooling journey?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 40 }}>Join families in 50+ countries who never skip a school day.</p>
          <button onClick={() => router.push('/auth')} style={{ padding: '18px 48px', borderRadius: 100, border: 'none', background: 'white', color: '#635BFF', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            Start free for 10 days →
          </button>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 16, fontSize: 13, fontWeight: 600 }}>No credit card required · Cancel anytime</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1E1B2E', padding: '32px 24px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: 'white' }}>🧭 Waypoint <span style={{ color: '#635BFF' }}>Education</span></span>
        <p style={{ color: '#8B87A8', fontSize: 13, marginTop: 8 }}>© 2026 Waypoint Education · The world is their classroom.</p>
      </div>

    </div>
  )
}