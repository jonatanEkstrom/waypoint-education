'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

function TravelIllustration() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => f + 1), 50)
    return () => clearInterval(interval)
  }, [])

  const planeX = 80 + Math.sin(frame * 0.02) * 20
  const planeY = 60 + Math.sin(frame * 0.015) * 10
  const cloud1X = (frame * 0.3) % 420
  const cloud2X = (frame * 0.2 + 200) % 420
  const balloonY = 80 + Math.sin(frame * 0.025) * 8

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
      <svg viewBox="0 0 400 340" width="100%" style={{ filter: 'drop-shadow(0 8px 32px rgba(99,91,255,0.15))' }}>

        {/* Sky background */}
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BFDBFE"/>
            <stop offset="100%" stopColor="#E0F2FE"/>
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86EFAC"/>
            <stop offset="100%" stopColor="#4ADE80"/>
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA"/>
            <stop offset="100%" stopColor="#3B82F6"/>
          </linearGradient>
        </defs>

        <rect width="400" height="340" fill="url(#sky)" rx="24"/>

        {/* Sun */}
        <circle cx="340" cy="50" r="28" fill="#FDE68A"/>
        <circle cx="340" cy="50" r="22" fill="#FCD34D"/>
        {[0,45,90,135,180,225,270,315].map((angle, i) => (
          <line key={i}
            x1={340 + Math.cos(angle * Math.PI/180) * 28}
            y1={50 + Math.sin(angle * Math.PI/180) * 28}
            x2={340 + Math.cos(angle * Math.PI/180) * 38}
            y2={50 + Math.sin(angle * Math.PI/180) * 38}
            stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
        ))}

        {/* Clouds */}
        <g transform={`translate(${cloud1X - 60}, 30)`} opacity="0.9">
          <ellipse cx="30" cy="20" rx="28" ry="14" fill="white"/>
          <ellipse cx="50" cy="15" rx="20" ry="12" fill="white"/>
          <ellipse cx="15" cy="18" rx="16" ry="10" fill="white"/>
        </g>
        <g transform={`translate(${cloud2X - 60}, 55)`} opacity="0.7">
          <ellipse cx="30" cy="20" rx="22" ry="11" fill="white"/>
          <ellipse cx="45" cy="15" rx="16" ry="10" fill="white"/>
          <ellipse cx="18" cy="18" rx="14" ry="9" fill="white"/>
        </g>

        {/* Ground / sea split */}
        <rect x="0" y="230" width="400" height="110" fill="url(#sea)" rx="0"/>
        <ellipse cx="200" cy="230" rx="200" ry="20" fill="#86EFAC"/>
        <rect x="0" y="230" width="220" height="110" fill="url(#ground)"/>
        <ellipse cx="110" cy="230" rx="110" ry="16" fill="#4ADE80"/>

        {/* Eiffel tower */}
        <g transform="translate(30, 150)">
          <polygon points="20,0 40,0 50,80 10,80" fill="#9CA3AF"/>
          <polygon points="22,0 38,0 44,50 16,50" fill="#D1D5DB"/>
          <rect x="18" y="25" width="24" height="4" fill="#9CA3AF"/>
          <rect x="14" y="50" width="32" height="4" fill="#9CA3AF"/>
          <rect x="28" y="-15" width="4" height="18" fill="#6B7280"/>
          <text x="20" y="98" fontSize="10" fill="#4B5563" fontWeight="700">Paris</text>
        </g>

        {/* Palm tree */}
        <g transform="translate(160, 165)">
          <rect x="8" y="20" width="8" height="60" fill="#92400E" rx="4"/>
          <ellipse cx="12" cy="20" rx="22" ry="12" fill="#4ADE80" transform="rotate(-20, 12, 20)"/>
          <ellipse cx="12" cy="20" rx="22" ry="12" fill="#22C55E" transform="rotate(20, 12, 20)"/>
          <ellipse cx="12" cy="20" rx="20" ry="10" fill="#4ADE80" transform="rotate(60, 12, 20)"/>
          <ellipse cx="12" cy="18" rx="8" ry="6" fill="#FCD34D"/>
          <text x="-2" y="92" fontSize="10" fill="#4B5563" fontWeight="700">Bali</text>
        </g>

        {/* Pyramid */}
        <g transform="translate(240, 175)">
          <polygon points="35,0 70,55 0,55" fill="#FCD34D"/>
          <polygon points="35,0 70,55 35,55" fill="#F59E0B"/>
          <text x="15" y="70" fontSize="10" fill="#4B5563" fontWeight="700">Cairo</text>
        </g>

        {/* Mount Fuji */}
        <g transform="translate(320, 160)">
          <polygon points="35,0 70,70 0,70" fill="#9CA3AF"/>
          <polygon points="35,0 50,25 20,25" fill="white"/>
          <text x="12" y="85" fontSize="10" fill="#4B5563" fontWeight="700">Tokyo</text>
        </g>

        {/* Kid with backpack on ground */}
        <g transform="translate(60, 195)">
          {/* Body */}
          <circle cx="20" cy="12" r="10" fill="#FED7AA"/>
          <rect x="12" y="22" width="16" height="22" fill="#635BFF" rx="4"/>
          {/* Backpack */}
          <rect x="24" y="23" width="10" height="14" fill="#F43F5E" rx="3"/>
          <rect x="25" y="25" width="8" height="3" fill="#BE185D" rx="1"/>
          {/* Arms */}
          <line x1="12" y1="26" x2="4" y2="36" stroke="#FED7AA" strokeWidth="4" strokeLinecap="round"/>
          <line x1="28" y1="26" x2="34" y2="32" stroke="#FED7AA" strokeWidth="4" strokeLinecap="round"/>
          {/* Legs */}
          <line x1="16" y1="44" x2="12" y2="58" stroke="#635BFF" strokeWidth="5" strokeLinecap="round"/>
          <line x1="24" y1="44" x2="28" y2="58" stroke="#635BFF" strokeWidth="5" strokeLinecap="round"/>
          {/* Shoes */}
          <ellipse cx="11" cy="59" rx="6" ry="3" fill="#1E1B2E"/>
          <ellipse cx="29" cy="59" rx="6" ry="3" fill="#1E1B2E"/>
          {/* Hair */}
          <ellipse cx="20" cy="5" rx="10" ry="6" fill="#92400E"/>
          {/* Map in hand */}
          <rect x="-2" y="32" width="8" height="6" fill="#FEF3C7" rx="1"/>
        </g>

        {/* Kid 2 waving */}
        <g transform="translate(110, 200)">
          <circle cx="18" cy="10" r="9" fill="#FBBF24"/>
          <rect x="11" y="19" width="14" height="20" fill="#10B981" rx="4"/>
          <line x1="11" y1="22" x2="2" y2="28" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"/>
          <line x1="25" y1="22" x2="30" y2="14" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"/>
          <line x1="14" y1="39" x2="11" y2="52" stroke="#10B981" strokeWidth="5" strokeLinecap="round"/>
          <line x1="22" y1="39" x2="25" y2="52" stroke="#10B981" strokeWidth="5" strokeLinecap="round"/>
          <ellipse cx="10" cy="53" rx="5" ry="3" fill="#1E1B2E"/>
          <ellipse cx="26" cy="53" rx="5" ry="3" fill="#1E1B2E"/>
          <ellipse cx="18" cy="4" rx="9" ry="5" fill="#92400E"/>
          {/* Star sparkle from waving hand */}
          <text x="26" y="12" fontSize="12">⭐</text>
        </g>

        {/* Airplane */}
        <g transform={`translate(${planeX}, ${planeY})`}>
          <ellipse cx="30" cy="12" rx="28" ry="8" fill="white"/>
          <polygon points="58,12 72,8 72,16" fill="white"/>
          <ellipse cx="30" cy="12" rx="10" ry="7" fill="#BFDBFE"/>
          <polygon points="20,20 8,28 36,20" fill="white"/>
          <polygon points="38,20 42,26 52,20" fill="white"/>
          <circle cx="24" cy="11" r="3" fill="#60A5FA"/>
          <circle cx="34" cy="11" r="3" fill="#60A5FA"/>
          <text x="8" y="-4" fontSize="10" fill="#635BFF" fontWeight="800">✈</text>
        </g>

        {/* Hot air balloon */}
        <g transform={`translate(340, ${balloonY})`}>
          <ellipse cx="20" cy="20" rx="18" ry="22" fill="#F43F5E"/>
          <ellipse cx="20" cy="20" rx="18" ry="22" fill="none" stroke="#BE185D" strokeWidth="1"/>
          <line x1="8" y1="38" x2="20" y2="42" stroke="#92400E" strokeWidth="1.5"/>
          <line x1="32" y1="38" x2="20" y2="42" stroke="#92400E" strokeWidth="1.5"/>
          <rect x="13" y="42" width="14" height="10" fill="#FCD34D" rx="3"/>
          <line x1="8" y1="10" x2="32" y2="10" stroke="#BE185D" strokeWidth="1" opacity="0.5"/>
          <line x1="4" y1="20" x2="36" y2="20" stroke="#BE185D" strokeWidth="1" opacity="0.5"/>
          <line x1="20" y1="0" x2="20" y2="42" stroke="#BE185D" strokeWidth="1" opacity="0.3"/>
        </g>

        {/* Sparkles */}
        <text x="200" y="100" fontSize="16" opacity={0.5 + Math.sin(frame * 0.08) * 0.5}>✨</text>
        <text x="140" y="70" fontSize="12" opacity={0.5 + Math.sin(frame * 0.06 + 1) * 0.5}>⭐</text>
        <text x="290" y="130" fontSize="14" opacity={0.5 + Math.sin(frame * 0.07 + 2) * 0.5}>🌟</text>

      </svg>
    </div>
  )
}

function ThinkersGrid() {
  const thinkers = [
    { name: 'Leonardo da Vinci', emoji: '🎨', subject: 'Art & Science', country: '🇮🇹 Italy', color: '#FEF3C7', accent: '#D97706' },
    { name: 'Albert Einstein', emoji: '⚛️', subject: 'Physics', country: '🇩🇪 Germany', color: '#EEF2FF', accent: '#635BFF' },
    { name: 'Thor Heyerdahl', emoji: '🚢', subject: 'Exploration', country: '🇳🇴 Norway', color: '#ECFDF5', accent: '#059669' },
    { name: 'Marie Curie', emoji: '🔬', subject: 'Chemistry', country: '🇵🇱 Poland', color: '#FDF2F8', accent: '#DB2777' },
    { name: 'Ibn Battuta', emoji: '🗺️', subject: 'Geography', country: '🇲🇦 Morocco', color: '#FFF7ED', accent: '#EA580C' },
    { name: 'Confucius', emoji: '📜', subject: 'Philosophy', country: '🇨🇳 China', color: '#F0FDF4', accent: '#16A34A' },
    { name: 'Nikola Tesla', emoji: '⚡', subject: 'Electricity', country: '🇷🇸 Serbia', color: '#EFF6FF', accent: '#2563EB' },
    { name: 'Cleopatra', emoji: '👑', subject: 'History', country: '🇪🇬 Egypt', color: '#FFFBEB', accent: '#B45309' },
    { name: 'Charles Darwin', emoji: '🦋', subject: 'Biology', country: '🇬🇧 England', color: '#F0FDF4', accent: '#15803D' },
    { name: 'Galileo Galilei', emoji: '🔭', subject: 'Astronomy', country: '🇮🇹 Italy', color: '#F8F6FF', accent: '#7C3AED' },
    { name: 'Maya Angelou', emoji: '✍️', subject: 'Literature', country: '🇺🇸 USA', color: '#FFF1F2', accent: '#E11D48' },
    { name: 'Pythagoras', emoji: '📐', subject: 'Mathematics', country: '🇬🇷 Greece', color: '#EEF2FF', accent: '#4F46E5' },
  ]

  return (
    <div>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 22, textAlign: 'center', marginBottom: 8, color: '#1E1B2E' }}>
        Learn from the greatest minds in history 🌍
      </h3>
      <p style={{ textAlign: 'center', color: '#8B87A8', fontSize: 14, marginBottom: 28 }}>
        Every destination unlocks lessons inspired by the people who shaped it
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {thinkers.map(t => (
          <div key={t.name} style={{ background: t.color, borderRadius: 16, padding: '20px 16px', border: `2px solid ${t.accent}33`, textAlign: 'center', transition: 'transform 0.15s', cursor: 'default' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{t.emoji}</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 700, color: '#1E1B2E', marginBottom: 4, lineHeight: 1.3 }}>{t.name}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>{t.subject}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{t.country}</div>
          </div>
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
      <div style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 50%, #E0F2FE 100%)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: 1, minWidth: 300, maxWidth: 520 }}>
            <div style={{ display: 'inline-block', background: '#E8E6FF', color: '#635BFF', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 24, border: '1px solid #C7D2FE' }}>
              ✨ AI-powered homeschooling for worldschooling families
            </div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 48, lineHeight: 1.15, marginBottom: 24, color: '#1E1B2E' }}>
              The world is their classroom.<br/>
              <span style={{ color: '#635BFF' }}>We write the lesson plans.</span>
            </h1>
            <p style={{ fontSize: 18, color: '#4B5563', lineHeight: 1.7, marginBottom: 40 }}>
              AI-generated weekly lesson plans tailored to your child's age, location and learning style. From Bangkok to Barcelona — school follows you.
            </p>
            <button onClick={() => router.push('/auth')} style={{ padding: '16px 36px', borderRadius: 100, border: 'none', background: '#635BFF', color: 'white', fontSize: 17, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(99,91,255,0.35)' }}>
              Start 10-day free trial →
            </button>
            <p style={{ marginTop: 16, fontSize: 13, color: '#8B87A8', fontWeight: 600 }}>Credit card required · Cancel before day 10 to avoid charges</p>
          </div>
          <div style={{ flex: 1, minWidth: 280, maxWidth: 480, display: 'flex', justifyContent: 'center' }}>
            <TravelIllustration />
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
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 17, marginBottom: 48 }}>No planning stress. No missed school days. Just learning that moves with you.</p>
          <div style={{ marginBottom: 56 }}>
            <ThinkersGrid />
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
      <div style={{ background: 'linear-gradient(135deg, #635BFF, #8B5CF6)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>🌍</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 40, color: 'white', marginBottom: 16 }}>Ready to start your worldschooling journey?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 40 }}>Join families in 50+ countries who never skip a school day.</p>
          <button onClick={() => router.push('/auth')} style={{ padding: '18px 48px', borderRadius: 100, border: 'none', background: 'white', color: '#635BFF', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            Start free for 10 days →
          </button>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 16, fontSize: 13, fontWeight: 600 }}>Credit card required · Cancel before day 10 to avoid charges</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1E1B2E', padding: '32px 24px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: 'white' }}>🧭 Waypoint <span style={{ color: '#635BFF' }}>Education</span></span>
        <p style={{ color: '#4B5563', fontSize: 13, marginTop: 8 }}>© 2026 Waypoint Education · The world is their classroom.</p>
      </div>

    </div>
  )
}