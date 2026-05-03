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
const GREEN_BG = '#EDF7F2'
const ORANGE = '#F5A623'
const ORANGE_BG = '#FFF8EC'
const ORANGE_BORDER = '#FBDFA3'
const BLUE = '#4A78C4'
const BLUE_BG = '#EAF0FB'
const BLUE_BORDER = '#C5D8F6'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

type LangKey = 'EN' | 'SV' | 'ES' | 'FR' | 'DE'
interface AnimalEntry { letter: string; animal: string; emoji: string; sound: string }
interface Child { id: string; name: string; age_group: string; language_learning?: string }

const LETTER_ANIMALS_ALL: Record<LangKey, AnimalEntry[]> = {
  EN: [
    { letter: 'A', animal: 'Alligator',      emoji: '🐊', sound: 'Snap!' },
    { letter: 'B', animal: 'Bear',            emoji: '🐻', sound: 'Roar!' },
    { letter: 'C', animal: 'Cat',             emoji: '🐱', sound: 'Meow!' },
    { letter: 'D', animal: 'Dog',             emoji: '🐶', sound: 'Woof!' },
    { letter: 'E', animal: 'Elephant',        emoji: '🐘', sound: 'Trumpet!' },
    { letter: 'F', animal: 'Fish',            emoji: '🐟', sound: 'Blub!' },
    { letter: 'G', animal: 'Giraffe',         emoji: '🦒', sound: 'Munch!' },
    { letter: 'H', animal: 'Horse',           emoji: '🐴', sound: 'Neigh!' },
    { letter: 'I', animal: 'Inchworm',        emoji: '🐛', sound: 'Wiggle!' },
    { letter: 'J', animal: 'Jellyfish',       emoji: '🪼', sound: 'Splash!' },
    { letter: 'K', animal: 'Kangaroo',        emoji: '🦘', sound: 'Boing!' },
    { letter: 'L', animal: 'Lion',            emoji: '🦁', sound: 'Roar!' },
    { letter: 'M', animal: 'Monkey',          emoji: '🐒', sound: 'Ooh ooh!' },
    { letter: 'N', animal: 'Narwhal',         emoji: '🐋', sound: 'Splash!' },
    { letter: 'O', animal: 'Owl',             emoji: '🦉', sound: 'Hoot!' },
    { letter: 'P', animal: 'Penguin',         emoji: '🐧', sound: 'Squawk!' },
    { letter: 'Q', animal: 'Queen bee',       emoji: '🐝', sound: 'Buzz!' },
    { letter: 'R', animal: 'Rabbit',          emoji: '🐰', sound: 'Squeak!' },
    { letter: 'S', animal: 'Snake',           emoji: '🐍', sound: 'Hiss!' },
    { letter: 'T', animal: 'Tiger',           emoji: '🐯', sound: 'Growl!' },
    { letter: 'U', animal: 'Unicorn',         emoji: '🦄', sound: 'Neigh!' },
    { letter: 'V', animal: 'Vulture',         emoji: '🦅', sound: 'Screech!' },
    { letter: 'W', animal: 'Wolf',            emoji: '🐺', sound: 'Howl!' },
    { letter: 'X', animal: 'Fox',             emoji: '🦊', sound: 'Woof!' },
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

const CVC_WORDS = [
  { word: 'cat', emoji: '🐱', letters: ['c','a','t'] },
  { word: 'dog', emoji: '🐶', letters: ['d','o','g'] },
  { word: 'sun', emoji: '☀️', letters: ['s','u','n'] },
  { word: 'hat', emoji: '🎩', letters: ['h','a','t'] },
  { word: 'cup', emoji: '☕', letters: ['c','u','p'] },
  { word: 'big', emoji: '🐘', letters: ['b','i','g'] },
  { word: 'red', emoji: '🔴', letters: ['r','e','d'] },
  { word: 'run', emoji: '🏃', letters: ['r','u','n'] },
  { word: 'bug', emoji: '🐛', letters: ['b','u','g'] },
  { word: 'hop', emoji: '🐸', letters: ['h','o','p'] },
  { word: 'jet', emoji: '✈️', letters: ['j','e','t'] },
  { word: 'map', emoji: '🗺️', letters: ['m','a','p'] },
  { word: 'pig', emoji: '🐷', letters: ['p','i','g'] },
  { word: 'sit', emoji: '🧘', letters: ['s','i','t'] },
  { word: 'top', emoji: '🌀', letters: ['t','o','p'] },
  { word: 'web', emoji: '🕸️', letters: ['w','e','b'] },
  { word: 'hen', emoji: '🐔', letters: ['h','e','n'] },
  { word: 'mud', emoji: '💧', letters: ['m','u','d'] },
  { word: 'nap', emoji: '😴', letters: ['n','a','p'] },
  { word: 'pen', emoji: '✏️', letters: ['p','e','n'] },
  { word: 'van', emoji: '🚐', letters: ['v','a','n'] },
  { word: 'zip', emoji: '🤐', letters: ['z','i','p'] },
  { word: 'fox', emoji: '🦊', letters: ['f','o','x'] },
  { word: 'win', emoji: '🏆', letters: ['w','i','n'] },
]

const SIGHT_WORDS = [
  { word: 'THE',  emoji: '👆', sentence: 'THE CAT SAT ON THE MAT.' },
  { word: 'AND',  emoji: '🤝', sentence: 'MUM AND DAD WENT FOR A WALK.' },
  { word: 'A',    emoji: '🍎', sentence: 'I SAW A BIG RED APPLE.' },
  { word: 'IS',   emoji: '☀️', sentence: 'THE SUN IS VERY BRIGHT TODAY.' },
  { word: 'IN',   emoji: '📦', sentence: 'THE CAT IS IN THE BOX.' },
  { word: 'IT',   emoji: '🎁', sentence: 'IT IS A PRESENT FOR YOU.' },
  { word: 'YOU',  emoji: '😊', sentence: 'I LOVE YOU VERY MUCH.' },
  { word: 'HE',   emoji: '👦', sentence: 'HE LIKES TO PLAY IN THE PARK.' },
  { word: 'SHE',  emoji: '👧', sentence: 'SHE HAS A PRETTY RED DRESS.' },
  { word: 'WE',   emoji: '👨‍👩‍👧', sentence: 'WE ARE GOING TO THE BEACH.' },
  { word: 'ARE',  emoji: '🌟', sentence: 'WE ARE HAVING SO MUCH FUN.' },
  { word: 'AT',   emoji: '🏫', sentence: 'SHE IS AT SCHOOL TODAY.' },
  { word: 'BE',   emoji: '🐝', sentence: 'TRY TO BE KIND TO OTHERS.' },
  { word: 'BUT',  emoji: '🤔', sentence: 'I WANT TO PLAY BUT IT IS RAINING.' },
  { word: 'DO',   emoji: '✅', sentence: 'DO YOUR BEST EVERY DAY.' },
  { word: 'FOR',  emoji: '🎀', sentence: 'THIS CAKE IS FOR MY BIRTHDAY.' },
  { word: 'GO',   emoji: '🚀', sentence: 'LET US GO ON AN ADVENTURE.' },
  { word: 'HAVE', emoji: '🤲', sentence: 'I HAVE A PET DOG.' },
  { word: 'HIS',  emoji: '🎒', sentence: 'HIS BAG IS FULL OF BOOKS.' },
  { word: 'HOW',  emoji: '❓', sentence: 'HOW DID THE BIRD FLY SO HIGH?' },
  { word: 'I',    emoji: '🙋', sentence: 'I AM LEARNING TO READ.' },
  { word: 'IF',   emoji: '🌈', sentence: 'IF IT RAINS WE WILL STAY INSIDE.' },
  { word: 'ME',   emoji: '🫶', sentence: 'CAN YOU PASS THAT TO ME?' },
  { word: 'MY',   emoji: '❤️', sentence: 'MY FAVOURITE COLOUR IS BLUE.' },
  { word: 'NOT',  emoji: '🚫', sentence: 'DO NOT TOUCH THE HOT STOVE.' },
  { word: 'ON',   emoji: '🐱', sentence: 'THE CAT SAT ON THE CHAIR.' },
  { word: 'OUT',  emoji: '🚪', sentence: 'LET US GO OUT AND PLAY.' },
  { word: 'SO',   emoji: '😄', sentence: 'I AM SO HAPPY TODAY.' },
  { word: 'TO',   emoji: '🗺️', sentence: 'WE WENT TO THE PARK TOGETHER.' },
  { word: 'UP',   emoji: '☁️', sentence: 'THE BALLOON FLEW UP IN THE SKY.' },
  { word: 'WAS',  emoji: '📸', sentence: 'IT WAS A LOVELY SUNNY DAY.' },
  { word: 'WITH', emoji: '🤗', sentence: 'I PLAYED WITH MY BEST FRIEND.' },
  { word: 'ALL',  emoji: '🌍', sentence: 'ALL THE CHILDREN WERE LAUGHING.' },
  { word: 'LOOK', emoji: '👀', sentence: 'LOOK AT THAT BEAUTIFUL RAINBOW.' },
  { word: 'SAID', emoji: '💬', sentence: 'SHE SAID HELLO TO EVERYONE.' },
  { word: 'THEY', emoji: '👫', sentence: 'THEY WENT TO THE PARK TOGETHER.' },
  { word: 'THIS', emoji: '👇', sentence: 'THIS IS MY FAVOURITE BOOK.' },
  { word: 'WHAT', emoji: '🤩', sentence: 'WHAT A WONDERFUL SURPRISE.' },
  { word: 'WHEN', emoji: '⏰', sentence: 'WHEN WILL WE GET THERE?' },
  { word: 'WILL', emoji: '✨', sentence: 'WE WILL GO TO THE BEACH TOMORROW.' },
]

const LANG_LEARNING_MAP: Partial<Record<string, LangKey>> = {
  Swedish: 'SV', Spanish: 'ES', French: 'FR', German: 'DE',
}
const LANG_BCP47: Record<LangKey, string> = {
  EN: 'en-US', SV: 'sv-SE', ES: 'es-ES', FR: 'fr-FR', DE: 'de-DE',
}
const LANG_FLAGS: Record<LangKey, string> = {
  EN: '🇬🇧', SV: '🇸🇪', ES: '🇪🇸', FR: '🇫🇷', DE: '🇩🇪',
}
function toLangKey(languageLearning?: string): LangKey {
  return LANG_LEARNING_MAP[languageLearning ?? ''] ?? 'EN'
}

export default function LittleReadersPage() {
  const router = useRouter()

  const [child, setChild] = useState<Child | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Level management
  const [selectedLevel, setSelectedLevel] = useState<1|2|3>(1)
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const [welcomeBack, setWelcomeBack] = useState(false)
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  // Level 1: Letter Animals
  const [letterIndex, setLetterIndex] = useState(0)
  const [exploredLetters, setExploredLetters] = useState<Set<string>>(new Set())
  const [letterBouncing, setLetterBouncing] = useState(false)
  const [selectedLang, setSelectedLang] = useState<LangKey>('EN')

  // Level 2: CVC Words
  const [cvcIndex, setCvcIndex] = useState(0)
  const [masteredCvc, setMasteredCvc] = useState<Set<string>>(new Set())
  const [soundedOut, setSoundedOut] = useState(false)
  const [soundingOut, setSoundingOut] = useState(false)
  const [highlightLetter, setHighlightLetter] = useState(-1)
  const [cvcSaving, setCvcSaving] = useState(false)
  const [cvcPop, setCvcPop] = useState(false)

  // Level 3: Sight Words
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set())
  const [deck, setDeck] = useState<typeof SIGHT_WORDS>([])
  const [flipped, setFlipped] = useState(false)
  const [wordsDone, setWordsDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [starPop, setStarPop] = useState(false)

  const speakTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const cvcTimers = useRef<ReturnType<typeof setTimeout>[]>([])

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
      const { data: allChildren } = await supabase
        .from('children')
        .select('id, name, age_group, language_learning')
        .eq('user_id', user.id)
      if (allChildren) setChildren(allChildren)

      const stored = localStorage.getItem('activeChild')
      if (stored) {
        try {
          const active = JSON.parse(stored)
          if (active.user_id === user.id && active.id) {
            const match = allChildren?.find(c => c.id === active.id)
            const resolved = match ?? active
            setChild(resolved)
            await loadProgress(user.id, resolved.id, match?.language_learning ?? active.language_learning)
            setLoading(false)
            return
          }
        } catch {}
      }
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
      .select('known_words, language, current_level, level2_progress, level3_progress, last_session')
      .eq('user_id', uid)
      .eq('child_id', childId)
      .maybeSingle()

    // Level 1: letters stored with LETTER_ prefix in known_words
    const letters = new Set<string>()
    const legacySightWords = new Set<string>()
    for (const entry of (data?.known_words ?? [])) {
      if (entry.startsWith('LETTER_')) letters.add(entry.replace('LETTER_', ''))
      else legacySightWords.add(entry)
    }
    setExploredLetters(letters)

    // Level 2
    const cvc = new Set<string>(data?.level2_progress ?? [])
    setMasteredCvc(cvc)

    // Level 3: prefer new column, fall back to legacy known_words for existing users
    const l3Raw: string[] = data?.level3_progress ?? []
    const words = l3Raw.length > 0 ? new Set<string>(l3Raw) : legacySightWords
    setKnownWords(words)
    buildDeck(words)

    // One-time migration: write legacy sight words into level3_progress
    if (l3Raw.length === 0 && legacySightWords.size > 0) {
      supabase.from('little_readers_progress').upsert(
        { user_id: uid, child_id: childId, level3_progress: Array.from(legacySightWords) },
        { onConflict: 'user_id,child_id' }
      )
    }

    // Current level
    const lvRaw = data?.current_level
    const lv: 1|2|3 = (lvRaw === 1 || lvRaw === 2 || lvRaw === 3) ? lvRaw : 1
    setSelectedLevel(lv)

    // Show welcome back or level selector
    const hasProgress = letters.size > 0 || cvc.size > 0 || words.size > 0
    if (!data || !hasProgress) {
      setShowLevelSelector(true)
    } else {
      setWelcomeBack(true)
      setShowLevelSelector(false)
      // Resume at first unmastered CVC word
      const firstUnmastered = CVC_WORDS.findIndex(w => !cvc.has(w.word))
      if (firstUnmastered >= 0) setCvcIndex(firstUnmastered)
    }

    // Language
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

  async function saveProgress(overrides?: {
    level?: 1|2|3
    explored?: Set<string>
    cvc?: Set<string>
    words?: Set<string>
    lang?: LangKey
  }) {
    if (!userId || !child) return
    const l1 = overrides?.explored ?? exploredLetters
    const l2 = overrides?.cvc ?? masteredCvc
    const l3 = overrides?.words ?? knownWords
    const lv = overrides?.level ?? selectedLevel
    const lang = overrides?.lang ?? selectedLang
    await supabase.from('little_readers_progress').upsert({
      user_id: userId, child_id: child.id,
      known_words: Array.from(l1).map(l => `LETTER_${l}`),
      language: lang,
      current_level: lv,
      level2_progress: Array.from(l2),
      level3_progress: Array.from(l3),
      last_session: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,child_id' })
  }

  function speakCard(entry: AnimalEntry, lang: LangKey) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    speechSynthesis.cancel()
    speakTimers.current.forEach(t => clearTimeout(t))
    speakTimers.current = []

    const bcp = LANG_BCP47[lang]
    const say = (text: string, delay: number) => {
      const t = setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text)
        u.lang = bcp
        u.rate = 0.85
        u.pitch = 1.2
        speechSynthesis.speak(u)
      }, delay)
      speakTimers.current.push(t)
    }

    // Say the letter name, then the animal name in the selected language.
    // Passing a single uppercase letter to en-US (not en-GB) avoids "capital A".
    say(entry.letter, 0)
    say(entry.animal, 750)
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
      saveProgress({ explored: newExplored })
    }
  }

  function clearCvcTimers() {
    speechSynthesis.cancel()
    cvcTimers.current.forEach(t => clearTimeout(t))
    cvcTimers.current = []
    setSoundingOut(false)
    setHighlightLetter(-1)
  }

  function handleSoundOut() {
    if (soundingOut) return
    setSoundedOut(true)
    setSoundingOut(true)
    clearCvcTimers()
    setSoundingOut(true)
    const word = CVC_WORDS[cvcIndex]
    let delay = 0
    word.letters.forEach((letter, i) => {
      const t1 = setTimeout(() => setHighlightLetter(i), delay)
      cvcTimers.current.push(t1)
      const t2 = setTimeout(() => {
        const u = new SpeechSynthesisUtterance(letter)
        u.lang = LANG_BCP47[selectedLang]; u.rate = 0.7; u.pitch = 1.2
        speechSynthesis.speak(u)
      }, delay + 100)
      cvcTimers.current.push(t2)
      delay += 700
    })
    const t3 = setTimeout(() => {
      setHighlightLetter(-1)
      setSoundingOut(false)
      const u = new SpeechSynthesisUtterance(word.word)
      u.lang = LANG_BCP47[selectedLang]; u.rate = 0.85
      speechSynthesis.speak(u)
    }, delay + 300)
    cvcTimers.current.push(t3)
  }

  async function handleCvcKnowIt() {
    if (cvcSaving) return
    setCvcSaving(true)
    setCvcPop(true)
    setTimeout(() => setCvcPop(false), 500)
    const word = CVC_WORDS[cvcIndex]
    const newMastered = new Set(masteredCvc)
    newMastered.add(word.word)
    setMasteredCvc(newMastered)
    setSoundedOut(false)
    clearCvcTimers()
    const next = CVC_WORDS.findIndex((w, i) => i > cvcIndex && !newMastered.has(w.word))
    const first = next >= 0 ? next : CVC_WORDS.findIndex(w => !newMastered.has(w.word))
    if (first >= 0) setCvcIndex(first)
    await saveProgress({ cvc: newMastered })
    setCvcSaving(false)
  }

  function navigateCvc(newIndex: number) {
    clearCvcTimers()
    setSoundedOut(false)
    setCvcIndex(newIndex)
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
    await saveProgress({ words: newKnown })
    setSaving(false)
  }

  function handlePracticeMore() {
    if (!deck.length) return
    const [first, ...rest] = deck
    setDeck([...rest, first])
    setFlipped(false)
  }

  function handlePracticeAgain() {
    const newWords = new Set<string>()
    setKnownWords(newWords)
    setDeck([...SIGHT_WORDS])
    setWordsDone(false)
    setFlipped(false)
    saveProgress({ words: newWords })
  }

  async function selectChild(c: Child) {
    setChild(c)
    setLetterIndex(0)
    setCvcIndex(0)
    setFlipped(false)
    setSoundedOut(false)
    setWelcomeBack(false)
    setWelcomeDismissed(false)
    clearCvcTimers()
    if (userId) await loadProgress(userId, c.id, c.language_learning)
    else { buildDeck(new Set()); setExploredLetters(new Set()); setMasteredCvc(new Set()); setShowLevelSelector(true) }
  }

  async function selectLevel(lv: 1|2|3) {
    setSelectedLevel(lv)
    setShowLevelSelector(false)
    await saveProgress({ level: lv })
  }

  const btn = (id: string, base: React.CSSProperties, hov: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hov : {}), transition: 'all 0.15s ease', cursor: 'pointer',
  })

  const animalData = LETTER_ANIMALS_ALL[selectedLang]
  const currentLetter = animalData[letterIndex]
  const currentCvc = CVC_WORDS[cvcIndex]
  const l1Complete = exploredLetters.size === 26
  const l2Complete = masteredCvc.size === CVC_WORDS.length

  const welcomeMsg = selectedLevel === 1
    ? `You've explored ${exploredLetters.size} letter${exploredLetters.size !== 1 ? 's' : ''} so far!`
    : selectedLevel === 2
    ? `You know ${masteredCvc.size} word${masteredCvc.size !== 1 ? 's' : ''} so far!`
    : `You know ${knownWords.size} word${knownWords.size !== 1 ? 's' : ''} so far!`

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
        @keyframes cardBounce { 0%{transform:scale(1) rotate(0)} 20%{transform:scale(1.13) rotate(-5deg)} 45%{transform:scale(1.13) rotate(5deg)} 65%{transform:scale(1.07) rotate(-2deg)} 82%{transform:scale(1.04) rotate(1deg)} 100%{transform:scale(1) rotate(0)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes starPulse { 0%{transform:scale(1)} 40%{transform:scale(1.5)} 100%{transform:scale(1)} }
        @keyframes celebrate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tapPulse { 0%,100%{transform:translateY(0) scale(1);opacity:1} 50%{transform:translateY(-4px) scale(1.2);opacity:0.7} }
        .letter-card { -webkit-tap-highlight-color: transparent; }
        .letter-card:active { transform: scale(0.96) !important; transition: transform 0.08s !important; }
        .lr-btn { -webkit-tap-highlight-color: transparent; }
        .lr-btn:active { opacity: 0.75 !important; transform: scale(0.97) !important; transition: all 0.08s !important; }
      `}</style>

      {/* Nav */}
      <div style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => { if (!child || showLevelSelector) router.push('/dashboard'); else setShowLevelSelector(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, fontSize: 20, lineHeight: 1, padding: 0 }}>←</button>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 17, fontWeight: 700, color: TEXT }}>📖 Little Readers</span>
          {child && <span style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600 }}>· {child.name}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {child && (
            selectedLevel === 1 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: ORANGE_BG, border: `1.5px solid ${ORANGE_BORDER}`, borderRadius: 100, padding: '6px 14px' }}>
                <span style={{ fontSize: 15 }}>🐾</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#C17A00' }}>{exploredLetters.size}/26</span>
              </div>
            ) : selectedLevel === 2 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: BLUE_BG, border: `1.5px solid ${BLUE_BORDER}`, borderRadius: 100, padding: '6px 14px', animation: cvcPop ? 'starPulse 0.45s ease' : 'none' }}>
                <span style={{ fontSize: 15 }}>📖</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: BLUE }}>{masteredCvc.size}/{CVC_WORDS.length}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: ORANGE_BG, border: `1.5px solid ${ORANGE_BORDER}`, borderRadius: 100, padding: '6px 14px', animation: starPop ? 'starPulse 0.45s ease' : 'none' }}>
                <span style={{ fontSize: 15 }}>⭐</span>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#C17A00' }}>{knownWords.size}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Child selector strip */}
      {children.length > 1 && (
        <div style={{ background: BEIGE_CARD, borderBottom: `1px solid ${BEIGE_BORDER}`, padding: '10px 20px', overflowX: 'auto' as const }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 'max-content' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', flexShrink: 0 }}>Reading:</span>
            {children.map(c => (
              <button key={c.id} onClick={() => selectChild(c)}
                onMouseEnter={() => setHover(`sel-${c.id}`)} onMouseLeave={() => setHover(null)}
                style={btn(`sel-${c.id}`, {
                  padding: '6px 14px', borderRadius: 100, fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                  border: `2px solid ${child?.id === c.id ? PRIMARY : BEIGE_BORDER}`,
                  background: child?.id === c.id ? PRIMARY_BG : BEIGE_CARD,
                  color: child?.id === c.id ? PRIMARY : TEXT_MUTED,
                  whiteSpace: 'nowrap' as const,
                }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No child */}
      {!child && (
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📖</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: TEXT, marginBottom: 8 }}>Who is reading today?</h2>
          {children.length === 0 ? (
            <p style={{ color: TEXT_MUTED, fontSize: 15 }}>No children found.{' '}
              <button onClick={() => router.push('/dashboard/children')} style={{ background: 'none', border: 'none', color: PRIMARY, fontWeight: 700, cursor: 'pointer', fontSize: 15, padding: 0 }}>Add a child →</button>
            </p>
          ) : (
            <p style={{ color: TEXT_MUTED, fontSize: 15 }}>Select a child above to begin.</p>
          )}
        </div>
      )}

      {/* ── Level Selector ── */}
      {child && showLevelSelector && (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 22 : 26, color: TEXT, marginBottom: 6 }}>Choose a level</h2>
          <p style={{ color: TEXT_MUTED, fontSize: 14, marginBottom: 28 }}>Pick the right level for {child.name}. You can switch anytime.</p>

          {([
            { lv: 1 as const, emoji: '🐾', title: 'Letter Animals', subtitle: 'Level 1 · Beginner', desc: 'Learn the alphabet A–Z with animals and sounds', color: ORANGE, bg: ORANGE_BG, border: ORANGE_BORDER, pct: exploredLetters.size / 26, progress: `${exploredLetters.size}/26 letters explored` },
            { lv: 2 as const, emoji: '📖', title: 'Word Sounds',    subtitle: 'Level 2 · Early Reader', desc: 'Sound out simple 3-letter words like cat, dog, sun', color: BLUE, bg: BLUE_BG, border: BLUE_BORDER, pct: masteredCvc.size / CVC_WORDS.length, progress: `${masteredCvc.size}/${CVC_WORDS.length} words mastered` },
            { lv: 3 as const, emoji: '✨', title: 'Sight Words',    subtitle: 'Level 3 · Reader', desc: 'Master the most common reading words with flashcards', color: PRIMARY, bg: PRIMARY_BG, border: PRIMARY_BORDER, pct: knownWords.size / SIGHT_WORDS.length, progress: `${knownWords.size}/${SIGHT_WORDS.length} words learned` },
          ]).map(l => (
            <button key={l.lv} onClick={() => selectLevel(l.lv)}
              onMouseEnter={() => setHover(`lvl-${l.lv}`)} onMouseLeave={() => setHover(null)}
              style={{ width: '100%', marginBottom: 14, padding: isMobile ? 18 : 22, borderRadius: 20, border: `2px solid ${hover === `lvl-${l.lv}` ? l.color : BEIGE_BORDER}`, background: hover === `lvl-${l.lv}` ? l.bg : BEIGE_CARD, textAlign: 'left' as const, cursor: 'pointer', fontFamily: 'inherit', boxShadow: hover === `lvl-${l.lv}` ? `0 4px 20px ${l.color}22` : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{l.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: l.color, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2 }}>{l.subtitle}</div>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: TEXT }}>{l.title}</div>
                </div>
                {l.pct === 1 && <span style={{ fontSize: 20 }}>✅</span>}
              </div>
              <p style={{ color: TEXT_MUTED, fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>{l.desc}</p>
              {l.pct > 0 && (
                <>
                  <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 6, overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ height: '100%', background: l.color, borderRadius: 100, width: `${Math.round(l.pct * 100)}%`, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED }}>{l.progress}</div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Active level content ── */}
      {child && !showLevelSelector && (
        <>
          {/* Welcome back banner */}
          {welcomeBack && !welcomeDismissed && (
            <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG}, ${GREEN_BG})`, borderBottom: `1px solid ${PRIMARY_BORDER}`, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'slideDown 0.3s ease' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
                👋 Welcome back, {child.name}! {welcomeMsg}
              </span>
              <button onClick={() => setWelcomeDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, fontSize: 20, padding: '0 4px', lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* ─── Level 1: Letter Animals ─── */}
          {selectedLevel === 1 && (
            <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '40px 24px 64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ background: ORANGE_BG, color: ORANGE, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1.5px solid ${ORANGE_BORDER}`, whiteSpace: 'nowrap' as const }}>Level 1 · Beginner</div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: 0 }}>🐾 Letter Animals</h2>
              </div>

              {/* Completion banner */}
              {l1Complete && (
                <div style={{ background: `linear-gradient(135deg, ${ORANGE_BG}, #FFF0D6)`, borderRadius: 20, border: `2px solid ${ORANGE_BORDER}`, padding: '20px 24px', marginBottom: 24, textAlign: 'center' as const }}>
                  <div style={{ fontSize: 36, marginBottom: 8, display: 'inline-block', animation: 'celebrate 1.2s ease infinite' }}>🎉</div>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 6 }}>All 26 letters explored!</div>
                  <p style={{ color: TEXT_MUTED, fontSize: 13, marginBottom: 16 }}>Ready to sound out words?</p>
                  <button onClick={() => selectLevel(2)} style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: BLUE, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Try Level 2: Word Sounds →
                  </button>
                </div>
              )}

              {/* Language picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Language:</span>
                {(['EN', 'SV', 'ES', 'FR', 'DE'] as LangKey[]).map(lang => {
                  const active = selectedLang === lang
                  return (
                    <button key={lang} onClick={() => { setSelectedLang(lang); saveProgress({ lang }) }}
                      style={{ padding: '5px 11px', borderRadius: 100, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, border: `2px solid ${active ? PRIMARY : BEIGE_BORDER}`, background: active ? PRIMARY : BEIGE_CARD, color: active ? 'white' : TEXT_MUTED, cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: active ? `0 2px 8px ${PRIMARY}55` : 'none' }}>
                      {LANG_FLAGS[lang]} {lang}
                    </button>
                  )
                })}
              </div>

              {/* Card + arrows */}
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
                <button onClick={() => setLetterIndex(i => Math.max(0, i - 1))} disabled={letterIndex === 0}
                  onMouseEnter={() => setHover('prev')} onMouseLeave={() => setHover(null)}
                  style={btn('prev', { width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 18, fontWeight: 700, color: letterIndex === 0 ? BEIGE_BORDER : TEXT_MUTED, fontFamily: 'inherit', flexShrink: 0, cursor: letterIndex === 0 ? 'default' : 'pointer' }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>‹</button>

                <div key={selectedLang} className="letter-card" onClick={handleLetterTap}
                  style={{ flex: 1, background: exploredLetters.has(currentLetter.letter) ? PRIMARY_BG : BEIGE_CARD, borderRadius: 28, border: `2px solid ${exploredLetters.has(currentLetter.letter) ? PRIMARY_BORDER : BEIGE_BORDER}`, boxShadow: exploredLetters.has(currentLetter.letter) ? '0 8px 32px rgba(155,142,196,0.18)' : '0 4px 18px rgba(0,0,0,0.07)', padding: isMobile ? '28px 16px' : '36px 24px', textAlign: 'center' as const, cursor: 'pointer', userSelect: 'none' as const, WebkitUserSelect: 'none' as const, animation: letterBouncing ? 'cardBounce 0.65s ease' : 'none', transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 72 : 96, fontWeight: 700, color: PRIMARY, lineHeight: 1, marginBottom: 8 }}>{currentLetter.letter}</div>
                  <div style={{ fontSize: isMobile ? 52 : 68, lineHeight: 1, marginBottom: 12 }}>{currentLetter.emoji}</div>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 18, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: '0.04em' }}>{currentLetter.animal.toUpperCase()}</div>
                  <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: ORANGE }}>{currentLetter.sound}</div>
                  {!exploredLetters.has(currentLetter.letter) && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 22, animation: 'tapPulse 1.5s ease infinite', display: 'inline-block' }}>👆</span>
                      <span style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Tap to hear!</span>
                    </div>
                  )}
                </div>

                <button onClick={() => setLetterIndex(i => Math.min(25, i + 1))} disabled={letterIndex === 25}
                  onMouseEnter={() => setHover('next')} onMouseLeave={() => setHover(null)}
                  style={btn('next', { width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 18, fontWeight: 700, color: letterIndex === 25 ? BEIGE_BORDER : TEXT_MUTED, fontFamily: 'inherit', flexShrink: 0, cursor: letterIndex === 25 ? 'default' : 'pointer' }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>›</button>
              </div>

              {/* Alphabet dot grid */}
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 24, justifyContent: 'center' }}>
                {animalData.map((la, i) => (
                  <button key={la.letter} onClick={() => setLetterIndex(i)}
                    style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${i === letterIndex ? PRIMARY : exploredLetters.has(la.letter) ? PRIMARY_BORDER : BEIGE_BORDER}`, background: i === letterIndex ? PRIMARY : exploredLetters.has(la.letter) ? PRIMARY_BG : BEIGE_CARD, color: i === letterIndex ? 'white' : exploredLetters.has(la.letter) ? PRIMARY : TEXT_MUTED, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}>
                    {la.letter}
                  </button>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Letters explored</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE }}>{exploredLetters.size} / 26</span>
                </div>
                <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: `linear-gradient(90deg, ${ORANGE}, #F5C842)`, borderRadius: 100, width: `${(exploredLetters.size / 26) * 100}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          )}

          {/* ─── Level 2: CVC Words ─── */}
          {selectedLevel === 2 && (
            <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '40px 24px 64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ background: BLUE_BG, color: BLUE, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1.5px solid ${BLUE_BORDER}`, whiteSpace: 'nowrap' as const }}>Level 2 · Early Reader</div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: 0 }}>📖 Word Sounds</h2>
              </div>

              {l2Complete ? (
                <div style={{ background: `linear-gradient(135deg, ${BLUE_BG}, ${GREEN_BG})`, borderRadius: 28, border: `2px solid ${BLUE_BORDER}`, padding: isMobile ? '32px 20px' : '44px 40px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: 64, marginBottom: 12, animation: 'celebrate 1.2s ease infinite', display: 'inline-block' }}>🎉</div>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 24 : 32, color: TEXT, marginBottom: 8 }}>Amazing work!</h3>
                  <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 20 }}>{child.name} has mastered all {CVC_WORDS.length} words!</p>
                  <button onClick={() => selectLevel(3)}
                    onMouseEnter={() => setHover('l3')} onMouseLeave={() => setHover(null)}
                    style={btn('l3', { padding: '13px 28px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
                    Try Level 3: Sight Words →
                  </button>
                  <br />
                  <button onClick={() => { const e = new Set<string>(); setMasteredCvc(e); setCvcIndex(0); setSoundedOut(false); saveProgress({ cvc: e }) }}
                    style={{ background: 'none', border: 'none', color: TEXT_MUTED, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginTop: 12 }}>
                    🔄 Practice again
                  </button>
                </div>
              ) : (
                <>
                  {/* Progress */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Progress</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: BLUE }}>{masteredCvc.size} / {CVC_WORDS.length} words mastered</span>
                    </div>
                    <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: `linear-gradient(90deg, ${BLUE}, ${GREEN_DARK})`, borderRadius: 100, width: `${(masteredCvc.size / CVC_WORDS.length) * 100}%`, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>

                  {/* Card + arrows */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20, marginBottom: 20 }}>
                    <button onClick={() => navigateCvc(Math.max(0, cvcIndex - 1))} disabled={cvcIndex === 0}
                      style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 18, fontWeight: 700, color: cvcIndex === 0 ? BEIGE_BORDER : TEXT_MUTED, fontFamily: 'inherit', flexShrink: 0, cursor: cvcIndex === 0 ? 'default' : 'pointer', transition: 'all 0.15s' }}>‹</button>

                    <div style={{ flex: 1, background: masteredCvc.has(currentCvc.word) ? GREEN_BG : BEIGE_CARD, borderRadius: 28, border: `2px solid ${masteredCvc.has(currentCvc.word) ? '#A8D5BA' : BEIGE_BORDER}`, boxShadow: '0 4px 18px rgba(0,0,0,0.07)', padding: isMobile ? '28px 16px' : '36px 24px', textAlign: 'center' as const, transition: 'all 0.2s ease' }}>
                      {masteredCvc.has(currentCvc.word) && (
                        <div style={{ fontSize: 13, fontWeight: 700, color: GREEN_DARK, marginBottom: 8 }}>⭐ Mastered!</div>
                      )}
                      <div style={{ fontSize: isMobile ? 56 : 72, lineHeight: 1, marginBottom: 16 }}>{currentCvc.emoji}</div>

                      {/* Letter boxes */}
                      <div style={{ display: 'flex', gap: isMobile ? 8 : 12, justifyContent: 'center', marginBottom: 16 }}>
                        {currentCvc.letters.map((letter, i) => (
                          <div key={i} style={{ width: isMobile ? 54 : 66, height: isMobile ? 62 : 74, borderRadius: 14, background: highlightLetter === i ? PRIMARY : masteredCvc.has(currentCvc.word) ? GREEN_BG : BEIGE, border: `3px solid ${highlightLetter === i ? PRIMARY : masteredCvc.has(currentCvc.word) ? '#A8D5BA' : BEIGE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontSize: isMobile ? 34 : 42, fontWeight: 700, color: highlightLetter === i ? 'white' : TEXT, transition: 'all 0.15s ease', transform: highlightLetter === i ? 'scale(1.18)' : 'scale(1)' }}>
                            {letter.toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 28 : 36, fontWeight: 700, color: PRIMARY, letterSpacing: '0.06em' }}>
                        {currentCvc.word.toUpperCase()}
                      </div>
                    </div>

                    <button onClick={() => navigateCvc(Math.min(CVC_WORDS.length - 1, cvcIndex + 1))} disabled={cvcIndex === CVC_WORDS.length - 1}
                      style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 18, fontWeight: 700, color: cvcIndex === CVC_WORDS.length - 1 ? BEIGE_BORDER : TEXT_MUTED, fontFamily: 'inherit', flexShrink: 0, cursor: cvcIndex === CVC_WORDS.length - 1 ? 'default' : 'pointer', transition: 'all 0.15s' }}>›</button>
                  </div>

                  {/* Action buttons */}
                  {!masteredCvc.has(currentCvc.word) ? (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="lr-btn" onClick={handleSoundOut} disabled={soundingOut}
                        onMouseEnter={() => setHover('sound')} onMouseLeave={() => setHover(null)}
                        style={btn('sound', { flex: 1, padding: isMobile ? '14px 8px' : '16px 12px', minHeight: 48, borderRadius: 16, border: `2px solid ${BLUE_BORDER}`, background: BLUE_BG, color: BLUE, fontSize: isMobile ? 13 : 15, fontWeight: 700, fontFamily: 'inherit', cursor: soundingOut ? 'not-allowed' : 'pointer', opacity: soundingOut ? 0.7 : 1, lineHeight: 1.3 }, { borderColor: BLUE, background: BLUE_BG })}>
                        🔊 Sound it out
                      </button>
                      {soundedOut && (
                        <button className="lr-btn" onClick={handleCvcKnowIt} disabled={cvcSaving}
                          onMouseEnter={() => setHover('cvcknow')} onMouseLeave={() => setHover(null)}
                          style={btn('cvcknow', { flex: 1, padding: isMobile ? '14px 8px' : '16px 12px', minHeight: 48, borderRadius: 16, border: 'none', background: GREEN_DARK, color: 'white', fontSize: isMobile ? 13 : 15, fontWeight: 700, fontFamily: 'inherit', cursor: cvcSaving ? 'not-allowed' : 'pointer', opacity: cvcSaving ? 0.7 : 1, lineHeight: 1.3, animation: 'fadeSlideUp 0.2s ease' }, { background: '#5A9E7A' })}>
                          ⭐ I've got it!
                        </button>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => navigateCvc((cvcIndex + 1) % CVC_WORDS.length)}
                      style={{ width: '100%', padding: isMobile ? '14px 8px' : '16px 12px', borderRadius: 16, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, color: TEXT_MUTED, fontSize: isMobile ? 13 : 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}>
                      Next word →
                    </button>
                  )}

                  {/* Word grid */}
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 24, justifyContent: 'center' }}>
                    {CVC_WORDS.map((w, i) => (
                      <button key={w.word} onClick={() => navigateCvc(i)}
                        style={{ padding: '4px 10px', borderRadius: 100, border: `2px solid ${i === cvcIndex ? BLUE : masteredCvc.has(w.word) ? '#A8D5BA' : BEIGE_BORDER}`, background: i === cvcIndex ? BLUE_BG : masteredCvc.has(w.word) ? GREEN_BG : BEIGE_CARD, color: i === cvcIndex ? BLUE : masteredCvc.has(w.word) ? GREEN_DARK : TEXT_MUTED, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                        {masteredCvc.has(w.word) ? '✓ ' : ''}{w.word}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── Level 3: Sight Words ─── */}
          {selectedLevel === 3 && (
            <div style={{ maxWidth: 520, margin: '0 auto', padding: isMobile ? '28px 16px 48px' : '40px 24px 64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ background: PRIMARY_BG, color: PRIMARY, padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1.5px solid ${PRIMARY_BORDER}`, whiteSpace: 'nowrap' as const }}>Level 3 · Reader</div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, margin: 0 }}>✨ Sight Words</h2>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{knownWords.size} / {SIGHT_WORDS.length} words learned</span>
                </div>
                <div style={{ background: BEIGE_BORDER, borderRadius: 100, height: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: `linear-gradient(90deg, ${PRIMARY}, ${GREEN})`, borderRadius: 100, width: `${(knownWords.size / SIGHT_WORDS.length) * 100}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>

              {wordsDone ? (
                <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG}, #EDF7F2)`, borderRadius: 28, border: `2px solid ${PRIMARY_BORDER}`, padding: isMobile ? '32px 20px' : '44px 40px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: 64, marginBottom: 12, animation: 'celebrate 1.2s ease infinite', display: 'inline-block' }}>🎉</div>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 24 : 32, color: TEXT, marginBottom: 8 }}>Amazing work!</h3>
                  <p style={{ color: TEXT_MUTED, fontSize: 15, marginBottom: 24 }}>{child.name} has learned all {SIGHT_WORDS.length} sight words!</p>
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

                  <div onClick={() => { if (!flipped) setFlipped(true) }}
                    style={{ background: BEIGE_CARD, borderRadius: 28, border: `2px solid ${flipped ? PRIMARY_BORDER : BEIGE_BORDER}`, boxShadow: flipped ? '0 12px 40px rgba(155,142,196,0.2)' : '0 4px 18px rgba(0,0,0,0.07)', padding: isMobile ? '40px 24px' : '52px 48px', textAlign: 'center' as const, cursor: flipped ? 'default' : 'pointer', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', minHeight: isMobile ? 240 : 300, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 16, userSelect: 'none' as const, WebkitUserSelect: 'none' as const }}>
                    {flipped && <div style={{ fontSize: isMobile ? 52 : 64, lineHeight: 1, animation: 'fadeSlideUp 0.2s ease' }}>{deck[0].emoji}</div>}
                    <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 72 : 96, fontWeight: 700, color: flipped ? PRIMARY : TEXT, lineHeight: 1, letterSpacing: '0.02em', transition: 'color 0.2s ease' }}>{deck[0].word}</div>
                    {flipped ? (
                      <p style={{ color: TEXT_MUTED, fontSize: isMobile ? 16 : 18, fontWeight: 600, lineHeight: 1.55, margin: 0, animation: 'fadeSlideUp 0.25s ease', maxWidth: 300 }}>{deck[0].sentence}</p>
                    ) : (
                      <p style={{ color: TEXT_MUTED, fontSize: 13, margin: 0, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>TAP TO REVEAL</p>
                    )}
                  </div>

                  {flipped && (
                    <div style={{ display: 'flex', gap: 12, marginTop: 16, animation: 'fadeSlideUp 0.2s ease' }}>
                      <button className="lr-btn" onClick={handlePracticeMore}
                        onMouseEnter={() => setHover('practice')} onMouseLeave={() => setHover(null)}
                        style={btn('practice', { flex: 1, padding: isMobile ? '14px 8px' : '16px 8px', minHeight: 48, borderRadius: 16, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, color: TEXT, fontSize: isMobile ? 13 : 15, fontWeight: 700, fontFamily: 'inherit', lineHeight: 1.3 }, { borderColor: PRIMARY_BORDER, background: PRIMARY_BG, color: PRIMARY })}>
                        🔄 Practice more
                      </button>
                      <button className="lr-btn" onClick={handleKnowIt} disabled={saving}
                        onMouseEnter={() => setHover('know')} onMouseLeave={() => setHover(null)}
                        style={btn('know', { flex: 1, padding: isMobile ? '14px 8px' : '16px 8px', minHeight: 48, borderRadius: 16, border: 'none', background: GREEN_DARK, color: 'white', fontSize: isMobile ? 13 : 15, fontWeight: 700, fontFamily: 'inherit', lineHeight: 1.3, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' as const : 'pointer' }, { background: '#5A9E7A' })}>
                        ⭐ I know it!
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
