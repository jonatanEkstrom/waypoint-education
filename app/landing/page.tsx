'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useOfferLive, halfPrice, OFFER_TAGLINE, TRIAL_TAGLINE } from '../lib/offer'

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
    amount: 11,
    sub: 'per month',
    billed: 'Billed monthly',
    badge: null,
    highlight: false,
  },
  {
    key: 'quarterly',
    label: 'Quarterly',
    price: '€29',
    amount: 29,
    sub: 'per quarter',
    billed: 'Billed €29 every 3 months',
    badge: 'Save 12%',
    highlight: true,
  },
  {
    key: 'yearly',
    label: 'Yearly',
    price: '€99',
    amount: 99,
    sub: 'per year',
    billed: 'Billed €99/year',
    badge: 'Save 25%',
    highlight: false,
  },
]

const FEATURES = [
  { icon: '📄', title: 'Interactive worksheets', desc: 'Practise the same learning goal with matching, fill-in-the-blank and short-answer activities.' },
  { icon: '👩‍👧', title: 'Tips for parents', desc: 'Get a teaching tip and a short check to help you decide whether to repeat the lesson or move on.' },
  { icon: '📖', title: 'Little Readers', desc: 'Practise letter sounds, sounding out words and recognising common words with separate progress for each child.' },
  { icon: '🧠', title: 'Practice Mode', desc: 'Learners aged 10 and up can try structured exercises and receive AI feedback.' },
  { icon: '🗺️', title: 'Travel journal', desc: 'Record discoveries and experiences from your travels.' },
  { icon: '📁', title: 'Learning records', desc: 'Review journal entries and completed learning goals, and save a Local Authority report as a PDF.' },
]

const FAQS = [
  {
    q: 'What is worldschooling?',
    a: 'Worldschooling uses travel and everyday experiences as opportunities to learn. A market visit can become a maths activity, and a walk by the coast can lead to a science discussion. Check the home education rules that apply to your family.',
  },
  {
    q: 'What do I need to do as a parent?',
    a: "Read through the lesson, help your child with the activity and use the short check to decide whether they are ready to move on. Younger children may need you to read aloud and do parts of the activity with them.",
  },
  {
    q: 'How does Waypoint create lessons?',
    a: "Choose an available subject and Waypoint picks the next learning goal. Claude creates a lesson with an example, an activity and a tip for parents. It uses your child's age group and can take their reading level and focus time into account. Your location can shape the examples.",
  },
  {
    q: 'Can I prepare a Local Authority report?',
    a: 'Yes. Waypoint brings together journal entries, completed learning goals and any saved weekly plans in a report you can print or save as a PDF through your browser.',
  },
  {
    q: 'What ages does Waypoint support?',
    a: 'Child profiles cover ages 3 to 18, with lessons organised in age bands. Practice Mode starts at age 10. Little Readers offers activities for children who are learning to read.',
  },
  {
    q: 'Do I need teaching experience to use Waypoint?',
    a: "Waypoint is designed for parents. Lessons include an activity and a teaching tip to help you get started. Review AI-generated material before using it with your child.",
  },
]

const TRIAL_FAQ = {
  q: 'What happens after the 10-day free trial?',
  a: "After your 10-day trial, you'll be invited to choose a plan to continue. No payment card is required to start the trial — you only enter payment details when you're ready to subscribe. There's no automatic charge at the end of the trial.",
}

const OFFER_FAQ = {
  q: 'How does the introductory discount work?',
  a: "Eligible new subscribers pay 50% of the price for their first billing period on any plan — €5.50 for the first month, €14.50 for the first quarter or €49.50 for the first year. From the second billing period you pay the regular price. You can cancel anytime from your account, and cancelling stops the next renewal.",
}

export default function LandingPage() {
  const offer = useOfferLive()
  const faqs = [...FAQS, offer ? OFFER_FAQ : TRIAL_FAQ]
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
    description: 'Short AI-generated lessons for home-educating and travelling families, with practical activities, worksheets and learning records.',
    url: 'https://waypointeducation.world',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '11',
      priceCurrency: 'EUR',
      description: 'Regular monthly subscription price.',
    },
    featureList: [
      'AI-generated lessons based on learning goals',
      'Lesson examples that can use your location',
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
            {offer ? (isMobile ? 'Get started →' : 'See introductory offer →') : (isMobile ? 'Try free →' : 'Start free trial →')}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, #EDF7F2 50%, #FFF8EC 100%)`, padding: isMobile ? '64px 16px 52px' : '108px 24px 96px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#FFF8EC', color: ORANGE, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 28, border: '1px solid #FBDFA3' }}>
            ✈️ {offer ? '50% off your first billing period' : TRIAL_TAGLINE}
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 34 : 56, lineHeight: isMobile ? 1.2 : 1.1, marginBottom: 22, color: TEXT }}>
            Less planning.<br />
            <span style={{ color: PRIMARY }}>More learning together.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 20, color: TEXT_MUTED, lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px' }}>
            Waypoint picks your child's next learning goal. AI prepares a short lesson, a hands-on activity and a quick check. Read it through, help your child get started and see what they understood.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexDirection: isMobile ? 'column' as const : 'row' as const, alignItems: 'center', marginBottom: 20 }}>
            <button onClick={() => router.push('/auth')}
              onMouseEnter={() => setHover('herocta')} onMouseLeave={() => setHover(null)}
              style={btn('herocta', { padding: isMobile ? '16px 28px' : '18px 44px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: isMobile ? 16 : 18, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(155,142,196,0.35)', width: isMobile ? '100%' : 'auto' }, { background: PRIMARY_DARK })}>
              {offer ? 'Start for half price →' : 'Start your free trial →'}
            </button>
            <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={() => setHover('herolearn')} onMouseLeave={() => setHover(null)}
              style={btn('herolearn', { padding: isMobile ? '16px 28px' : '18px 44px', borderRadius: 100, border: `2px solid ${PRIMARY_BORDER}`, background: BEIGE_CARD, color: PRIMARY, fontSize: isMobile ? 16 : 18, fontWeight: 800, fontFamily: 'inherit', width: isMobile ? '100%' : 'auto' }, { background: PRIMARY_BG })}>
              See how it works
            </button>
          </div>
          <p style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>{offer ? OFFER_TAGLINE : `${TRIAL_TAGLINE} · Cancel anytime`}</p>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background: BEIGE_CARD, padding: isMobile ? '20px 16px' : '28px 24px', borderBottom: `2px solid ${BEIGE_BORDER}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', gap: isMobile ? 16 : 40, justifyContent: 'center', flexWrap: 'wrap' as const, alignItems: 'center' }}>
          {['🧩 Short lessons', '📄 Linked worksheets', '📖 Learning records'].map(item => (
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
            Waypoint prepares the lesson. You help your child try it.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 20 : 28 }}>
            {[
              { step: '1', icon: '📍', title: 'Choose a subject', desc: 'Choose an available subject for your child. Add your location to give the lesson a familiar setting.' },
              { step: '2', icon: '✨', title: 'Review the prepared lesson', desc: 'Waypoint picks the next goal and AI prepares an example, an activity and a tip for you.' },
              { step: '3', icon: '🌏', title: 'Help your child get started', desc: 'Try the activity together. Use the short check to decide whether to practise again or move on.' },
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
            Tools for home education on the road
          </h2>
          <p style={{ textAlign: 'center', color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, marginBottom: isMobile ? 36 : 52 }}>
            Plan the next lesson, practise together and keep a record of your learning.
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
            Preparing a home education report?
          </h2>
          <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 15 : 17, lineHeight: 1.75, maxWidth: 580, margin: '0 auto' }}>
            Use Waypoint to bring together your journal and completed goals. For the rules in England, see the <a href="https://www.gov.uk/home-education">official home education guidance</a>.
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ background: BEIGE, padding: sectionPad }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 52 }}>
            <div style={{ display: 'inline-block', background: '#EDF7F2', color: GREEN_DARK, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 700, marginBottom: 16, border: `1px solid ${GREEN}` }}>
              🎁 {offer ? 'First billing period 50% off' : TRIAL_TAGLINE}
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
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{plan.label}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: 40, fontWeight: 700, color: TEXT }}>{plan.price}</span>
                  <span style={{ color: TEXT_MUTED, fontSize: 14 }}> {plan.sub}</span>
                </div>
                <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 8 }}>{plan.billed}</div>
                {offer && (
                  <div style={{ fontSize: 13, color: GREEN_DARK, fontWeight: 700, marginBottom: 8 }}>
                    First {plan.sub.replace('per ', '')}: €{halfPrice(plan.amount)} (50% off)
                  </div>
                )}
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 20, padding: '7px 12px', background: BEIGE, borderRadius: 10, border: `1px solid ${BEIGE_BORDER}` }}>
                  Up to 4 children included
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', flex: 1 }}>
                  {[
                    'Short AI-generated lessons',
                    'Interactive worksheets & quizzes',
                    'Travel journal',
                    'Child profiles for ages 3–18',
                    'Learning records',
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
                  {offer ? 'Get 50% off first period →' : 'Start 10-day free trial →'}
                </button>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: TEXT_MUTED, marginTop: 24, fontWeight: 600 }}>
            {offer ? OFFER_TAGLINE : `${TRIAL_TAGLINE} · Cancel anytime`}
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
            Try a lesson with your family and see how it fits into your day.
          </p>
          <button onClick={() => router.push('/auth')}
            onMouseEnter={() => setHover('midcta')} onMouseLeave={() => setHover(null)}
            style={btn('midcta', { padding: '16px 40px', borderRadius: 100, border: 'none', background: 'white', color: PRIMARY, fontSize: 16, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }, { background: '#f5f0ff' })}>
            {offer ? 'Create an account →' : 'Start your free trial →'}
          </button>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 14, fontWeight: 600 }}>{offer ? OFFER_TAGLINE : 'No card required · 10 days free'}</p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: BEIGE_CARD, padding: sectionPad }} itemScope itemType="https://schema.org/FAQPage">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 26 : 38, textAlign: 'center', marginBottom: isMobile ? 32 : 56, color: TEXT }}>
            Frequently asked questions
          </h2>
          {faqs.map(faq => (
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
