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
const ORANGE = '#F5A623'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

const PLANS = [
  {
    key: 'monthly',
    label: 'Monthly',
    price: '€11',
    sub: 'per month',
    billed: 'Billed monthly',
    badge: null,
    highlight: false,
  },
  {
    key: 'quarterly',
    label: 'Quarterly',
    price: '€29',
    sub: 'per quarter',
    billed: 'Billed €29 every 3 months',
    badge: 'Save 12%',
    highlight: true,
  },
  {
    key: 'yearly',
    label: 'Yearly',
    price: '€99',
    sub: 'per year',
    billed: 'Billed €99/year',
    badge: 'Save 25%',
    highlight: false,
  },
]

const FEATURES = [
  { icon: '🗺️', title: 'Location-based lessons', desc: 'Every lesson is rooted in where you are right now — local markets, temples, nature, history and more.' },
  { icon: '⚡', title: 'AI lesson plans in 30 seconds', desc: 'Get a full 5-day lesson plan instantly, tailored to your child\'s age, location and learning style.' },
  { icon: '📄', title: 'Interactive worksheets', desc: 'Fun worksheets with matching, fill-in-the-blank and quizzes — all auto-graded by AI.' },
  { icon: '📖', title: 'Travel journal', desc: 'Capture memories, reflections and discoveries from every destination you visit together.' },
  { icon: '👩‍👧', title: 'Parent tips included', desc: 'Every lesson comes with a practical guide on how to teach it — no teaching background needed.' },
  { icon: '🧠', title: 'Built-in progress tracking', desc: 'Mini quizzes after each lesson keep learning on track and show you what\'s sticking.' },
  { icon: '📖', title: 'Little Readers', desc: 'Playful flashcards, phonics games and rhyme activities that teach reading — in your family\'s language. Progress saves automatically for each child.' },
  { icon: '📁', title: 'Living Portfolio', desc: 'Every journal entry becomes part of your child\'s portfolio automatically. Tag by subject and export a beautiful PDF report — perfect for UK Local Authority inquiries.' },
  { icon: '🌍', title: 'Learn in Your Language', desc: 'Set your family\'s language once. Stories, lessons and activities are generated in that language — whether Swedish, French, Spanish or English.' },
]

const FAQS = [
  {
    q: 'What is worldschooling?',
    a: 'Worldschooling is a form of home education in which families travel continuously or semi-continuously and use the world itself as their primary classroom. Rather than following a fixed national curriculum, worldschooling families design learning around real experiences: visiting ancient ruins, exploring local markets, learning from indigenous communities, and adapting lessons to each destination. Worldschooling is legal in most countries and is recognised in the UK under the right to home educate outside the school system. It blends academic subjects with cultural immersion, language exposure, and independent thinking — producing children who are adaptable, curious, and globally literate.',
  },
  {
    q: 'Do I need a formal curriculum for home education?',
    a: 'In England and Wales, the law (Education Act 1996, Section 7) requires parents to ensure their child receives a full-time education suitable to their age, ability and aptitude — but it does not specify how or where that education is delivered. There is no legal requirement to follow the National Curriculum, use a registered provider, or teach set hours per day. Local Authorities can request information about your educational provision, but home-educating families have wide latitude in choosing their approach. Waypoint helps families document their learning regardless of which philosophy they follow — Charlotte Mason, Classical, Unschooling, Montessori, or Eclectic.',
  },
  {
    q: 'How does Waypoint create personalised lesson plans?',
    a: "Waypoint uses Claude (Anthropic's AI model) to generate lesson plans tailored to three key inputs: your child's current location, their age group and learning style, and your chosen teaching philosophy. When you enter a city — say, Lisbon, Chiang Mai, or Buenos Aires — the AI weaves that location into every lesson: local history, geography, food systems, language, ecology. Plans are generated fresh each week and are never generic or recycled. The process takes under 30 seconds and produces a full five-day schedule with lesson titles, goals, activities, and parent delivery tips.",
  },
  {
    q: 'Can I use Waypoint to produce UK Local Authority reports?',
    a: "Yes. Waypoint includes a dedicated Local Authority report generator. The report compiles your child's journal entries, completed lesson plans, and subject coverage into a structured document formatted for Local Authority inquiries. It includes a written educational philosophy statement, a learning record grouped by subject, and a summary of the topics covered. The report can be exported as a PDF directly from the app. Many UK home-educating families use it to respond to Section 437 notices or to proactively demonstrate their provision.",
  },
  {
    q: 'What ages does Waypoint support?',
    a: 'Waypoint supports children from 4 to 18 years old, divided into four age tiers: Early Explorers (4–6), Young Adventurers (7–9), Junior Scholars (10–12), and Independent Thinkers (13–18). Each tier receives age-appropriate vocabulary, lesson depth, activity complexity, and reading-level calibration. The Practice Mode — with structured exercises, AI feedback, and Socratic follow-up — is available for children aged 10 and above. Little Readers, the phonics and reading programme, is designed for children aged 3–8 who are learning to read.',
  },
  {
    q: 'Do I need teaching experience to use Waypoint?',
    a: "No teaching background is needed. Every lesson generated by Waypoint includes a parent tip section that explains how to introduce the topic, what questions to ask, and how to adapt the activity if your child is struggling or needs more challenge. The app is designed for parents, not professional educators. The AI handles lesson design, content accuracy, and curriculum sequencing — your job is to facilitate and enjoy learning alongside your child.",
  },
  {
    q: 'What happens after the 10-day free trial?',
    a: "After your 10-day trial, you'll be invited to choose a plan to continue. No payment card is required to start the trial — you only enter payment details when you're ready to subscribe. If you don't subscribe, your account becomes read-only: you can still view your journal entries and lesson history, but new plans won't be generated. There's no automatic charge at the end of the trial.",
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [hover, setHover] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const btn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer',
  })

  const sectionPad = isMobile ? '52px 16px' : '88px 24px'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Waypoint Education',
    description: 'AI-powered homeschooling platform for worldschooling and traveling families. Generate personalised lesson plans in 30 seconds, track progress, and export Local Authority reports.',
    url: 'https://waypointeducation.world',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '11',
      priceCurrency: 'EUR',
      description: 'Monthly subscription, billed monthly. 10-day free trial included.',
    },
    featureList: [
      'AI lesson plan generation',
      'Location-based personalised curriculum',
      'UK Local Authority report export',
      'Travel journal and portfolio',
      'Practice Mode with AI feedback',
      'Little Readers phonics programme',
    ],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'parent',
    },
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: TEXT, background: BEIGE }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: isMobile ? '12px 16px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 20, fontWeight: 700, color: TEXT }}>
          🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span>
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/auth')}
            onMouseEnter={() => setHover('signin')} onMouseLeave={() => setHover(null)}
            style={btn('signin', { padding: isMobile ? '7px 12px' : '8px 20px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY })}>
            Sign in
          </button>
          <button onClick={() => router.push('/auth')}
            onMouseEnter={() => setHover('navtrial')} onMouseLeave={() => setHover(null)}
            style={btn('navtrial', { padding: isMobile ? '7px 12px' : '8px 20px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
            {isMobile ? 'Try free →' : 'Start free trial →'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, #EDF7F2 50%, #FFF8EC 100%)`, padding: isMobile ? '64px 16px 52px' : '108px 24px 96px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#FFF8EC', color: ORANGE, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 28, border: '1px solid #FBDFA3' }}>
            ✈️ 10 days free · No card required
          </div>
          <h1 aria-label="AI-Powered Homeschooling for Traveling Families" style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 34 : 56, lineHeight: isMobile ? 1.2 : 1.1, marginBottom: 22, color: TEXT }}>
            Every destination<br />
            <span style={{ color: PRIMARY }}>becomes a classroom.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 20, color: TEXT_MUTED, lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px' }}>
            AI-generated lesson plans tied to wherever you are in the world. Tell us your location — we'll handle the curriculum.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexDirection: isMobile ? 'column' as const : 'row' as const, alignItems: 'center', marginBottom: 20 }}>
            <button onClick={() => router.push('/auth')}
              onMouseEnter={() => setHover('herocta')} onMouseLeave={() => setHover(null)}
              style={btn('herocta', { padding: isMobile ? '16px 28px' : '18px 44px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: isMobile ? 16 : 18, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(155,142,196,0.35)', width: isMobile ? '100%' : 'auto' }, { background: PRIMARY_DARK })}>
              Start your free trial →
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={() => setHover('herolearn')} onMouseLeave={() => setHover(null)}
              style={btn('herolearn', { padding: isMobile ? '16px 28px' : '18px 44px', borderRadius: 100, border: `2px solid ${PRIMARY_BORDER}`, background: BEIGE_CARD, color: PRIMARY, fontSize: isMobile ? 16 : 18, fontWeight: 800, fontFamily: 'inherit', width: isMobile ? '100%' : 'auto' }, { background: PRIMARY_BG })}>
              See how it works
            </button>
          </div>
          <p style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>10 days free · No card required · Cancel anytime</p>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background: BEIGE_CARD, padding: isMobile ? '20px 16px' : '28px 24px', borderBottom: `2px solid ${BEIGE_BORDER}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', gap: isMobile ? 16 : 40, justifyContent: 'center', flexWrap: 'wrap' as const, alignItems: 'center' }}>
          {['🌍 Works in every country', '👶 Ages 4–18', '📚 6 teaching philosophies', '⚡ Lesson plan in 30 seconds'].map(item => (
            <span key={item} style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: TEXT_MUTED }}>{item}</span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" style={{ background: BEIGE, padding: sectionPad }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 38, textAlign: 'center', marginBottom: 12, color: TEXT }}>
            School that follows your family
          </h2>
          <p style={{ textAlign: 'center', color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, marginBottom: isMobile ? 36 : 52 }}>
            Three steps and you're ready to learn anywhere on Earth.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 20 : 28 }}>
            {[
              { step: '1', icon: '📍', title: 'Tell us where you are', desc: 'Enter your current country and city. We weave your real location into every lesson — from the food markets of Bangkok to the canals of Amsterdam.' },
              { step: '2', icon: '✨', title: 'Get a personalised plan', desc: 'In seconds, Claude generates a full 5-day lesson plan matched to your child\'s age, subjects and learning style. No prep work needed.' },
              { step: '3', icon: '🌏', title: 'Learn anywhere', desc: 'Work through lessons, complete worksheets and record journal entries — whether you\'re at a café, on a train, or under a palm tree.' },
            ].map(s => (
              <div key={s.step} style={{ background: BEIGE_CARD, borderRadius: 24, padding: isMobile ? 24 : 32, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', position: 'relative' }}>
                <div style={{ width: 32, height: 32, borderRadius: 100, background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 19, marginBottom: 10, color: TEXT }}>{s.title}</h3>
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ background: BEIGE_CARD, padding: sectionPad }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 38, textAlign: 'center', marginBottom: 12, color: TEXT }}>
            Everything a worldschooling family needs
          </h2>
          <p style={{ textAlign: 'center', color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, marginBottom: isMobile ? 36 : 52 }}>
            No planning stress. No missed school days. Just learning that moves with you.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: BEIGE, borderRadius: 20, padding: isMobile ? 20 : 28, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 17, marginBottom: 8, color: TEXT }}>{f.title}</h3>
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UK Homeschooling */}
      <div style={{ background: PRIMARY_BG, padding: sectionPad, borderTop: `2px solid ${PRIMARY_BORDER}`, borderBottom: `2px solid ${PRIMARY_BORDER}` }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' as const }}>
          <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 16 }}>🇬🇧</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 24 : 34, marginBottom: 16, color: TEXT }}>
            New to homeschooling in the UK?
          </h2>
          <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, lineHeight: 1.75, maxWidth: 580, margin: '0 auto' }}>
            175,000+ families in England now home educate. You don't need permission or a strict curriculum — Waypoint helps you track progress and export reports if your Local Authority ever asks.
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ background: BEIGE, padding: sectionPad }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 52 }}>
            <div style={{ display: 'inline-block', background: '#EDF7F2', color: GREEN_DARK, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 16, border: `1px solid ${GREEN}` }}>
              🎁 10 days free · No card required
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 38, marginBottom: 12, color: TEXT }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, maxWidth: 480, margin: '0 auto' }}>
              All plans include the full Waypoint experience. Pick the billing cycle that suits your family.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, maxWidth: 860, margin: '0 auto' }}>
            {PLANS.map(plan => (
              <div key={plan.key} style={{
                background: BEIGE_CARD,
                borderRadius: 24,
                padding: isMobile ? 24 : 32,
                border: `2px solid ${plan.highlight ? PRIMARY : BEIGE_BORDER}`,
                boxShadow: plan.highlight ? '0 8px 32px rgba(155,142,196,0.16)' : '0 2px 10px rgba(0,0,0,0.04)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column' as const,
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, right: 20, background: plan.highlight ? PRIMARY : GREEN_DARK, color: 'white', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                    {plan.badge}
                  </div>
                )}
                {plan.highlight && (
                  <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>
                    Most popular
                  </div>
                )}
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{plan.label}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: 40, fontWeight: 700, color: TEXT }}>{plan.price}</span>
                  <span style={{ color: TEXT_MUTED, fontSize: 14 }}> {plan.sub}</span>
                </div>
                <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 8 }}>{plan.billed}</div>
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 20, padding: '7px 12px', background: BEIGE, borderRadius: 10, border: `1px solid ${BEIGE_BORDER}` }}>
                  Up to 4 children included
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', flex: 1 }}>
                  {[
                    'AI lesson plans for any location',
                    'Interactive worksheets & quizzes',
                    'Travel journal',
                    'Ages 4–18 supported',
                    '6 teaching philosophies',
                  ].map(item => (
                    <li key={item} style={{ padding: '7px 0', fontSize: 13, color: TEXT, display: 'flex', gap: 8, alignItems: 'flex-start', borderBottom: `1px solid ${BEIGE_BORDER}` }}>
                      <span style={{ color: GREEN_DARK, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push('/auth')}
                  onMouseEnter={() => setHover(`plan-${plan.key}`)} onMouseLeave={() => setHover(null)}
                  style={btn(`plan-${plan.key}`,
                    { width: '100%', padding: '14px', borderRadius: 100, border: 'none', background: plan.highlight ? PRIMARY : BEIGE_BORDER, color: plan.highlight ? 'white' : TEXT, fontSize: 14, fontWeight: 800, fontFamily: 'inherit' },
                    { background: plan.highlight ? PRIMARY_DARK : '#d5cdc3' }
                  )}>
                  Start 10-day free trial →
                </button>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: TEXT_MUTED, marginTop: 24, fontWeight: 600 }}>
            10 days free · No card required · Cancel anytime
          </p>
        </div>
      </div>

      {/* Mid-page CTA */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${GREEN})`, padding: sectionPad, textAlign: 'center' as const }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: isMobile ? 44 : 56, marginBottom: 16 }}>🧭</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 38, color: 'white', marginBottom: 14 }}>
            Ready to take school on the road?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: isMobile ? 15 : 17, lineHeight: 1.7, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>
            Join families homeschooling across 90+ countries. Your first 10 days are completely free.
          </p>
          <button onClick={() => router.push('/auth')}
            onMouseEnter={() => setHover('midcta')} onMouseLeave={() => setHover(null)}
            style={btn('midcta', { padding: '16px 40px', borderRadius: 100, border: 'none', background: 'white', color: PRIMARY, fontSize: 16, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }, { background: '#f5f0ff' })}>
            Create your free account →
          </button>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 14, fontWeight: 600 }}>No card required · 10 days free</p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: BEIGE_CARD, padding: sectionPad }} itemScope itemType="https://schema.org/FAQPage">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 38, textAlign: 'center', marginBottom: isMobile ? 32 : 56, color: TEXT }}>
            Frequently asked questions
          </h2>
          {FAQS.map(faq => (
            <div key={faq.q} style={{ borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '22px 0' }} itemScope itemType="https://schema.org/Question">
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 17, marginBottom: 10, color: TEXT }} itemProp="name">{faq.q}</h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.75, margin: 0 }} itemProp="text">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: TEXT, padding: '32px 24px', textAlign: 'center' as const }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: 'white' }}>
          🧭 Waypoint <span style={{ color: PRIMARY }}>Education</span>
        </span>
        <p style={{ color: '#9E9188', fontSize: 13, marginTop: 8, marginBottom: 12 }}>
          © 2026 Waypoint Education · The world is their classroom.
        </p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: '#9E9188', fontSize: 13, textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </div>

    </div>
  )
}
