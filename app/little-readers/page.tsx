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
const ORANGE = '#F5A623'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

interface Child {
  id: string
  name: string
  age_group: string
}

const LETTER_ANIMALS = [
  { letter: 'A', animal: 'Alligator',    emoji: '🐊', sound: 'Snap!' },
  { letter: 'B', animal: 'Bear',         emoji: '🐻', sound: 'Roar!' },
  { letter: 'C', animal: 'Cat',          emoji: '🐱', sound: 'Meow!' },
  { letter: 'D', animal: 'Dog',          emoji: '🐶', sound: 'Woof!' },
  { letter: 'E', animal: 'Elephant',     emoji: '🐘', sound: 'Trumpet!' },
  { letter: 'F', animal: 'Fish',         emoji: '🐟', sound: 'Blub!' },
  { letter: 'G', animal: 'Giraffe',      emoji: '🦒', sound: 'Munch!' },
  { letter: 'H', animal: 'Horse',        emoji: '🐴', sound: 'Neigh!' },
  { letter: 'I', animal: 'Iguana',       emoji: '🦎', sound: 'Hiss!' },
  { letter: 'J', animal: 'Jellyfish',    emoji: '🪼', sound: 'Splash!' },
  { letter: 'K', animal: 'Kangaroo',     emoji: '🦘', sound: 'Boing!' },
  { letter: 'L', animal: 'Lion',         emoji: '🦁', sound: 'Roar!' },
  { letter: 'M', animal: 'Monkey',       emoji: '🐒', sound: 'Ooh ooh!' },
  { letter: 'N', animal: 'Narwhal',      emoji: '🐋', sound: 'Splash!' },
  { letter: 'O', animal: 'Owl',          emoji: '🦉', sound: 'Hoot!' },
  { letter: 'P', animal: 'Penguin',      emoji: '🐧', sound: 'Squawk!' },
  { letter: 'Q', animal: 'Quail',        emoji: '🐦', sound: 'Chirp!' },
  { letter: 'R', animal: 'Rabbit',       emoji: '🐰', sound: 'Squeak!' },
  { letter: 'S', animal: 'Snake',        emoji: '🐍', sound: 'Hiss!' },
  { letter: 'T', animal: 'Tiger',        emoji: '🐯', sound: 'Growl!' },
  { letter: 'U', animal: 'Umbrella Bird',emoji: '🦚', sound: 'Tweet!' },
  { letter: 'V', animal: 'Vulture',      emoji: '🦅', sound: 'Screech!' },
  { letter: 'W', animal: 'Wolf',         emoji: '🐺', sound: 'Howl!' },
  { letter: 'X', animal: 'X-ray Fish',   emoji: '🐠', sound: 'Blub!' },
  { letter: 'Y', animal: 'Yak',          emoji: '🐃', sound: 'Grunt!' },
  { letter: 'Z', animal: 'Zebra',        emoji: '🦓', sound: 'Whinny!' },
]

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
  const [userId, setUserId] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Letter Animals state
  const [letterIndex, setLetterIndex] = useState(0)
  const [exploredLetters, setExploredLetters] = useState<Set<string>>(new Set())
  const [letterBouncing, setLetterBouncing] = useState(false)

  // Sight Words state
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set())
  const [deck, setDeck] = useState<typeof SIGHT_WORDS>([])
  const [flipped, setFlipped] = useState(false)
  const [wordsDone, setWordsDone] = useState(false)
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
      setUserId(user.id)

      const stored = localStorage.getItem('activeChild')
      if (stored) {
        try {
          const active = JSON.parse(stored)
          if (active.user_id === user.id && active.id) {
            setChild(active)
            await loadProgress(user.id, active.id)
            setLoading(false)
            return
          }
        } catch {}
      }

      const { data } = await supabase.from('children').select('id, name, age_group').eq('user_id', user.id)
      if (data?.length === 1) {
        setChild(data[0])
        await loadProgress(user.id, data[0].id)
      } else if (data) {
        setChildren(data)
      }
    }

    setLoading(false)
  }

  // Progress is stored in one known_words array.
  // Sight words are plain strings (e.g. "THE").
  // Letter Animals are prefixed "LETTER_A", "LETTER_B", etc.
  async function loadProgress(uid: string, childId: string) {
    const { data } = await supabase
      .from('little_readers_progress')
      .select('known_words')
      .eq('user_id', uid)
      .eq('child_id', childId)
      .maybeSingle()

    const words = new Set<string>()
    const letters = new Set<string>()
    for (const entry of (data?.known_words ?? [])) {
      if (entry.startsWith('LETTER_')) letters.add(entry.replace('LETTER_', ''))
      else words.add(entry)
    }
    setKnownWords(words)
    setExploredLetters(letters)
    buildDeck(words)
  }

  function buildDeck(known: Set<string>) {
    const remaining = SIGHT_WORDS.filter(w => !known.has(w.word))
    setDeck(remaining)
    setWordsDone(remaining.length === 0)
    setFlipped(false)
  }

  async function saveProgress(newWords: Set<string>, newLetters: Set<string>) {
    if (!userId || !child) return
    const combined = [
      ...Array.from(newWords),
      ...Array.from(newLetters).map(l => `LETTER_${l}`),
    ]
    await supabase.from('little_readers_progress').upsert(
      { user_id: userId, child_id: child.id, known_words: combined, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,child_id' }
    )
  }

  function handleLetterTap() {
    const letter = LETTER_ANIMALS[letterIndex].letter
    setLetterBouncing(true)
    setTimeout(() => setLetterBouncing(false), 650)

    if (!exploredLetters.has(letter)) {
      const newExplored = new Set(exploredLetters)
      newExplored.add(letter)
      setExploredLetters(newExplored)
      saveProgress(knownWords, newExplored)
    }
  }

  async function handleKnowIt() {
    if (!deck.length || saving) return
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
    if (newDeck.length === 0) setWordsDone(true)

    await saveProgress(newKnown, exploredLetters)
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
    setWordsDone(false)
    setFlipped(false)
    saveProgress(new Set(), exploredLetters)
  }

  async function selectChild(c: Child) {
    setChild(c)
    setLoading(true)
    if (userId) await loadProgress(userId, c.id)
    else { buildDeck(new Set()); setExploredLetters(new Set()) }
    setLoading(false)
  }

  const btn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer',
  })

  const totalWords = SIGHT_WORDS.length
  const knownCount = knownWords.size
  const wordProgress = (knownCount / totalWords) * 100
  const letterProgress = (exploredLetters.size / 26) * 100
  const currentLetter = LETTER_ANIMALS[letterIndex]

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
              No children found.{' '}
              <button onClick={() => router.push('/dashboard/children')} style={{ background: 'none', border: 'none', color: PRIMARY, fontWeight: 700, cursor: 'pointer', fontSize: 15, padding: 0 }}>Add a child →</button>
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

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, fontFamily: 'system-ui, sans-serif', color: TEXT }}>
      <style>{`
        @keyframes cardBounce {
          0%   { transform: scale(1) rotate(0deg); }
          20%  { transform: scale(1.13) rotate(-5deg); }
          45%  { transform: scale(1.13) rotate(5deg); }
          65%  { transform: scale(1.07) rotate(-2deg); }
          82%  { transform: scale(1.04) rotate(1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes starPulse { 0%{transform:scale(1)} 40%{transform:scale(1.5)} 100%{transform:scale(1)} }
        @keyframes celebrate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      {/* Nav */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, fontSize: 20, lineHeight: 1, padding: 0 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 17, fontWeight: 700, color: TEXT }}>📖 Little Readers</span>
          <span style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>· {child.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF8EC', border: '1.5px solid #FBDFA3', borderRadius: 100, padding: '6px 14px', animation: starPop ? 'starPulse 0.45s ease' : 'none' }}>
          <span style={{ fontSize: 15 }}>⭐</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#C17A00' }}>{knownCount}</span>
        </div>
      </div>

      {/* ─── Letter Animals Section ─── */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}` }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '28px 16px 32px' : '40px 24px 44px' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ background: '#FFF8EC', color: ORANGE, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: '1.5px solid #FBDFA3', whiteSpace: 'nowrap' as const }}>
              Ages 3–5
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: 0 }}>
              🐾 Letter Animals
            </h2>
          </div>

          {/* Card + arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
            <button
              onClick={() => setLetterIndex(i => Math.max(0, i - 1))}
              disabled={letterIndex === 0}
              onMouseEnter={() => setHover('prev')} onMouseLeave={() => setHover(null)}
              style={btn('prev', {
                width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%',
                border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD,
                fontSize: 18, fontWeight: 700, color: letterIndex === 0 ? BEIGE_BORDER : TEXT_MUTED,
                fontFamily: 'inherit', flexShrink: 0,
                cursor: letterIndex === 0 ? 'default' : 'pointer',
              }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
              ‹
            </button>

            {/* Tappable animal card */}
            <div
              onClick={handleLetterTap}
              style={{
                flex: 1,
                background: exploredLetters.has(currentLetter.letter) ? PRIMARY_BG : BEIGE_CARD,
                borderRadius: 28,
                border: `2px solid ${exploredLetters.has(currentLetter.letter) ? PRIMARY_BORDER : BEIGE_BORDER}`,
                boxShadow: exploredLetters.has(currentLetter.letter)
                  ? '0 8px 32px rgba(155,142,196,0.18)'
                  : '0 4px 18px rgba(0,0,0,0.07)',
                padding: isMobile ? '28px 16px' : '36px 24px',
                textAlign: 'center' as const,
                cursor: 'pointer',
                userSelect: 'none' as const,
                WebkitUserSelect: 'none' as const,
                animation: letterBouncing ? 'cardBounce 0.65s ease' : 'none',
                transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div style={{
                fontFamily: 'Georgia,serif',
                fontSize: isMobile ? 72 : 96,
                fontWeight: 700,
                color: PRIMARY,
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {currentLetter.letter}
              </div>
              <div style={{ fontSize: isMobile ? 52 : 68, lineHeight: 1, marginBottom: 12 }}>
                {currentLetter.emoji}
              </div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 18 : 22, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: '0.04em' }}>
                {currentLetter.animal.toUpperCase()}
              </div>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: ORANGE, letterSpacing: '0.02em' }}>
                {currentLetter.sound}
              </div>
              {!exploredLetters.has(currentLetter.letter) && (
                <div style={{ marginTop: 14, fontSize: 12, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                  TAP THE CARD!
                </div>
              )}
            </div>

            <button
              onClick={() => setLetterIndex(i => Math.min(25, i + 1))}
              disabled={letterIndex === 25}
              onMouseEnter={() => setHover('next')} onMouseLeave={() => setHover(null)}
              style={btn('next', {
                width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%',
                border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD,
                fontSize: 18, fontWeight: 700, color: letterIndex === 25 ? BEIGE_BORDER : TEXT_MUTED,
                fontFamily: 'inherit', flexShrink: 0,
                cursor: letterIndex === 25 ? 'default' : 'pointer',
              }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
              ›
            </button>
          </div>

          {/* Alphabet dots */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 24, justifyContent: 'center' }}>
            {LETTER_ANIMALS.map((la, i) => (
              <button
                key={la.letter}
                onClick={() => setLetterIndex(i)}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  border: `2px solid ${i === letterIndex ? PRIMARY : exploredLetters.has(la.letter) ? PRIMARY_BORDER : BEIGE_BORDER}`,
                  background: i === letterIndex ? PRIMARY : exploredLetters.has(la.letter) ? PRIMARY_BG : BEIGE_CARD,
                  color: i === letterIndex ? 'white' : exploredLetters.has(la.letter) ? PRIMARY : TEXT_MUTED,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}>
                {la.letter}
              </button>
            ))}
          </div>

          {/* Letter progress bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Letters explored</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{exploredLetters.size} / 26</span>
            </div>
            <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${ORANGE}, #F5C842)`, borderRadius: 100, width: `${letterProgress}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sight Words Section ─── */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '40px 24px 64px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: PRIMARY_BG, color: PRIMARY, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1.5px solid ${PRIMARY_BORDER}`, whiteSpace: 'nowrap' as const }}>
            Ages 5–7
          </div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: 0 }}>
            ✨ Sight Words
          </h2>
        </div>

        {/* Sight word progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{knownCount} / {totalWords} words learned</span>
          </div>
          <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${PRIMARY}, ${GREEN})`, borderRadius: 100, width: `${wordProgress}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {wordsDone ? (
          /* Inline celebration */
          <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG}, #EDF7F2)`, borderRadius: 28, border: `2px solid ${PRIMARY_BORDER}`, padding: isMobile ? '32px 20px' : '44px 40px', textAlign: 'center' as const }}>
            <div style={{ fontSize: 64, marginBottom: 12, animation: 'celebrate 1.2s ease infinite', display: 'inline-block' }}>🎉</div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 24 : 32, color: TEXT, marginBottom: 8 }}>Amazing work!</h3>
            <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 24 }}>
              {child.name} has learned all {totalWords} sight words!
            </p>
            <div style={{ fontSize: 28, letterSpacing: 2, marginBottom: 28 }}>
              {'⭐'.repeat(Math.min(totalWords, 20))}
            </div>
            <button onClick={handlePracticeAgain}
              onMouseEnter={() => setHover('again')} onMouseLeave={() => setHover(null)}
              style={btn('again', { padding: '13px 28px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
              🔄 Practice again
            </button>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: TEXT_MUTED, fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
              {deck.length} {deck.length === 1 ? 'word' : 'words'} left to practice
            </p>

            {/* Flashcard */}
            <div
              onClick={() => { if (!flipped) setFlipped(true) }}
              style={{
                background: BEIGE_CARD,
                borderRadius: 28,
                border: `2px solid ${flipped ? PRIMARY_BORDER : BEIGE_BORDER}`,
                boxShadow: flipped ? '0 12px 40px rgba(155,142,196,0.2)' : '0 4px 18px rgba(0,0,0,0.07)',
                padding: isMobile ? '40px 24px' : '52px 48px',
                textAlign: 'center' as const,
                cursor: flipped ? 'default' : 'pointer',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                minHeight: isMobile ? 240 : 300,
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
                  {deck[0].emoji}
                </div>
              )}
              <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 72 : 96, fontWeight: 700, color: flipped ? PRIMARY : TEXT, lineHeight: 1, letterSpacing: '0.02em', transition: 'color 0.2s ease' }}>
                {deck[0].word}
              </div>
              {flipped ? (
                <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 16 : 18, fontWeight: 600, lineHeight: 1.55, margin: 0, animation: 'fadeSlideUp 0.25s ease', maxWidth: 300 }}>
                  {deck[0].sentence}
                </p>
              ) : (
                <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                  TAP TO REVEAL
                </p>
              )}
            </div>

            {/* Action buttons */}
            {flipped && (
              <div style={{ display: 'flex', gap: 12, marginTop: 16, animation: 'fadeSlideUp 0.2s ease' }}>
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
          </>
        )}
      </div>
    </div>
  )
}
