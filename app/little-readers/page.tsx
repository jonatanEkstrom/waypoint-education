'use client'
import { useState, useEffect, useRef } from 'react'
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

type LangKey = 'EN' | 'SV' | 'ES' | 'FR' | 'DE'
interface AnimalEntry { letter: string; animal: string; emoji: string; sound: string }

interface Child {
  id: string
  name: string
  age_group: string
  language_learning?: string
}

// '4–6 years' → Letter Animals; all other groups → Sight Words
function isYoungChild(age_group: string) {
  return age_group === '4–6 years'
}

const LETTER_ANIMALS_ALL: Record<LangKey, AnimalEntry[]> = {
  EN: [
    { letter: 'A', animal: 'Alligator',       emoji: '🐊', sound: 'Snap!' },
    { letter: 'B', animal: 'Bear',             emoji: '🐻', sound: 'Roar!' },
    { letter: 'C', animal: 'Cat',              emoji: '🐱', sound: 'Meow!' },
    { letter: 'D', animal: 'Dog',              emoji: '🐶', sound: 'Woof!' },
    { letter: 'E', animal: 'Elephant',         emoji: '🐘', sound: 'Trumpet!' },
    { letter: 'F', animal: 'Fish',             emoji: '🐟', sound: 'Blub!' },
    { letter: 'G', animal: 'Giraffe',          emoji: '🦒', sound: 'Munch!' },
    { letter: 'H', animal: 'Horse',            emoji: '🐴', sound: 'Neigh!' },
    { letter: 'I', animal: 'Inchworm',         emoji: '🐛', sound: 'Wiggle!' },
    { letter: 'J', animal: 'Jellyfish',        emoji: '🪼', sound: 'Splash!' },
    { letter: 'K', animal: 'Kangaroo',         emoji: '🦘', sound: 'Boing!' },
    { letter: 'L', animal: 'Lion',             emoji: '🦁', sound: 'Roar!' },
    { letter: 'M', animal: 'Monkey',           emoji: '🐒', sound: 'Ooh ooh!' },
    { letter: 'N', animal: 'Narwhal',          emoji: '🐋', sound: 'Splash!' },
    { letter: 'O', animal: 'Owl',              emoji: '🦉', sound: 'Hoot!' },
    { letter: 'P', animal: 'Penguin',          emoji: '🐧', sound: 'Squawk!' },
    { letter: 'Q', animal: 'Queen',            emoji: '👸', sound: 'Hooray!' },
    { letter: 'R', animal: 'Rabbit',           emoji: '🐰', sound: 'Squeak!' },
    { letter: 'S', animal: 'Snake',            emoji: '🐍', sound: 'Hiss!' },
    { letter: 'T', animal: 'Tiger',            emoji: '🐯', sound: 'Growl!' },
    { letter: 'U', animal: 'Unicorn',          emoji: '🦄', sound: 'Neigh!' },
    { letter: 'V', animal: 'Vulture',          emoji: '🦅', sound: 'Screech!' },
    { letter: 'W', animal: 'Wolf',             emoji: '🐺', sound: 'Howl!' },
    { letter: 'X', animal: 'Fox ends with X',  emoji: '🦊', sound: 'Woof!' },
    { letter: 'Y', animal: 'Yak',             emoji: '🐃', sound: 'Grunt!' },
    { letter: 'Z', animal: 'Zebra',           emoji: '🦓', sound: 'Whinny!' },
  ],
  SV: [
    { letter: 'A', animal: 'Apa',             emoji: '🐒', sound: 'Ooh ooh!' },
    { letter: 'B', animal: 'Björn',           emoji: '🐻', sound: 'Roar!' },
    { letter: 'C', animal: 'Chamäleon',       emoji: '🦎', sound: 'Hiss!' },
    { letter: 'D', animal: 'Delfin',          emoji: '🐬', sound: 'Splash!' },
    { letter: 'E', animal: 'Elefant',         emoji: '🐘', sound: 'Trumpet!' },
    { letter: 'F', animal: 'Fisk',            emoji: '🐟', sound: 'Blub!' },
    { letter: 'G', animal: 'Giraff',          emoji: '🦒', sound: 'Munch!' },
    { letter: 'H', animal: 'Häst',            emoji: '🐴', sound: 'Neigh!' },
    { letter: 'I', animal: 'Igelkott',        emoji: '🦔', sound: 'Sniff!' },
    { letter: 'J', animal: 'Jaguar',          emoji: '🐆', sound: 'Growl!' },
    { letter: 'K', animal: 'Katt',            emoji: '🐱', sound: 'Meow!' },
    { letter: 'L', animal: 'Lejon',           emoji: '🦁', sound: 'Roar!' },
    { letter: 'M', animal: 'Myra',            emoji: '🐜', sound: 'March!' },
    { letter: 'N', animal: 'Noshörning',      emoji: '🦏', sound: 'Stomp!' },
    { letter: 'O', animal: 'Orm',             emoji: '🐍', sound: 'Hiss!' },
    { letter: 'P', animal: 'Pingvin',         emoji: '🐧', sound: 'Squawk!' },
    { letter: 'Q', animal: 'Quetzal',         emoji: '🦜', sound: 'Squawk!' },
    { letter: 'R', animal: 'Räv',             emoji: '🦊', sound: 'Woof!' },
    { letter: 'S', animal: 'Svan',            emoji: '🦢', sound: 'Honk!' },
    { letter: 'T', animal: 'Tiger',           emoji: '🐯', sound: 'Growl!' },
    { letter: 'U', animal: 'Uggla',           emoji: '🦉', sound: 'Hoot!' },
    { letter: 'V', animal: 'Varg',            emoji: '🐺', sound: 'Howl!' },
    { letter: 'W', animal: 'Walross',         emoji: '🦭', sound: 'Splash!' },
    { letter: 'X', animal: 'Xerus',           emoji: '🐿️', sound: 'Squeak!' },
    { letter: 'Y', animal: 'Yak',             emoji: '🐃', sound: 'Grunt!' },
    { letter: 'Z', animal: 'Zebra',           emoji: '🦓', sound: 'Whinny!' },
  ],
  ES: [
    { letter: 'A', animal: 'Ardilla',         emoji: '🐿️', sound: 'Squeak!' },
    { letter: 'B', animal: 'Ballena',         emoji: '🐳', sound: 'Splash!' },
    { letter: 'C', animal: 'Caballo',         emoji: '🐴', sound: 'Neigh!' },
    { letter: 'D', animal: 'Delfín',          emoji: '🐬', sound: 'Splash!' },
    { letter: 'E', animal: 'Elefante',        emoji: '🐘', sound: 'Trumpet!' },
    { letter: 'F', animal: 'Flamenco',        emoji: '🦩', sound: 'Squawk!' },
    { letter: 'G', animal: 'Gato',            emoji: '🐱', sound: 'Meow!' },
    { letter: 'H', animal: 'Hipopótamo',      emoji: '🦛', sound: 'Splash!' },
    { letter: 'I', animal: 'Iguana',          emoji: '🦎', sound: 'Hiss!' },
    { letter: 'J', animal: 'Jaguar',          emoji: '🐆', sound: 'Growl!' },
    { letter: 'K', animal: 'Koala',           emoji: '🐨', sound: 'Squeak!' },
    { letter: 'L', animal: 'León',            emoji: '🦁', sound: 'Roar!' },
    { letter: 'M', animal: 'Mono',            emoji: '🐒', sound: 'Ooh ooh!' },
    { letter: 'N', animal: 'Nutria',          emoji: '🦦', sound: 'Splash!' },
    { letter: 'O', animal: 'Oso',             emoji: '🐻', sound: 'Roar!' },
    { letter: 'P', animal: 'Pato',            emoji: '🦆', sound: 'Quack!' },
    { letter: 'Q', animal: 'Quetzal',         emoji: '🦜', sound: 'Squawk!' },
    { letter: 'R', animal: 'Rana',            emoji: '🐸', sound: 'Ribbit!' },
    { letter: 'S', animal: 'Serpiente',       emoji: '🐍', sound: 'Hiss!' },
    { letter: 'T', animal: 'Tigre',           emoji: '🐯', sound: 'Growl!' },
    { letter: 'U', animal: 'Unicornio',       emoji: '🦄', sound: 'Neigh!' },
    { letter: 'V', animal: 'Vaca',            emoji: '🐄', sound: 'Moo!' },
    { letter: 'W', animal: 'Wombat',          emoji: '🐨', sound: 'Grunt!' },
    { letter: 'X', animal: 'Xenops',          emoji: '🐦', sound: 'Tweet!' },
    { letter: 'Y', animal: 'Yak',             emoji: '🐃', sound: 'Grunt!' },
    { letter: 'Z', animal: 'Zorro',           emoji: '🦊', sound: 'Woof!' },
  ],
  FR: [
    { letter: 'A', animal: 'Âne',             emoji: '🫏', sound: 'Hee-haw!' },
    { letter: 'B', animal: 'Baleine',         emoji: '🐳', sound: 'Splash!' },
    { letter: 'C', animal: 'Chat',            emoji: '🐱', sound: 'Meow!' },
    { letter: 'D', animal: 'Dauphin',         emoji: '🐬', sound: 'Splash!' },
    { letter: 'E', animal: 'Éléphant',        emoji: '🐘', sound: 'Trumpet!' },
    { letter: 'F', animal: 'Flamant',         emoji: '🦩', sound: 'Squawk!' },
    { letter: 'G', animal: 'Grenouille',      emoji: '🐸', sound: 'Ribbit!' },
    { letter: 'H', animal: 'Hérisson',        emoji: '🦔', sound: 'Sniff!' },
    { letter: 'I', animal: 'Ibis',            emoji: '🐦', sound: 'Tweet!' },
    { letter: 'J', animal: 'Jaguar',          emoji: '🐆', sound: 'Growl!' },
    { letter: 'K', animal: 'Koala',           emoji: '🐨', sound: 'Squeak!' },
    { letter: 'L', animal: 'Lion',            emoji: '🦁', sound: 'Roar!' },
    { letter: 'M', animal: 'Mouton',          emoji: '🐑', sound: 'Baa!' },
    { letter: 'N', animal: 'Narval',          emoji: '🐋', sound: 'Splash!' },
    { letter: 'O', animal: 'Ours',            emoji: '🐻', sound: 'Roar!' },
    { letter: 'P', animal: 'Pingouin',        emoji: '🐧', sound: 'Squawk!' },
    { letter: 'Q', animal: 'Quetzal',         emoji: '🦜', sound: 'Squawk!' },
    { letter: 'R', animal: 'Renard',          emoji: '🦊', sound: 'Woof!' },
    { letter: 'S', animal: 'Singe',           emoji: '🐒', sound: 'Ooh ooh!' },
    { letter: 'T', animal: 'Tigre',           emoji: '🐯', sound: 'Growl!' },
    { letter: 'U', animal: 'Urubu',           emoji: '🦅', sound: 'Screech!' },
    { letter: 'V', animal: 'Vache',           emoji: '🐄', sound: 'Moo!' },
    { letter: 'W', animal: 'Wombat',          emoji: '🐨', sound: 'Grunt!' },
    { letter: 'X', animal: 'Xérus',           emoji: '🐿️', sound: 'Squeak!' },
    { letter: 'Y', animal: 'Yak',             emoji: '🐃', sound: 'Grunt!' },
    { letter: 'Z', animal: 'Zèbre',           emoji: '🦓', sound: 'Whinny!' },
  ],
  DE: [
    { letter: 'A', animal: 'Affe',            emoji: '🐒', sound: 'Ooh ooh!' },
    { letter: 'B', animal: 'Bär',             emoji: '🐻', sound: 'Roar!' },
    { letter: 'C', animal: 'Chamäleon',       emoji: '🦎', sound: 'Hiss!' },
    { letter: 'D', animal: 'Delphin',         emoji: '🐬', sound: 'Splash!' },
    { letter: 'E', animal: 'Elefant',         emoji: '🐘', sound: 'Trumpet!' },
    { letter: 'F', animal: 'Frosch',          emoji: '🐸', sound: 'Ribbit!' },
    { letter: 'G', animal: 'Giraffe',         emoji: '🦒', sound: 'Munch!' },
    { letter: 'H', animal: 'Hase',            emoji: '🐰', sound: 'Squeak!' },
    { letter: 'I', animal: 'Igel',            emoji: '🦔', sound: 'Sniff!' },
    { letter: 'J', animal: 'Jaguar',          emoji: '🐆', sound: 'Growl!' },
    { letter: 'K', animal: 'Katze',           emoji: '🐱', sound: 'Meow!' },
    { letter: 'L', animal: 'Löwe',            emoji: '🦁', sound: 'Roar!' },
    { letter: 'M', animal: 'Maus',            emoji: '🐭', sound: 'Squeak!' },
    { letter: 'N', animal: 'Nashorn',         emoji: '🦏', sound: 'Stomp!' },
    { letter: 'O', animal: 'Otter',           emoji: '🦦', sound: 'Splash!' },
    { letter: 'P', animal: 'Pinguin',         emoji: '🐧', sound: 'Squawk!' },
    { letter: 'Q', animal: 'Quetzal',         emoji: '🦜', sound: 'Squawk!' },
    { letter: 'R', animal: 'Robbe',           emoji: '🦭', sound: 'Splash!' },
    { letter: 'S', animal: 'Schlange',        emoji: '🐍', sound: 'Hiss!' },
    { letter: 'T', animal: 'Tiger',           emoji: '🐯', sound: 'Growl!' },
    { letter: 'U', animal: 'Uhu',             emoji: '🦉', sound: 'Hoot!' },
    { letter: 'V', animal: 'Vogel',           emoji: '🐦', sound: 'Tweet!' },
    { letter: 'W', animal: 'Wolf',            emoji: '🐺', sound: 'Howl!' },
    { letter: 'X', animal: 'Xerus',           emoji: '🐿️', sound: 'Squeak!' },
    { letter: 'Y', animal: 'Yak',             emoji: '🐃', sound: 'Grunt!' },
    { letter: 'Z', animal: 'Zebra',           emoji: '🦓', sound: 'Whinny!' },
  ],
}

const LANG_LEARNING_MAP: Partial<Record<string, LangKey>> = {
  Swedish: 'SV', Spanish: 'ES', French: 'FR', German: 'DE',
}

const LANG_BCP47: Record<LangKey, string> = {
  EN: 'en-GB', SV: 'sv-SE', ES: 'es-ES', FR: 'fr-FR', DE: 'de-DE',
}

const LANG_FLAGS: Record<LangKey, string> = {
  EN: '🇬🇧', SV: '🇸🇪', ES: '🇪🇸', FR: '🇫🇷', DE: '🇩🇪',
}

function toLangKey(languageLearning?: string): LangKey {
  return LANG_LEARNING_MAP[languageLearning ?? ''] ?? 'EN'
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
  const [userId, setUserId] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Letter Animals state
  const [letterIndex, setLetterIndex] = useState(0)
  const [exploredLetters, setExploredLetters] = useState<Set<string>>(new Set())
  const [letterBouncing, setLetterBouncing] = useState(false)
  const [selectedLang, setSelectedLang] = useState<LangKey>('EN')

  // Sight Words state
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set())
  const [deck, setDeck] = useState<typeof SIGHT_WORDS>([])
  const [flipped, setFlipped] = useState(false)
  const [wordsDone, setWordsDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [starPop, setStarPop] = useState(false)
  const speakTimers = useRef<ReturnType<typeof setTimeout>[]>([])

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

      // Always load the full children list so the inline selector works
      const { data: allChildren } = await supabase
        .from('children')
        .select('id, name, age_group, language_learning')
        .eq('user_id', user.id)

      if (allChildren) setChildren(allChildren)

      // Try to use the stored active child first
      const stored = localStorage.getItem('activeChild')
      if (stored) {
        try {
          const active = JSON.parse(stored)
          if (active.user_id === user.id && active.id) {
            const match = allChildren?.find(c => c.id === active.id)
            const resolved = match ?? active
            setChild(resolved)
            await loadProgress(user.id, resolved.id, resolved.language_learning)
            setLoading(false)
            return
          }
        } catch {}
      }

      // Fall back: auto-select if there's exactly one child
      if (allChildren?.length === 1) {
        setChild(allChildren[0])
        await loadProgress(user.id, allChildren[0].id, allChildren[0].language_learning)
      }
    }

    setLoading(false)
  }

  async function loadProgress(uid: string, childId: string, languageLearning?: string) {
    const { data } = await supabase
      .from('little_readers_progress')
      .select('known_words, language')
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

    const VALID: LangKey[] = ['EN', 'SV', 'ES', 'FR', 'DE']
    const saved = data?.language as string | undefined
    setSelectedLang(saved && VALID.includes(saved as LangKey) ? saved as LangKey : toLangKey(languageLearning))
  }

  function buildDeck(known: Set<string>) {
    const remaining = SIGHT_WORDS.filter(w => !known.has(w.word))
    setDeck(remaining)
    setWordsDone(remaining.length === 0)
    setFlipped(false)
  }

  async function saveProgress(newWords: Set<string>, newLetters: Set<string>, langOverride?: LangKey) {
    if (!userId || !child) return
    const combined = [
      ...Array.from(newWords),
      ...Array.from(newLetters).map(l => `LETTER_${l}`),
    ]
    await supabase.from('little_readers_progress').upsert(
      { user_id: userId, child_id: child.id, known_words: combined, language: langOverride ?? selectedLang, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,child_id' }
    )
  }

  function speakCard(entry: AnimalEntry, lang: LangKey) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    speechSynthesis.cancel()
    speakTimers.current.forEach(t => clearTimeout(t))
    speakTimers.current = []

    const letters = entry.animal.split('').filter(c => c.trim())
    const texts = [entry.letter, entry.animal, ...letters]
    let delay = 0
    texts.forEach((text, i) => {
      const t = setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text)
        u.lang = LANG_BCP47[lang]
        u.rate = 0.7
        u.pitch = 1.2
        speechSynthesis.speak(u)
      }, delay)
      speakTimers.current.push(t)
      delay += i === 0 ? 800 : i === 1 ? 1000 : 400
    })
  }

  function handleLetterTap() {
    setLetterBouncing(true)
    setTimeout(() => setLetterBouncing(false), 650)
    const entry = animalData[letterIndex]
    speakCard(entry, selectedLang)
    if (!exploredLetters.has(entry.letter)) {
      const newExplored = new Set(exploredLetters)
      newExplored.add(entry.letter)
      setExploredLetters(newExplored)
      saveProgress(knownWords, newExplored)
    }
  }

  async function handleKnowIt() {
    if (!deck.length || saving) return
    setSaving(true)
    setStarPop(true)
    setTimeout(() => setStarPop(false), 500)
    const newKnown = new Set(knownWords)
    newKnown.add(deck[0].word)
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
    setLetterIndex(0)
    setFlipped(false)
    if (userId) await loadProgress(userId, c.id, c.language_learning)
    else { buildDeck(new Set()); setExploredLetters(new Set()) }
  }

  const btn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer',
  })

  const knownCount = knownWords.size
  const wordProgress = (knownCount / SIGHT_WORDS.length) * 100
  const letterProgress = (exploredLetters.size / 26) * 100
  const animalData = LETTER_ANIMALS_ALL[selectedLang]
  const currentLetter = animalData[letterIndex]
  const young = child ? isYoungChild(child.age_group) : false

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <span style={{ color: TEXT_MUTED, fontSize: 16 }}>Loading...</span>
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
          {child && <span style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>· {child.name}</span>}
        </div>
        {child && (
          young ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF8EC', border: '1.5px solid #FBDFA3', borderRadius: 100, padding: '6px 14px' }}>
              <span style={{ fontSize: 15 }}>🐾</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#C17A00' }}>{exploredLetters.size}/26</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF8EC', border: '1.5px solid #FBDFA3', borderRadius: 100, padding: '6px 14px', animation: starPop ? 'starPulse 0.45s ease' : 'none' }}>
              <span style={{ fontSize: 15 }}>⭐</span>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#C17A00' }}>{knownCount}</span>
            </div>
          )
        )}
      </div>

      {/* Inline child selector — shown when there are multiple children */}
      {children.length > 1 && (
        <div style={{ background: BEIGE_CARD, borderBottom: `1px solid ${BEIGE_BORDER}`, padding: '10px 20px', overflowX: 'auto' as const }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 'max-content' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', flexShrink: 0 }}>Reading:</span>
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => selectChild(c)}
                onMouseEnter={() => setHover(`sel-${c.id}`)} onMouseLeave={() => setHover(null)}
                style={btn(`sel-${c.id}`, {
                  padding: '6px 14px', borderRadius: 100, fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                  border: `2px solid ${child?.id === c.id ? PRIMARY : BEIGE_BORDER}`,
                  background: child?.id === c.id ? PRIMARY_BG : BEIGE_CARD,
                  color: child?.id === c.id ? PRIMARY : TEXT_MUTED,
                  whiteSpace: 'nowrap' as const,
                }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
                {c.name}
                <span style={{ fontWeight: 400, marginLeft: 6, opacity: 0.7 }}>{c.age_group.split('–')[0]}–{c.age_group.split('–')[1]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No child selected yet */}
      {!child && (
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📖</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: TEXT, marginBottom: 8 }}>Who is reading today?</h2>
          {children.length === 0 ? (
            <p style={{ color: TEXT_MUTED, fontSize: 15 }}>
              No children found.{' '}
              <button onClick={() => router.push('/dashboard/children')} style={{ background: 'none', border: 'none', color: PRIMARY, fontWeight: 700, cursor: 'pointer', fontSize: 15, padding: 0 }}>
                Add a child →
              </button>
            </p>
          ) : (
            <p style={{ color: TEXT_MUTED, fontSize: 15 }}>Select a child above to begin.</p>
          )}
        </div>
      )}

      {/* ─── Letter Animals (ages 4–6) ─── */}
      {child && young && (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '40px 24px 64px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#FFF8EC', color: ORANGE, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: '1.5px solid #FBDFA3', whiteSpace: 'nowrap' as const }}>
              Ages 3–5
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: 0 }}>
              🐾 Letter Animals
            </h2>
          </div>

          {/* Language picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Language:</span>
            {(['EN', 'SV', 'ES', 'FR', 'DE'] as LangKey[]).map(lang => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLang(lang)
                  saveProgress(knownWords, exploredLetters, lang)
                }}
                onMouseEnter={() => setHover(`lang-${lang}`)}
                onMouseLeave={() => setHover(null)}
                style={btn(`lang-${lang}`, {
                  padding: '5px 11px', borderRadius: 100, fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                  border: `2px solid ${selectedLang === lang ? PRIMARY : BEIGE_BORDER}`,
                  background: selectedLang === lang ? PRIMARY_BG : BEIGE_CARD,
                  color: selectedLang === lang ? PRIMARY : TEXT_MUTED,
                }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}
              >
                {LANG_FLAGS[lang]} {lang}
              </button>
            ))}
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
                fontFamily: 'inherit', flexShrink: 0, cursor: letterIndex === 0 ? 'default' : 'pointer',
              }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
              ‹
            </button>

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
              <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 72 : 96, fontWeight: 700, color: PRIMARY, lineHeight: 1, marginBottom: 8 }}>
                {currentLetter.letter}
              </div>
              <div style={{ fontSize: isMobile ? 52 : 68, lineHeight: 1, marginBottom: 12 }}>
                {currentLetter.emoji}
              </div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 18, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: '0.04em' }}>
                {currentLetter.animal.toUpperCase()}
              </div>
              <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: ORANGE }}>
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
                fontFamily: 'inherit', flexShrink: 0, cursor: letterIndex === 25 ? 'default' : 'pointer',
              }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
              ›
            </button>
          </div>

          {/* Alphabet dot grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 24, justifyContent: 'center' }}>
            {animalData.map((la, i) => (
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
              <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE }}>{exploredLetters.size} / 26</span>
            </div>
            <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${ORANGE}, #F5C842)`, borderRadius: 100, width: `${letterProgress}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Sight Words (ages 7+) ─── */}
      {child && !young && (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '40px 24px 64px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ background: PRIMARY_BG, color: PRIMARY, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1.5px solid ${PRIMARY_BORDER}`, whiteSpace: 'nowrap' as const }}>
              Ages 5–7
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: 0 }}>
              ✨ Sight Words
            </h2>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{knownCount} / {SIGHT_WORDS.length} words learned</span>
            </div>
            <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${PRIMARY}, ${GREEN})`, borderRadius: 100, width: `${wordProgress}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {wordsDone ? (
            <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG}, #EDF7F2)`, borderRadius: 28, border: `2px solid ${PRIMARY_BORDER}`, padding: isMobile ? '32px 20px' : '44px 40px', textAlign: 'center' as const }}>
              <div style={{ fontSize: 64, marginBottom: 12, animation: 'celebrate 1.2s ease infinite', display: 'inline-block' }}>🎉</div>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 24 : 32, color: TEXT, marginBottom: 8 }}>Amazing work!</h3>
              <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 24 }}>
                {child.name} has learned all {SIGHT_WORDS.length} sight words!
              </p>
              <div style={{ fontSize: 28, letterSpacing: 2, marginBottom: 28 }}>{'⭐'.repeat(Math.min(SIGHT_WORDS.length, 20))}</div>
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
      )}
    </div>
  )
}
