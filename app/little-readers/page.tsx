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
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

interface Child {
  id: string
  name: string
  age_group: string
}

const SIGHT_WORDS = [
  { word: 'THE', emoji: '👆', sentence: 'THE CAT SAT ON THE MAT.' },
  { word: 'AND', emoji: '🤝', sentence: 'MUM AND DAD WENT FOR A WALK.' },
  { word: 'A', emoji: '🍎', sentence: 'I SAW A BIG RED APPLE.' },
  { word: 'IS', emoji: '☀️', sentence: 'THE SUN IS VERY BRIGHT TODAY.' },
  { word: 'IN', emoji: '📦', sentence: 'THE CAT IS IN THE BOX.' },
  { word: 'IT', emoji: '🎁', sentence: 'IT IS A PRESENT FOR YOU.' },
  { word: 'YOU', emoji: '😊', sentence: 'I LOVE YOU VERY MUCH.' },
  { word: 'HE', emoji: '👦', sentence: 'HE LIKES TO PLAY IN THE PARK.' },
  { word: 'SHE', emoji: '👧', sentence: 'SHE HAS A PRETTY RED DRESS.' },
  { word: 'WE', emoji: '👨‍👩‍👧', sentence: 'WE ARE GOING TO THE BEACH.' },
  { word: 'ARE', emoji: '🌟', sentence: 'WE ARE HAVING SO MUCH FUN.' },
  { word: 'AT', emoji: '🏫', sentence: 'SHE IS AT SCHOOL TODAY.' },
  { word: 'BE', emoji: '🐝', sentence: 'TRY TO BE KIND TO OTHERS.' },
  { word: 'BUT', emoji: '🤔', sentence: 'I WANT TO PLAY BUT IT IS RAINING.' },
  { word: 'DO', emoji: '✅', sentence: 'DO YOUR BEST EVERY DAY.' },
  { word: 'FOR', emoji: '🎀', sentence: 'THIS CAKE IS FOR MY BIRTHDAY.' },
  { word: 'GO', emoji: '🚀', sentence: 'LET US GO ON AN ADVENTURE.' },
  { word: 'HAVE', emoji: '🤲', sentence: 'I HAVE A PET DOG.' },
  { word: 'HIS', emoji: '🎒', sentence: 'HIS BAG IS FULL OF BOOKS.' },
  { word: 'HOW', emoji: '❓', sentence: 'HOW DID THE BIRD FLY SO HIGH?' },
  { word: 'I', emoji: '🙋', sentence: 'I AM LEARNING TO READ.' },
  { word: 'IF', emoji: '🌈', sentence: 'IF IT RAINS WE WILL STAY INSIDE.' },
  { word: 'ME', emoji: '🫶', sentence: 'CAN YOU PASS THAT TO ME?' },
  { word: 'MY', emoji: '❤️', sentence: 'MY FAVOURITE COLOUR IS BLUE.' },
  { word: 'NOT', emoji: '🚫', sentence: 'DO NOT TOUCH THE HOT STOVE.' },
  { word: 'ON', emoji: '🐱', sentence: 'THE CAT SAT ON THE CHAIR.' },
  { word: 'OUT', emoji: '🚪', sentence: 'LET US GO OUT AND PLAY.' },
  { word: 'SO', emoji: '😄', sentence: 'I AM SO HAPPY TODAY.' },
  { word: 'TO', emoji: '🗺️', sentence: 'WE WENT TO THE PARK TOGETHER.' },
  { word: 'UP', emoji: '☁️', sentence: 'THE BALLOON FLEW UP IN THE SKY.' },
  { word: 'WAS', emoji: '📸', sentence: 'IT WAS A LOVELY SUNNY DAY.' },
  { word: 'WITH', emoji: '🤗', sentence: 'I PLAYED WITH MY BEST FRIEND.' },
  { word: 'ALL', emoji: '🌍', sentence: 'ALL THE CHILDREN WERE LAUGHING.' },
  { word: 'LOOK', emoji: '👀', sentence: 'LOOK AT THAT BEAUTIFUL RAINBOW.' },
  { word: 'SAID', emoji: '💬', sentence: 'SHE SAID HELLO TO EVERYONE.' },
  { word: 'THEY', emoji: '👫', sentence: 'THEY WENT TO THE PARK TOGETHER.' },
  { word: 'THIS', emoji: '👇', sentence: 'THIS IS MY FAVOURITE BOOK.' },
  { word: 'WHAT', emoji: '🤩', sentence: 'WHAT A WONDERFUL SURPRISE.' },
  { word: 'WHEN', emoji: '⏰', sentence: 'WHEN WILL WE GET THERE?' },
  { word: 'WILL', emoji: '✨', sentence: 'WE WILL GO TO THE BEACH TOMORROW.' },
]

export default function LittleReadersPage() {
  const router = useRouter()
  const [child, setChild] = useState<Child | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set())
  const [deck, setDeck] = useState<typeof SIGHT_WORDS>([])
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [starPop, setStarPop] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const stored = localStorage.getItem('activeChild')
      if (stored) {
        try {
          const active = JSON.parse(stored)
          if (active.user_id === user.id && active.id) {
            setChild(active)
            await loadProgress(active.id)
            setLoading(false)
            return
          }
        } catch {}
      }

      const { data } = await supabase.from('children').select('id, name, age_group').eq('user_id', user.id)
      if (data?.length === 1) {
        setChild(data[0])
        await loadProgress(data[0].id)
      } else if (data) {
        setChildren(data)
      }
    }

    setLoading(false)
  }

  async function loadProgress(childId: string) {
    const { data } = await supabase
      .from('little_readers_progress')
      .select('known_words')
      .eq('child_id', childId)
      .maybeSingle()
    const known = new Set<string>(data?.known_words ?? [])
    setKnownWords(known)
    buildDeck(known)
  }

  function buildDeck(known: Set<string>) {
    const remaining = SIGHT_WORDS.filter(w => !known.has(w.word))
    setDeck(remaining)
    setDone(remaining.length === 0)
    setFlipped(false)
  }

  async function handleKnowIt() {
    if (!deck.length || !child || saving) return
    const word = deck[0].word
    setSaving(true)
    setStarPop(true)
    setTimeout(() => setStarPop(false), 500)

    const newKnown = new Set(knownWords)
    newKnown.add(word)
    setKnownWords(newKnown)

    const newDeck = deck.slice(1)
    setDeck(newDeck)
    setFlipped(false)
    if (newDeck.length === 0) setDone(true)

    await supabase.from('little_readers_progress').upsert(
      { child_id: child.id, known_words: [...newKnown], updated_at: new Date().toISOString() },
      { onConflict: 'child_id' }
    )
    setSaving(false)
  }

  function handlePracticeMore() {
    if (!deck.length) return
    const [first, ...rest] = deck
    setDeck([...rest, first])
    setFlipped(false)
  }

  function handlePracticeAgain() {
    setKnownWords(new Set())
    setDeck([...SIGHT_WORDS])
    setDone(false)
    setFlipped(false)
  }

  async function selectChild(c: Child) {
    setChild(c)
    setLoading(true)
    await loadProgress(c.id)
    setLoading(false)
  }

  const btn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer',
  })

  const totalWords = SIGHT_WORDS.length
  const knownCount = knownWords.size
  const progress = (knownCount / totalWords) * 100

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <span style={{ color: TEXT_MUTED, fontSize: 16 }}>Loading...</span>
      </div>
    )
  }

  // Child picker
  if (!child) {
    return (
      <div style={{ minHeight: '100vh', background: BEIGE, fontFamily: 'system-ui, sans-serif', color: TEXT }}>
        <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, fontSize: 20, lineHeight: 1, padding: 0 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: TEXT }}>📖 Little Readers</span>
        </div>
        <div style={{ maxWidth: 480, margin: '64px auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📖</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: TEXT, marginBottom: 8 }}>Who is reading today?</h2>
          <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 32 }}>Choose a child to load their progress.</p>
          {children.length === 0 ? (
            <div style={{ color: TEXT_MUTED, fontSize: 15 }}>
              No children found. <button onClick={() => router.push('/dashboard/children')} style={{ background: 'none', border: 'none', color: PRIMARY, fontWeight: 700, cursor: 'pointer', fontSize: 15, padding: 0 }}>Add a child →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {children.map(c => (
                <button key={c.id} onClick={() => selectChild(c)}
                  onMouseEnter={() => setHover(`child-${c.id}`)} onMouseLeave={() => setHover(null)}
                  style={btn(`child-${c.id}`, { padding: '16px 20px', borderRadius: 16, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 16, fontWeight: 700, color: TEXT, fontFamily: 'inherit', textAlign: 'left' as const, width: '100%' }, { borderColor: PRIMARY, background: PRIMARY_BG, color: PRIMARY })}>
                  {c.name}
                  <span style={{ fontWeight: 400, color: TEXT_MUTED, fontSize: 14, marginLeft: 8 }}>· {c.age_group}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Celebration screen
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${PRIMARY_BG} 0%, #EDF7F2 50%, #FFF8EC 100%)`, fontFamily: 'system-ui, sans-serif', color: TEXT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>
        <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 16, animation: 'bounce 1.2s ease infinite' }}>🎉</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 30 : 42, color: TEXT, marginBottom: 12 }}>Amazing work!</h1>
        <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 15 : 18, marginBottom: 24 }}>
          {child.name} has learned all {totalWords} sight words!
        </p>
        <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: '20px 40px', border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 52, fontWeight: 700, color: PRIMARY, lineHeight: 1 }}>{totalWords}</span>
          <span style={{ color: TEXT_MUTED, fontSize: 15, fontWeight: 600 }}>stars earned</span>
        </div>
        <div style={{ fontSize: isMobile ? 28 : 36, letterSpacing: 2, margin: '8px 0 36px', maxWidth: 360, lineHeight: 1.4 }}>
          {'⭐'.repeat(Math.min(totalWords, 20))}
        </div>
        <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' as const : 'row' as const }}>
          <button onClick={handlePracticeAgain}
            onMouseEnter={() => setHover('again')} onMouseLeave={() => setHover(null)}
            style={btn('again', { padding: '14px 28px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
            🔄 Practice again
          </button>
          <button onClick={() => router.push('/dashboard')}
            onMouseEnter={() => setHover('back')} onMouseLeave={() => setHover(null)}
            style={btn('back', { padding: '14px 28px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, color: TEXT_MUTED, fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY })}>
            ← Dashboard
          </button>
        </div>
      </div>
    )
  }

  const current = deck[0]

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, fontFamily: 'system-ui, sans-serif', color: TEXT, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes starPulse { 0%{transform:scale(1)} 40%{transform:scale(1.5)} 100%{transform:scale(1)} }
      `}</style>

      {/* Nav */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, fontSize: 20, lineHeight: 1, padding: 0 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 17, fontWeight: 700, color: TEXT }}>📖 Little Readers</span>
          {child && <span style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>· {child.name}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF8EC', border: '1.5px solid #FBDFA3', borderRadius: 100, padding: '6px 14px', animation: starPop ? 'starPulse 0.45s ease' : 'none' }}>
          <span style={{ fontSize: 15 }}>⭐</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#C17A00' }}>{knownCount}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: BEIGE_CARD, padding: '12px 20px 14px', borderBottom: `1px solid ${BEIGE_BORDER}`, flexShrink: 0 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{knownCount} / {totalWords} words learned</span>
          </div>
          <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${PRIMARY}, ${GREEN})`, borderRadius: 100, width: `${progress}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* Game area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '24px 16px 32px' : '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          <p style={{ textAlign: 'center', color: TEXT_MUTED, fontSize: 13, fontWeight: 600, marginBottom: 20, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            {deck.length} {deck.length === 1 ? 'word' : 'words'} left to practice
          </p>

          {/* Flashcard */}
          <div
            onClick={() => { if (!flipped) setFlipped(true) }}
            style={{
              background: BEIGE_CARD,
              borderRadius: 28,
              border: `2px solid ${flipped ? PRIMARY_BORDER : BEIGE_BORDER}`,
              boxShadow: flipped
                ? '0 12px 40px rgba(155,142,196,0.2)'
                : '0 4px 18px rgba(0,0,0,0.07)',
              padding: isMobile ? '40px 24px' : '56px 48px',
              textAlign: 'center' as const,
              cursor: flipped ? 'default' : 'pointer',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              minHeight: isMobile ? 260 : 320,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              userSelect: 'none' as const,
              WebkitUserSelect: 'none' as const,
            }}
          >
            {flipped && (
              <div style={{ fontSize: isMobile ? 52 : 64, lineHeight: 1, animation: 'fadeSlideUp 0.2s ease' }}>
                {current.emoji}
              </div>
            )}

            <div style={{
              fontFamily: 'Georgia,serif',
              fontSize: isMobile ? 72 : 96,
              fontWeight: 700,
              color: flipped ? PRIMARY : TEXT,
              lineHeight: 1,
              letterSpacing: '0.02em',
              transition: 'color 0.2s ease',
            }}>
              {current.word}
            </div>

            {flipped ? (
              <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 16 : 18, fontWeight: 600, lineHeight: 1.55, margin: 0, animation: 'fadeSlideUp 0.25s ease', maxWidth: 300 }}>
                {current.sentence}
              </p>
            ) : (
              <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                TAP TO REVEAL
              </p>
            )}
          </div>

          {/* Action buttons — only shown after reveal */}
          {flipped && (
            <div style={{ display: 'flex', gap: 12, marginTop: 20, animation: 'fadeSlideUp 0.2s ease' }}>
              <button
                onClick={handlePracticeMore}
                onMouseEnter={() => setHover('practice')} onMouseLeave={() => setHover(null)}
                style={btn('practice', {
                  flex: 1, padding: isMobile ? '14px 8px' : '16px 8px', borderRadius: 16,
                  border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD,
                  color: TEXT, fontSize: isMobile ? 13 : 15, fontWeight: 700, fontFamily: 'inherit', lineHeight: 1.3,
                }, { borderColor: PRIMARY_BORDER, background: PRIMARY_BG, color: PRIMARY })}>
                🔄 Practice more
              </button>
              <button
                onClick={handleKnowIt}
                disabled={saving}
                onMouseEnter={() => setHover('know')} onMouseLeave={() => setHover(null)}
                style={btn('know', {
                  flex: 1, padding: isMobile ? '14px 8px' : '16px 8px', borderRadius: 16,
                  border: 'none', background: GREEN_DARK, color: 'white',
                  fontSize: isMobile ? 13 : 15, fontWeight: 700, fontFamily: 'inherit', lineHeight: 1.3,
                  opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' as const : 'pointer',
                }, { background: '#5A9E7A' })}>
                ⭐ I know it!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
