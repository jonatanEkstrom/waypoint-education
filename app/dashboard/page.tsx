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
const GREEN_BORDER = '#D5F0E3'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

const LOADING_MESSAGES = [
  'Crafting your lesson plan...', 'Adding local discoveries...',
  'Tailoring for your child...', 'Almost ready...',
  'Polishing the details...', 'Just a moment more...'
]

function getTodayName() {
  const map: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' }
  return map[new Date().getDay()] || 'Monday'
}

function getWeekNumber() {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
}

function getWeekLabel(offset: number): string {
  const d = new Date()
  const dow = d.getDay() === 0 ? 7 : d.getDay() // Mon=1 … Sun=7
  d.setDate(d.getDate() - dow + 1 + offset * 7)  // move to that week's Monday
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getWeekDisplayLabel(offset: number): string {
  if (offset === 0) return 'This week'
  if (offset === 1) return 'Next week'
  if (offset === -1) return 'Last week'
  return `Week of ${getWeekLabel(offset)}`
}

export default function DashboardPage() {
  const [child, setChild] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [activeDay, setActiveDay] = useState(getTodayName())
  const [completed, setCompleted] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const [readingLesson, setReadingLesson] = useState<any>(null)
  const [readingId, setReadingId] = useState<string | null>(null)
  const [loadingReading, setLoadingReading] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({})
  const [quizSubmitted, setQuizSubmitted] = useState<string[]>([])
  const [lessonCache, setLessonCache] = useState<{[key: string]: any}>({})
  const [hover, setHover] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'plan' | 'language'>('plan')
  const [langPlan, setLangPlan] = useState<any>(null)
  const [langLoading, setLangLoading] = useState(false)
  const [langWeek, setLangWeek] = useState(1)
  const [langActiveDay, setLangActiveDay] = useState(getTodayName())
  const [langQuizAnswers, setLangQuizAnswers] = useState<{[key: number]: number}>({})
  const [langQuizSubmitted, setLangQuizSubmitted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [viewingWeekOffset, setViewingWeekOffset] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const router = useRouter()
  const msgInterval = useRef<any>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    console.log('[state] readingLesson:', readingLesson ? `SET — keys: ${Object.keys(readingLesson).join(', ')}` : 'null')
    console.log('[state] readingId:', readingId)
    console.log('[state] loading (early-return guard):', loading)
    console.log('[state] modal should show:', !!(readingLesson && readingId && !loading))
  }, [readingLesson, readingId, loading])

  useEffect(() => {
    async function fetchTrialStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, trial_started_at')
          .eq('id', user.id)
          .single()
        if (!profile || profile.subscription_status === 'active') return
        if (!profile.trial_started_at) return
        const daysSinceStart = Math.floor((Date.now() - new Date(profile.trial_started_at).getTime()) / (1000 * 60 * 60 * 24))
        setTrialDaysLeft(Math.max(0, 10 - daysSinceStart))
      } catch (e) {
        console.error('[Dashboard] Failed to fetch trial status:', e)
      }
    }
    fetchTrialStatus()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('activeChild')
    if (!stored) { router.push('/dashboard/children'); return }
    const childData = JSON.parse(stored)
    // Ensure language_learning has a value for older localStorage entries
    if (!childData.language_learning) childData.language_learning = 'None'
    console.log('[Dashboard] activeChild from localStorage:', {
      name: childData.name,
      language_learning: childData.language_learning,
      subjects: childData.subjects,
      age_group: childData.age_group,
    })
    setChild(childData)

    const cachedLessons = localStorage.getItem('cachedLessons')
    if (cachedLessons) setLessonCache(JSON.parse(cachedLessons))

    loadPlan(childData, cachedLessons)
  }, [])

  async function loadPlan(childData: any, cachedLessons: string | null, weekOffset: number = 0) {
    const weekNumber = getWeekNumber() + weekOffset
    const isCurrentWeek = weekOffset === 0

    const sortedSubjects = [...(childData.subjects || [])].sort().join(',')
    const localKey = `${childData.name}-${childData.city}-${childData.country}-${childData.language_learning || 'None'}-${sortedSubjects}-${weekNumber}`

    // For the current week, try localStorage first
    if (isCurrentWeek) {
      const cachedPlan = localStorage.getItem('cachedPlan')
      const cachedKey = localStorage.getItem('cachedPlanChild')

      if (cachedPlan && cachedKey === localKey) {
        console.log('[Dashboard] Serving plan from localStorage cache')
        setPlan(JSON.parse(cachedPlan))
        setLoading(false)
        prefetchLessons(JSON.parse(cachedPlan), childData, cachedLessons ? JSON.parse(cachedLessons) : {})
        void prefetchNextWeekPlan(childData)
        return
      }

      // Profile changed — wipe stale Supabase record then regenerate
      const profileChanged = !!cachedKey && cachedKey !== localKey
      if (profileChanged) {
        console.log('[Dashboard] Profile changed, busting Supabase cache')
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from('weekly_plans').delete()
              .eq('user_id', user.id).eq('child_name', childData.name).eq('week_number', weekNumber)
          }
        } catch (e) { console.error('Supabase cache error:', e) }
        localStorage.removeItem('cachedLessons')
        setLessonCache({})
        generatePlan(childData, localKey, weekNumber)
        return
      }
    }

    // Check Supabase (always for non-current weeks; fallback for current week)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('weekly_plans')
          .select('plan')
          .eq('user_id', user.id)
          .eq('child_name', childData.name)
          .eq('city', childData.city)
          .eq('country', childData.country)
          .eq('week_number', weekNumber)
          .single()

        if (data?.plan) {
          console.log('[Dashboard] Serving plan from Supabase cache (week offset', weekOffset, ')')
          setPlan(data.plan)
          if (isCurrentWeek) {
            localStorage.setItem('cachedPlan', JSON.stringify(data.plan))
            localStorage.setItem('cachedPlanChild', localKey)
            prefetchLessons(data.plan, childData, cachedLessons ? JSON.parse(cachedLessons) : {})
            void prefetchNextWeekPlan(childData)
          }
          setLoading(false)
          return
        }
      }
    } catch (e) {
      console.error('Supabase cache error:', e)
    }

    // Generate a new plan for this week
    if (isCurrentWeek) {
      localStorage.removeItem('cachedLessons')
      setLessonCache({})
    }
    generatePlan(childData, localKey, weekNumber)
  }

  async function navigateWeek(newOffset: number) {
    if (!child) return
    setViewingWeekOffset(newOffset)
    setPlan(null)
    setLoading(true)
    setCompleted([])
    setExpanded([])
    setReadingLesson(null)
    setReadingId(null)
    if (newOffset === 0) {
      const cached = localStorage.getItem('cachedLessons')
      const parsedCache = cached ? JSON.parse(cached) : {}
      setLessonCache(parsedCache)
      loadPlan(child, cached, 0)
    } else {
      setLessonCache({})
      loadPlan(child, null, newOffset)
    }
  }

  async function prefetchLessons(plan: any, childData: any, existingCache: any) {
    const allLessons: {id: string, lesson: any}[] = []
    plan.days.forEach((day: any) => {
      day.lessons.forEach((lesson: any, i: number) => {
        const id = `${day.day}-${i}`
        if (!existingCache[id]) allLessons.push({ id, lesson })
      })
    })
    if (allLessons.length === 0) return
    for (const { id, lesson } of allLessons) {
      try {
        const res = await fetch('/api/generate-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: lesson.subject, title: lesson.title, age_group: childData.age_group, city: childData.city, country: childData.country, curriculum: childData.curriculum, learn_style: childData.learn_style, language_learning: childData.language_learning, interests: childData.subjects, recent_topics: [], reading_level: childData.reading_level || '', focus_time: childData.focus_time || '' })
        })
        const data = await res.json()
        if (data.material) {
          setLessonCache(prev => {
            const updated = { ...prev, [id]: data.material }
            localStorage.setItem('cachedLessons', JSON.stringify(updated))
            return updated
          })
        }
      } catch (e) { console.error('Prefetch failed for', id, e) }
      await new Promise(r => setTimeout(r, 500))
    }
  }

  async function prefetchNextWeekPlan(childData: any) {
    const nextWeekNumber = getWeekNumber() + 1
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: existing } = await supabase
        .from('weekly_plans')
        .select('plan')
        .eq('user_id', user.id)
        .eq('child_name', childData.name)
        .eq('city', childData.city)
        .eq('country', childData.country)
        .eq('week_number', nextWeekNumber)
        .single()
      if (existing?.plan) return
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childData)
      })
      if (!res.ok || !res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }
      const cleaned = fullText.replace(/```json|```/g, '').trim()
      const p = JSON.parse(cleaned)
      await supabase.from('weekly_plans').upsert({
        user_id: user.id,
        child_name: childData.name,
        city: childData.city,
        country: childData.country,
        week_number: nextWeekNumber,
        plan: p
      }, { onConflict: 'user_id,child_name,city,country,week_number' })
      console.log('[Dashboard] Next week plan pre-generated silently')
    } catch (e) {
      console.error('[Dashboard] Background next-week prefetch failed:', e)
    }
  }

  async function generatePlan(childData: any, localKey: string, weekNumber: number) {
    setLoading(true)
    msgInterval.current = setInterval(() => {
      setLoadingMsg(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)
    try {
      // Always fetch fresh subjects and language from DB before generating
      let freshData = childData
      let freshKey = localKey
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && childData.id) {
          const { data: fresh } = await supabase
            .from('children')
            .select('subjects, language_learning, reading_level, focus_time')
            .eq('id', childData.id)
            .single()
          if (fresh) {
            freshData = { ...childData, subjects: fresh.subjects || [], language_learning: fresh.language_learning || 'None', reading_level: fresh.reading_level || '', focus_time: fresh.focus_time || '' }
            const freshSorted = [...(freshData.subjects as string[])].sort().join(',')
            freshKey = `${freshData.name}-${freshData.city}-${freshData.country}-${freshData.language_learning}-${freshSorted}-${weekNumber}`
            localStorage.setItem('activeChild', JSON.stringify({ ...freshData, user_id: user.id }))
            setChild(freshData)
            console.log('[Dashboard] Refreshed child data from DB:', { subjects: freshData.subjects, language_learning: freshData.language_learning })
          }
        }
      } catch (e) { console.error('[generatePlan] Failed to refresh child data:', e) }

      console.log('[Dashboard] Sending to /api/generate-plan:', {
        name: freshData.name,
        language_learning: freshData.language_learning,
        subjects: freshData.subjects,
      })
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(freshData)
      })
      if (!res.ok) throw new Error('Failed')
      if (!res.body) throw new Error('No body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }
      const cleaned = fullText.replace(/```json|```/g, '').trim()
      const p = JSON.parse(cleaned)
      setPlan(p)

      const isCurrentWeek = weekNumber === getWeekNumber()

      // Save to localStorage only for the current week
      if (isCurrentWeek) {
        localStorage.setItem('cachedPlan', JSON.stringify(p))
        localStorage.setItem('cachedPlanChild', freshKey)
        localStorage.setItem('cachedPlanTimestamp', Date.now().toString())
      }

      // Save to Supabase (always — future weeks need to be cached there)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('weekly_plans').upsert({
            user_id: user.id,
            child_name: freshData.name,
            city: freshData.city,
            country: freshData.country,
            week_number: weekNumber,
            plan: p
          }, { onConflict: 'user_id,child_name,city,country,week_number' })
        }
      } catch (e) { console.error('Supabase save error:', e) }

      // Prefetch lessons only for the current week (don't overwrite current week's lesson cache)
      if (isCurrentWeek) prefetchLessons(p, freshData, {})
      if (isCurrentWeek) void prefetchNextWeekPlan(freshData)
    } catch (e) { console.error(e) }
    finally {
      clearInterval(msgInterval.current)
      setLoading(false)
    }
  }

  async function loadLanguagePlan() {
    if (!child || !child.language_learning || child.language_learning === 'None') return
    const language = child.language_learning
    const calendarWeek = getWeekNumber()
    const langKey = `${child.name}-${language}-${calendarWeek}`

    // Check localStorage
    const cached = localStorage.getItem('cachedLangPlan')
    const cachedKey = localStorage.getItem('cachedLangPlanKey')
    if (cached && cachedKey === langKey) {
      console.log('[Language] Serving from localStorage cache')
      setLangPlan(JSON.parse(cached))
      return
    }

    setLangLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if this calendar week already has a plan
      const { data: existing } = await supabase
        .from('language_plans')
        .select('plan, language_week')
        .eq('user_id', user.id)
        .eq('child_name', child.name)
        .eq('language', language)
        .eq('calendar_week', calendarWeek)
        .single()

      if (existing?.plan) {
        console.log('[Language] Serving from Supabase cache, language_week:', existing.language_week)
        setLangPlan(existing.plan)
        setLangWeek(existing.language_week)
        localStorage.setItem('cachedLangPlan', JSON.stringify(existing.plan))
        localStorage.setItem('cachedLangPlanKey', langKey)
        setLangLoading(false)
        return
      }

      // Count previous plans to determine progressive week number
      const { count } = await supabase
        .from('language_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('child_name', child.name)
        .eq('language', language)

      const currentLangWeek = (count || 0) + 1
      setLangWeek(currentLangWeek)
      console.log('[Language] Generating week', currentLangWeek, 'for', language)

      // Fetch last 3 weeks of summaries for progressive context
      let previousSummary = ''
      if (currentLangWeek > 1) {
        const { data: prev } = await supabase
          .from('language_plans')
          .select('plan')
          .eq('user_id', user.id)
          .eq('child_name', child.name)
          .eq('language', language)
          .order('language_week', { ascending: false })
          .limit(3)
        if (prev?.length) {
          previousSummary = prev
            .map((p: any) => `Week ${p.plan.week_number} (${p.plan.week_theme}): ${p.plan.weekly_summary}`)
            .join('\n')
        }
      }

      generateLanguagePlan(language, currentLangWeek, previousSummary, user.id, calendarWeek, langKey)
    } catch (e) {
      console.error('Language plan load error:', e)
      setLangLoading(false)
    }
  }

  async function generateLanguagePlan(
    language: string, langWeekNum: number, previousSummary: string,
    userId: string, calendarWeek: number, langKey: string
  ) {
    try {
      const res = await fetch('/api/generate-language-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          age_group: child?.age_group,
          child_name: child?.name,
          language_week: langWeekNum,
          previous_summary: previousSummary,
        })
      })
      if (!res.ok || !res.body) throw new Error('Failed to generate language plan')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }

      const cleaned = fullText.replace(/```json|```/g, '').trim()
      const p = JSON.parse(cleaned)
      setLangPlan(p)
      setLangWeek(langWeekNum)

      localStorage.setItem('cachedLangPlan', JSON.stringify(p))
      localStorage.setItem('cachedLangPlanKey', langKey)

      // Save to Supabase language_plans table
      await supabase.from('language_plans').upsert({
        user_id: userId,
        child_name: child?.name,
        language,
        calendar_week: calendarWeek,
        language_week: langWeekNum,
        plan: p,
      }, { onConflict: 'user_id,child_name,language,calendar_week' })
    } catch (e) {
      console.error('Language plan generate error:', e)
    } finally {
      setLangLoading(false)
    }
  }

  async function fetchRecentTopics(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !child) return []
      const { data } = await supabase
        .from('lesson_history')
        .select('subject, topic')
        .eq('user_id', user.id)
        .eq('child_name', child.name)
        .order('created_at', { ascending: false })
        .limit(3)
      return data?.map((r: any) => `${r.subject}: ${r.topic}`) || []
    } catch { return [] }
  }

  async function saveLessonHistory(lesson: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !child) return
      await supabase.from('lesson_history').insert({
        user_id: user.id,
        child_name: child.name,
        subject: lesson.subject,
        topic: lesson.title,
      })
    } catch { /* non-critical */ }
  }

  async function loadReading(id: string, lesson: any) {
    if (lessonCache[id]) {
      console.log('[loadReading] Cache hit for', id)
      setReadingLesson(lessonCache[id])
      setReadingId(id)
      saveLessonHistory(lesson)
      return
    }
    if (loadingReading) return
    setLoadingReading(id)
    try {
      const recentTopics = await fetchRecentTopics()
      console.log('[loadReading] Fetching lesson for', id, lesson.title)
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: lesson.subject,
          title: lesson.title,
          age_group: child?.age_group,
          city: child?.city,
          country: child?.country,
          curriculum: child?.curriculum,
          learn_style: child?.learn_style,
          language_learning: child?.language_learning,
          interests: child?.subjects,
          recent_topics: recentTopics,
          reading_level: child?.reading_level || '',
          focus_time: child?.focus_time || '',
        })
      })
      console.log('[loadReading] API status:', res.status)
      if (!res.ok) {
        const errText = await res.text()
        console.error('[loadReading] Error response:', errText)
        return
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }
      fullText += decoder.decode()
      console.log('[loadReading] Streamed text length:', fullText.length, '| preview:', fullText.slice(0, 200))
      const cleaned = fullText.replace(/```json|```/g, '').trim()
      const material = JSON.parse(cleaned)
      console.log('[loadReading] material keys:', Object.keys(material))
      setReadingLesson(material)
      setReadingId(id)
      setLessonCache(prev => {
        const updated = { ...prev, [id]: material }
        localStorage.setItem('cachedLessons', JSON.stringify(updated))
        return updated
      })
      saveLessonHistory(lesson)
    } catch (e) { console.error('[loadReading] Exception:', e) }
    finally { setLoadingReading(null) }
  }

  async function submitFeedback() {
    if (!feedbackRating) return
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: feedbackRating, message: feedbackMsg, page: 'dashboard' })
      })
      setFeedbackSent(true)
      setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackRating(0); setFeedbackMsg('') }, 2000)
    } catch (e) { console.error(e) }
  }

  function toggleExpand(id: string) {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleComplete(id: string) {
    setCompleted(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/auth')
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const totalLessons = plan ? plan.days.reduce((acc: number, d: any) => acc + d.lessons.length, 0) : 0
  const activeDay_ = plan?.days?.find((d: any) => d.day === activeDay)

  const subjectColors: any = {
    'Math': { bg: '#FFF0F5', text: '#C4748E', border: '#F5C6D5' },
    'Science': { bg: GREEN_BG, text: GREEN_DARK, border: GREEN_BORDER },
    'Language Arts': { bg: '#FFF8EC', text: '#C49040', border: '#F5DFA0' },
    'History': { bg: PRIMARY_BG, text: PRIMARY_DARK, border: PRIMARY_BORDER },
    'Geography': { bg: '#F0F5FF', text: '#6080C4', border: '#C6D5F5' },
    'Art': { bg: '#FFF0F5', text: '#C4748E', border: '#F5C6D5' },
    'Music': { bg: '#FFF8EC', text: '#C49040', border: '#F5DFA0' },
    'Physical Education': { bg: GREEN_BG, text: GREEN_DARK, border: GREEN_BORDER },
    'Coding': { bg: '#F0F5FF', text: '#6080C4', border: '#C6D5F5' },
    'Life Skills': { bg: PRIMARY_BG, text: PRIMARY_DARK, border: PRIMARY_BORDER },
  }

  const btn = (id: string, base: React.CSSProperties, hoverStyle: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hoverStyle : {}), transition: 'all 0.15s ease', cursor: 'pointer'
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }`}</style>
      <div style={{ width: 64, height: 64, border: `5px solid ${PRIMARY_BORDER}`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: TEXT, margin: '0 0 8px 0' }}>Creating your week plan...</h2>
        <p style={{ color: TEXT_MUTED, fontSize: 15, margin: '0 0 4px 0', animation: 'pulse 2.5s ease infinite' }}>{LOADING_MESSAGES[loadingMsg]}</p>
        <p style={{ color: BEIGE_BORDER, fontSize: 13, margin: 0 }}>Crafting lessons for {child?.name} in {child?.city} ✨</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: BEIGE }}>
      <style>{`
        @media print { .no-print { display: none !important; } .lesson-card { page-break-inside: avoid; break-inside: avoid; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .day-btn { transition: all 0.15s ease; cursor: pointer; }
        .day-btn:not(.active):hover { border-color: ${PRIMARY} !important; color: ${PRIMARY} !important; background: ${PRIMARY_BG} !important; }
        .lesson-card { transition: box-shadow 0.15s ease, border-color 0.15s ease; }
        .tap-btn { -webkit-tap-highlight-color: transparent; }
        .tap-btn:active { opacity: 0.8 !important; transform: scale(0.98) !important; transition: all 0.08s !important; }
      `}</style>

      {showFeedback && (
        <div style={{ position: 'fixed', bottom: 80, right: 24, zIndex: 999, background: BEIGE_CARD, borderRadius: 20, padding: 24, width: 300, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>How are we doing? 💬</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setFeedbackRating(n)}
                style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `2px solid ${feedbackRating === n ? PRIMARY : BEIGE_BORDER}`, background: feedbackRating === n ? PRIMARY_BG : BEIGE_CARD, fontSize: 20, cursor: 'pointer', transition: 'all 0.15s' }}>
                {['😞','😕','😐','😊','🤩'][n-1]}
              </button>
            ))}
          </div>
          <textarea value={feedbackMsg} onChange={e => setFeedbackMsg(e.target.value)}
            placeholder="Tell us what you think..."
            rows={3}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'none' as const, boxSizing: 'border-box' as const, color: TEXT }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => setShowFeedback(false)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: TEXT_MUTED }}>
              Cancel
            </button>
            <button onClick={submitFeedback} disabled={!feedbackRating || feedbackSent}
              style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: feedbackSent ? GREEN : PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: !feedbackRating ? 0.4 : 1, transition: 'all 0.15s' }}>
              {feedbackSent ? '✓ Sent!' : 'Send feedback'}
            </button>
          </div>
        </div>
      )}

      <button onClick={() => { setShowFeedback(p => !p); setFeedbackSent(false); setFeedbackRating(0); setFeedbackMsg('') }}
        onMouseEnter={() => setHover('feedback')} onMouseLeave={() => setHover(null)}
        style={btn('feedback', { position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: PRIMARY, color: 'white', border: 'none', borderRadius: 100, padding: '12px 20px', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(155,142,196,0.4)' }, { background: PRIMARY_DARK })}>
        💬 Feedback
      </button>

      {readingLesson && readingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div style={{ background: BEIGE_CARD, borderRadius: 24, padding: isMobile ? 20 : 32, maxWidth: 720, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', animation: 'fadeIn 0.2s ease', border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
            <button onClick={() => { setReadingLesson(null); setReadingId(null); setQuizAnswers({}); setQuizSubmitted([]) }}
              onMouseEnter={() => setHover('close')} onMouseLeave={() => setHover(null)}
              style={btn('close', { position: 'absolute', top: 16, right: 16, background: BEIGE, border: `2px solid ${BEIGE_BORDER}`, borderRadius: '50%', width: 36, height: 36, fontSize: 16, color: TEXT_MUTED }, { background: BEIGE_BORDER })}>✕</button>

            <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>📖 Read & Learn</div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, marginBottom: 24, paddingRight: 40 }}>{readingLesson.reading_title}</h2>

            {/* ── NEW FORMAT ── */}

            {/* Introduction */}
            {readingLesson.introduction && (
              <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>🎯 Introduction</div>
                <p style={{ fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.75 }}>{readingLesson.introduction}</p>
              </div>
            )}

            {/* Story / Context */}
            {readingLesson.story && (
              <div style={{ background: GREEN_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${GREEN_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>📍 Story &amp; Context</div>
                <p style={{ fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.75, fontStyle: 'italic' }}>{readingLesson.story}</p>
              </div>
            )}

            {/* Main Content */}
            {readingLesson.main_content && (
              <div style={{ background: BEIGE, borderRadius: 14, padding: 20, marginBottom: 16, border: `2px solid ${BEIGE_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 12 }}>📚 The Lesson</div>
                {readingLesson.main_content.split('\n\n').map((para: string, i: number) => (
                  <p key={i} style={{ fontSize: 15, color: TEXT, lineHeight: 1.8, margin: '0 0 10px 0' }}>{para}</p>
                ))}
              </div>
            )}

            {/* Activity — new format (object) */}
            {readingLesson.activity && typeof readingLesson.activity === 'object' && (
              <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>🏃 Activity — {readingLesson.activity.title}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 12 }}>
                  {readingLesson.activity.time && (
                    <span style={{ padding: '3px 10px', borderRadius: 100, background: PRIMARY, color: 'white', fontSize: 11, fontWeight: 700 }}>⏱ {readingLesson.activity.time}</span>
                  )}
                  {readingLesson.activity.materials && (
                    <span style={{ padding: '3px 10px', borderRadius: 100, background: GREEN_BG, color: GREEN_DARK, fontSize: 11, fontWeight: 700, border: `1px solid ${GREEN_BORDER}` }}>🧰 {readingLesson.activity.materials}</span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{readingLesson.activity.description}</p>
              </div>
            )}

            {/* Discussion Questions */}
            {readingLesson.discussion_questions?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>💬 Discuss Together</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {readingLesson.discussion_questions.map((q: string, i: number) => (
                    <div key={i} style={{ background: BEIGE_CARD, borderRadius: 12, padding: '12px 16px', border: `2px solid ${BEIGE_BORDER}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ background: PRIMARY_BG, color: PRIMARY, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fun Fact — new field */}
            {readingLesson.fun_fact && (
              <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 16, border: '2px solid #FDE68A' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>⚡ Fun Fact</div>
                <p style={{ fontSize: 15, color: '#92400E', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>{readingLesson.fun_fact}</p>
              </div>
            )}

            {/* Rhyme — ages 4-6 */}
            {readingLesson.rhyme && (
              <div style={{ background: `linear-gradient(135deg, ${PRIMARY_BG}, #E8F5F0)`, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}`, textAlign: 'center' as const }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>🎵 Remember It!</div>
                <p style={{ fontSize: 16, color: TEXT, margin: 0, lineHeight: 2, fontStyle: 'italic', fontFamily: 'Georgia,serif' }}>{readingLesson.rhyme}</p>
              </div>
            )}

            {/* Perspectives — ages 10+ */}
            {readingLesson.perspectives && typeof readingLesson.perspectives === 'string' && (
              <div style={{ background: '#F0F5FF', borderRadius: 14, padding: 18, marginBottom: 16, border: '2px solid #C6D5F5' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6080C4', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>⚖️ Different Perspectives</div>
                {readingLesson.perspectives.split('\n').filter(Boolean).map((line: string, i: number) => (
                  <p key={i} style={{ fontSize: 14, color: TEXT, margin: '0 0 8px 0', lineHeight: 1.7 }}>{line}</p>
                ))}
              </div>
            )}

            {/* Vocabulary — ages 10+ */}
            {Array.isArray(readingLesson.vocabulary) && readingLesson.vocabulary.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>📖 Key Vocabulary</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {readingLesson.vocabulary.map((v: any, i: number) => (
                    <div key={i} style={{ background: BEIGE_CARD, borderRadius: 12, padding: '12px 16px', border: `2px solid ${BEIGE_BORDER}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ background: PRIMARY, color: 'white', borderRadius: 8, padding: '2px 10px', fontSize: 12, fontWeight: 800, flexShrink: 0, whiteSpace: 'nowrap' as const }}>{v.word}</span>
                      <p style={{ fontSize: 14, color: TEXT_MUTED, margin: 0, lineHeight: 1.6 }}>{v.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research prompt — ages 10-12 */}
            {readingLesson.research_prompt && (
              <div style={{ background: GREEN_BG, borderRadius: 14, padding: 16, marginBottom: 16, border: `2px solid ${GREEN_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>🔍 Go Deeper — Research Challenge</div>
                <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{readingLesson.research_prompt}</p>
              </div>
            )}

            {/* Essay prompt — ages 13+ */}
            {readingLesson.essay_prompt && typeof readingLesson.essay_prompt === 'string' && (
              <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>✍️ Essay Task</div>
                {readingLesson.essay_prompt.split('\n').filter(Boolean).map((line: string, i: number) => (
                  <p key={i} style={{ fontSize: 14, color: TEXT, margin: '0 0 8px 0', lineHeight: 1.7 }}>{line}</p>
                ))}
              </div>
            )}

            {/* Socratic questions — ages 13+ */}
            {Array.isArray(readingLesson.socratic_questions) && readingLesson.socratic_questions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>🤔 Questions Worth Sitting With</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {readingLesson.socratic_questions.map((q: string, i: number) => (
                    <div key={i} style={{ background: '#F0F5FF', borderRadius: 12, padding: '12px 16px', border: '2px solid #C6D5F5', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ background: '#6080C4', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>?</span>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Further reading — ages 13+ */}
            {Array.isArray(readingLesson.further_reading) && readingLesson.further_reading.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>📚 Explore Further</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {readingLesson.further_reading.map((item: string, i: number) => (
                    <div key={i} style={{ background: BEIGE, borderRadius: 12, padding: '10px 14px', border: `1px solid ${BEIGE_BORDER}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{i === 0 ? '📗' : i === 1 ? '🎬' : '🌐'}</span>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── OLD FORMAT fallbacks ── */}

            {/* Old reading_text */}
            {!readingLesson.main_content && readingLesson.reading_text && (
              <div style={{ background: BEIGE, borderRadius: 14, padding: 20, marginBottom: 16, border: `2px solid ${BEIGE_BORDER}` }}>
                {readingLesson.reading_text.split('\n\n').map((para: string, i: number) => (
                  <p key={i} style={{ fontSize: 15, color: TEXT, lineHeight: 1.8, margin: '0 0 10px 0' }}>{para}</p>
                ))}
              </div>
            )}
            {!readingLesson.fun_fact && readingLesson.did_you_know && (
              <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 16, border: '2px solid #FDE68A' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>⚡ Did you know?</div>
                <p style={{ fontSize: 15, color: '#92400E', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>{readingLesson.did_you_know}</p>
              </div>
            )}
            {readingLesson.concept_explanation && (
              <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 16, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>🧠 Why does this work?</div>
                <p style={{ fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.7 }}>{readingLesson.concept_explanation}</p>
              </div>
            )}
            {readingLesson.real_world_examples?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>🌍 Real world examples</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {readingLesson.real_world_examples.map((ex: string, i: number) => (
                    <div key={i} style={{ background: GREEN_BG, borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', border: `1px solid ${GREEN_BORDER}` }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>🔹</span>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{ex}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {readingLesson.step_by_step?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>📋 Step by step</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {readingLesson.step_by_step.map((step: string, i: number) => (
                    <div key={i} style={{ background: PRIMARY_BG, borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', border: `1px solid ${PRIMARY_BORDER}` }}>
                      <span style={{ background: PRIMARY, color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{step.replace(/^Step \d+:\s*/i, '')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Old string activity */}
            {readingLesson.activity && typeof readingLesson.activity === 'string' && (
              <div style={{ background: GREEN_BG, borderRadius: 14, padding: 16, marginBottom: 16, border: `2px solid ${GREEN_BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>🏃 Try it yourself</div>
                <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{readingLesson.activity}</p>
              </div>
            )}

            {/* ── Quiz (works for both formats) ── */}
            {readingLesson.quiz?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 16 }}>🧠 Check Your Understanding</div>
                {readingLesson.quiz.map((q: any, qi: number) => {
                  const qid = `${readingId}-${qi}`
                  const isSubmitted = quizSubmitted.includes(readingId!)
                  const userAnswer = quizAnswers[qid]
                  return (
                    <div key={qi} style={{ marginBottom: 18 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{qi + 1}. {q.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                        {q.options.map((opt: string, oi: number) => {
                          let bg = BEIGE_CARD, border = BEIGE_BORDER, color = TEXT_MUTED
                          if (!isSubmitted && userAnswer === oi) { bg = PRIMARY_BG; border = PRIMARY; color = PRIMARY_DARK }
                          if (isSubmitted && oi === q.correct) { bg = GREEN_BG; border = GREEN; color = GREEN_DARK }
                          if (isSubmitted && userAnswer === oi && oi !== q.correct) { bg = '#FFF1F2'; border = '#F4A7A7'; color = '#E07575' }
                          return (
                            <button key={oi} onClick={() => !isSubmitted && setQuizAnswers(prev => ({ ...prev, [qid]: oi }))}
                              onMouseEnter={() => !isSubmitted && setHover(`opt-${qid}-${oi}`)}
                              onMouseLeave={() => setHover(null)}
                              style={{ ...btn(`opt-${qid}-${oi}`, { padding: '12px 16px', borderRadius: 12, border: `2px solid ${border}`, background: bg, color, fontSize: 14, fontWeight: 600, textAlign: 'left' as const, fontFamily: 'inherit' }, { filter: 'brightness(0.97)' }), cursor: isSubmitted ? 'default' : 'pointer' }}>
                              {isSubmitted && oi === q.correct && '✓ '}{isSubmitted && userAnswer === oi && oi !== q.correct && '✗ '}{opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {!quizSubmitted.includes(readingId!) ? (
                  <button onClick={() => setQuizSubmitted(prev => [...prev, readingId!])}
                    onMouseEnter={() => setHover('submit')} onMouseLeave={() => setHover(null)}
                    style={btn('submit', { padding: '12px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
                    Submit answers →
                  </button>
                ) : (
                  <div style={{ background: GREEN_BG, borderRadius: 12, padding: 16, marginTop: 8, border: `2px solid ${GREEN}` }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: GREEN_DARK, margin: 0 }}>
                      Score: {readingLesson.quiz.filter((q: any, qi: number) => quizAnswers[`${readingId}-${qi}`] === q.correct).length} / {readingLesson.quiz.length} 🎉
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Parent Tip */}
            {readingLesson.parent_tip && (
              <div style={{ background: '#FFF8EC', borderLeft: `4px solid #F5DFA0`, borderRadius: '0 12px 12px 0', padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#C49040', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>👨‍👩‍👧 Parent tip</div>
                <p style={{ fontSize: 13, color: '#6B5A3E', margin: 0, lineHeight: 1.6 }}>{readingLesson.parent_tip}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="no-print" style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, padding: isMobile ? '12px 14px' : '14px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 10 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🧭</span>
            <div>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 18, fontWeight: 700, color: TEXT }}>Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
              {!isMobile && <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{child?.name} · {child?.city}, {child?.country}</div>}
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {[['children', '👨‍👧 Children', '/dashboard/children'], ['little-readers', '📚 Little Readers', '/little-readers'], ['practice', '🎯 Practice', '/practice'], ['journal', '📖 Journal', '/journal'], ['portfolio', '🎨 Portfolio', '/portfolio'], ['community', '🌍 Community', '/community'], ['worksheets', '📄 Worksheets', '/worksheets'], ['la-report', '🏛️ LA Report', '/la-report']].map(([key, label, path]) => (
                <button key={key} onClick={() => router.push(path)}
                  onMouseEnter={() => setHover(`nav-${key}`)} onMouseLeave={() => setHover(null)}
                  style={btn(`nav-${key}`, { padding: '8px 14px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit' }, { borderColor: PRIMARY, color: PRIMARY, background: PRIMARY_BG })}>
                  {label}
                </button>
              ))}
              <button onClick={() => window.print()}
                onMouseEnter={() => setHover('print')} onMouseLeave={() => setHover(null)}
                style={btn('print', { padding: '8px 14px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: PRIMARY, fontFamily: 'inherit' }, { background: PRIMARY_BG, borderColor: PRIMARY })}>
                🖨️ Print
              </button>
              <button onClick={() => { localStorage.removeItem('cachedPlan'); localStorage.removeItem('cachedPlanChild'); localStorage.removeItem('cachedLessons'); router.push('/dashboard/children') }}
                onMouseEnter={() => setHover('newplan')} onMouseLeave={() => setHover(null)}
                style={btn('newplan', { padding: '8px 14px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }, { background: PRIMARY_DARK })}>
                + New plan
              </button>
<button onClick={handleLogout}
                onMouseEnter={() => setHover('logout')} onMouseLeave={() => setHover(null)}
                style={btn('logout', { padding: '8px 14px', borderRadius: 100, border: '2px solid #F4A7A7', background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: '#E07575', fontFamily: 'inherit' }, { background: '#FFF1F2' })}>
                Logout
              </button>
            </div>
          )}
        </div>
        {/* Mobile nav row */}
        {isMobile && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' as const, paddingBottom: 2 }}>
            {[['children', '👨‍👧', '/dashboard/children'], ['practice', '🎯', '/practice'], ['journal', '📖', '/journal'], ['portfolio', '🎨', '/portfolio'], ['community', '🌍', '/community'], ['worksheets', '📄', '/worksheets'], ['la-report', '🏛️', '/la-report']].map(([key, icon, path]) => (
              <button key={key} onClick={() => router.push(path)}
                style={{ padding: '7px 12px', borderRadius: 100, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: TEXT_MUTED, fontFamily: 'inherit', flexShrink: 0, cursor: 'pointer' }}>
                {icon}
              </button>
            ))}
            <button onClick={() => { localStorage.removeItem('cachedPlan'); localStorage.removeItem('cachedPlanChild'); localStorage.removeItem('cachedLessons'); router.push('/dashboard/children') }}
              style={{ padding: '7px 12px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0, cursor: 'pointer' }}>
              + New
            </button>
<button onClick={handleLogout}
              style={{ padding: '7px 12px', borderRadius: 100, border: '2px solid #F4A7A7', background: BEIGE_CARD, fontSize: 12, fontWeight: 700, color: '#E07575', fontFamily: 'inherit', flexShrink: 0, cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        )}
      </div>

      {trialDaysLeft !== null && !bannerDismissed && (() => {
        const isExpired = trialDaysLeft === 0
        const isUrgent = trialDaysLeft <= 3
        const isWarning = trialDaysLeft <= 6
        const bg = isExpired ? '#FEF2F2' : isUrgent ? '#FFF7ED' : isWarning ? '#FFFBEB' : '#EDF7F2'
        const border = isExpired ? '#FECACA' : isUrgent ? '#FED7AA' : isWarning ? '#FDE68A' : '#A8D5BA'
        const color = isExpired ? '#991B1B' : isUrgent ? '#C2410C' : isWarning ? '#92400E' : '#3D8B60'
        const message = isExpired
          ? '⛔ Your trial has ended. Subscribe to continue.'
          : isUrgent
          ? `🔔 Only ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left! Subscribe now to keep your children's progress.`
          : isWarning
          ? `⏳ ${trialDaysLeft} days left in your trial. Subscribe to keep access.`
          : `🌟 Free trial — ${trialDaysLeft} days remaining. No card needed yet!`
        return (
          <div style={{ background: bg, borderBottom: `2px solid ${border}`, padding: isMobile ? '10px 14px' : '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{message}</span>
              {isExpired && (
                <button onClick={() => router.push('/subscribe')}
                  style={{ padding: '6px 16px', borderRadius: 100, border: 'none', background: '#991B1B', color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                  Subscribe →
                </button>
              )}
            </div>
            <button onClick={() => setBannerDismissed(true)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color, opacity: 0.6, padding: '4px 6px', flexShrink: 0, fontFamily: 'inherit', lineHeight: 1 }}>
              ✕
            </button>
          </div>
        )
      })()}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px 12px' : 24 }}>

        {/* Tab toggle — only shown when child has a language set */}
        {child?.language_learning && child.language_learning !== 'None' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: BEIGE_CARD, borderRadius: 14, padding: 5, border: `2px solid ${BEIGE_BORDER}` }}>
            <button onClick={() => setActiveTab('plan')}
              style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: activeTab === 'plan' ? PRIMARY : 'transparent', color: activeTab === 'plan' ? 'white' : TEXT_MUTED, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}>
              📅 Lesson Plan
            </button>
            <button onClick={() => { setActiveTab('language'); if (!langPlan && !langLoading) loadLanguagePlan() }}
              style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: activeTab === 'language' ? '#6B8FD6' : 'transparent', color: activeTab === 'language' ? 'white' : TEXT_MUTED, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}>
              🗣️ {child.language_learning}
            </button>
          </div>
        )}

        {activeTab === 'plan' && <>
        {plan?.week_theme && (
          <div style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${GREEN})`, borderRadius: 20, padding: '20px 24px', marginBottom: 24, color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', opacity: 0.85 }}>
                  {getWeekDisplayLabel(viewingWeekOffset)}
                </div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 17 : 20, marginTop: 4 }}>{plan.week_theme}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                <button
                  onClick={() => navigateWeek(viewingWeekOffset - 1)}
                  disabled={viewingWeekOffset <= -4}
                  title="Previous week"
                  style={{ padding: isMobile ? '6px 10px' : '7px 13px', borderRadius: 100, border: '2px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 14, fontWeight: 700, cursor: viewingWeekOffset <= -4 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: viewingWeekOffset <= -4 ? 0.4 : 1 }}>
                  {isMobile ? '←' : '← Previous week'}
                </button>
                {viewingWeekOffset !== 0 && (
                  <button
                    onClick={() => navigateWeek(0)}
                    title="Back to current week"
                    style={{ padding: isMobile ? '6px 8px' : '7px 11px', borderRadius: 100, border: '2px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: isMobile ? 11 : 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>
                    Today
                  </button>
                )}
                <button
                  onClick={() => navigateWeek(viewingWeekOffset + 1)}
                  title="Next week"
                  style={{ padding: isMobile ? '6px 10px' : '7px 13px', borderRadius: 100, border: '2px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {isMobile ? '→' : 'Next week →'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="no-print" style={{ background: BEIGE_CARD, borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: `2px solid ${BEIGE_BORDER}`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: TEXT_MUTED, fontWeight: 600, marginBottom: 6 }}>{completed.length} of {totalLessons} lessons completed</div>
            <div style={{ height: 8, background: BEIGE, borderRadius: 100, overflow: 'hidden', border: `1px solid ${BEIGE_BORDER}` }}>
              <div style={{ height: '100%', width: `${totalLessons ? (completed.length / totalLessons) * 100 : 0}%`, background: GREEN, borderRadius: 100, transition: 'width 0.3s' }}/>
            </div>
          </div>
          <div style={{ fontSize: 28 }}>{completed.length === totalLessons && totalLessons > 0 ? '🎉' : '📚'}</div>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
          {days.map(day => {
            const dayData = plan?.days?.find((d: any) => d.day === day)
            const dayLessons = dayData?.lessons || []
            const dayCompleted = dayLessons.filter((_: any, i: number) => completed.includes(`${day}-${i}`)).length
            const isActive = activeDay === day
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`day-btn${isActive ? ' active' : ''}`}
                style={{
                  padding: '10px 18px', borderRadius: 100,
                  border: `2px solid ${isActive ? PRIMARY : BEIGE_BORDER}`,
                  background: isActive ? PRIMARY : BEIGE_CARD,
                  color: isActive ? 'white' : TEXT_MUTED,
                  fontSize: 13, fontWeight: 700,
                  whiteSpace: 'nowrap' as const,
                  fontFamily: 'inherit'
                }}>
                {day} {dayCompleted === dayLessons.length && dayLessons.length > 0 ? '✓' : ''}
              </button>
            )
          })}
        </div>

        {activeDay_ && (
          <div>
            {activeDay_.focus && (
              <p style={{ color: TEXT_MUTED, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>📍 {activeDay_.focus}</p>
            )}

            {activeDay_.lessons.map((lesson: any, i: number) => {
              const id = `${activeDay}-${i}`
              const done = completed.includes(id)
              const isExpanded = expanded.includes(id)
              const sc = subjectColors[lesson.subject] || { bg: PRIMARY_BG, text: PRIMARY, border: PRIMARY_BORDER }
              const isCached = !!lessonCache[id]

              return (
                <div key={i} className="lesson-card" style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, marginBottom: 16, border: `2px solid ${done ? GREEN : BEIGE_BORDER}`, opacity: done ? 0.85 : 1, animation: 'fadeIn 0.3s ease', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 100, background: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, border: `1px solid ${sc.border}` }}>{lesson.subject}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isCached && <span style={{ fontSize: 11, color: GREEN_DARK, fontWeight: 700 }}>⚡ Ready</span>}
                      <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>⏱ {lesson.duration}</span>
                      <span style={{ fontSize: 18, color: TEXT_MUTED, lineHeight: 1, fontWeight: 300 }}>›</span>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 19, color: TEXT, marginBottom: 10 }}>{lesson.title}</h3>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 16 }}>
                    {lesson.milestone && <span style={{ padding: '4px 10px', borderRadius: 100, background: '#FFFBEB', color: '#D97706', fontSize: 11, fontWeight: 700 }}>🎯 {lesson.milestone}</span>}
                    {lesson.method && <span style={{ padding: '4px 10px', borderRadius: 100, background: BEIGE, color: TEXT_MUTED, fontSize: 11, fontWeight: 700 }}>🏛 {lesson.method}</span>}
                    {lesson.materials && <span style={{ padding: '4px 10px', borderRadius: 100, background: GREEN_BG, color: GREEN_DARK, fontSize: 11, fontWeight: 700 }}>🧰 {lesson.materials}</span>}
                  </div>

                  {lesson.goal && (
                    <div style={{ background: PRIMARY_BG, borderRadius: 12, padding: '12px 16px', marginBottom: 12, border: `2px solid ${PRIMARY_BORDER}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>🎯 Goal</div>
                      <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{lesson.goal}</p>
                    </div>
                  )}

                  <button className="tap-btn" onClick={() => { console.log('[Click] Read & Learn clicked, id:', id, 'cached:', !!lessonCache[id]); loadReading(id, lesson) }} disabled={loadingReading === id}
                    onMouseEnter={() => setHover(`read-${id}`)} onMouseLeave={() => setHover(null)}
                    style={btn(`read-${id}`, { width: '100%', padding: '13px 16px', minHeight: 48, borderRadius: 12, border: `2px solid ${PRIMARY}`, background: PRIMARY_BG, color: PRIMARY_DARK, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }, { background: PRIMARY, color: 'white' })}>
                    {loadingReading === id ? (
                      <>
                        <span style={{ width: 14, height: 14, border: `2px solid ${PRIMARY_BORDER}`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                        Loading...
                      </>
                    ) : (
                      <>
                        <span>📖 Read &amp; Learn{isCached ? ' ⚡' : ''}</span>
                        <span style={{ fontSize: 18, fontWeight: 400, lineHeight: 1 }}>›</span>
                      </>
                    )}
                  </button>

                  <button className="tap-btn" onClick={() => toggleExpand(id)}
                    onMouseEnter={() => setHover(`exp-${id}`)} onMouseLeave={() => setHover(null)}
                    style={btn(`exp-${id}`, { width: '100%', padding: '10px', minHeight: 44, borderRadius: 12, border: `2px solid ${BEIGE_BORDER}`, background: BEIGE, color: PRIMARY, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', marginBottom: 10 }, { borderColor: PRIMARY, background: PRIMARY_BG })}>
                    {isExpanded ? '▲ Hide lesson details' : '▼ Show lesson details'}
                  </button>

                  {isExpanded && (
                    <div style={{ marginBottom: 12 }}>
                      {lesson.activity && (
                        <div style={{ background: GREEN_BG, borderRadius: 14, padding: 16, marginBottom: 12, border: `1px solid ${GREEN_BORDER}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>🏃 Activity</div>
                          <p style={{ fontSize: 14, color: TEXT, lineHeight: 1.7, margin: 0 }}>{lesson.activity}</p>
                        </div>
                      )}
                      {lesson.reflection && (
                        <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 12, border: `1px solid #FDE68A` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>💬 Reflection</div>
                          <p style={{ fontSize: 14, color: '#6B5A3E', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{lesson.reflection}"</p>
                        </div>
                      )}
                      {lesson.local_tip && (
                        <div style={{ background: PRIMARY_BG, borderLeft: `4px solid ${PRIMARY}`, borderRadius: '0 12px 12px 0', padding: '10px 14px', marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 4 }}>📍 Local tip — {child?.city}</div>
                          <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>{lesson.local_tip}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <button className="tap-btn" onClick={() => toggleComplete(id)}
                    onMouseEnter={() => setHover(`done-${id}`)} onMouseLeave={() => setHover(null)}
                    style={btn(`done-${id}`, { width: '100%', padding: '12px', minHeight: 48, borderRadius: 12, border: `2px solid ${done ? GREEN : BEIGE_BORDER}`, background: done ? GREEN_BG : BEIGE_CARD, color: done ? GREEN_DARK : TEXT_MUTED, fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }, { borderColor: done ? GREEN_DARK : PRIMARY, background: done ? '#E0F5EA' : PRIMARY_BG })}>
                    {done ? '✓ Completed!' : '○ Mark as completed'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
        </>}

        {/* ── Language tab ── */}
        {activeTab === 'language' && (
          <div>
            {langLoading && (
              <div style={{ textAlign: 'center' as const, padding: '60px 20px' }}>
                <div style={{ width: 48, height: 48, border: `4px solid ${PRIMARY_BORDER}`, borderTopColor: '#6B8FD6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                <p style={{ color: TEXT_MUTED, fontSize: 15 }}>Preparing Week {langWeek} {child?.language_learning} lessons...</p>
              </div>
            )}

            {!langLoading && langPlan && (
              <>
                {/* Week header */}
                <div style={{ background: 'linear-gradient(135deg, #6B8FD6, #9B8EC4)', borderRadius: 20, padding: '20px 24px', marginBottom: 24, color: 'white' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', opacity: 0.85 }}>
                    Week {langPlan.week_number} · {child?.language_learning}
                  </div>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, marginTop: 4 }}>{langPlan.week_theme}</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>{langPlan.vocabulary?.length || 0} new words this week</div>
                </div>

                {/* Vocabulary grid */}
                {langPlan.vocabulary?.length > 0 && (
                  <div style={{ background: BEIGE_CARD, borderRadius: 16, padding: 20, marginBottom: 24, border: `2px solid ${BEIGE_BORDER}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 14 }}>📚 This week's vocabulary</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10 }}>
                      {langPlan.vocabulary.map((v: any, i: number) => (
                        <div key={i} style={{ background: PRIMARY_BG, border: `1px solid ${PRIMARY_BORDER}`, borderRadius: 12, padding: '8px 14px', minWidth: 110 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: PRIMARY }}>{v.word}</div>
                          <div style={{ fontSize: 12, color: TEXT_MUTED }}>{v.translation}</div>
                          {v.pronunciation && <div style={{ fontSize: 11, color: TEXT_MUTED, fontStyle: 'italic' as const, marginTop: 2 }}>🔊 {v.pronunciation}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day tabs + quiz tab */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' as const }}>
                  {days.map(day => (
                    <button key={day} onClick={() => setLangActiveDay(day)}
                      className={`day-btn${langActiveDay === day ? ' active' : ''}`}
                      style={{ padding: '10px 18px', borderRadius: 100, border: `2px solid ${langActiveDay === day ? '#6B8FD6' : BEIGE_BORDER}`, background: langActiveDay === day ? '#6B8FD6' : BEIGE_CARD, color: langActiveDay === day ? 'white' : TEXT_MUTED, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' as const, fontFamily: 'inherit' }}>
                      {day}
                    </button>
                  ))}
                  <button onClick={() => setLangActiveDay('Quiz')}
                    className={`day-btn${langActiveDay === 'Quiz' ? ' active' : ''}`}
                    style={{ padding: '10px 18px', borderRadius: 100, border: `2px solid ${langActiveDay === 'Quiz' ? '#6B8FD6' : BEIGE_BORDER}`, background: langActiveDay === 'Quiz' ? '#6B8FD6' : BEIGE_CARD, color: langActiveDay === 'Quiz' ? 'white' : TEXT_MUTED, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' as const, fontFamily: 'inherit' }}>
                    🧠 Quiz
                  </button>
                </div>

                {/* Daily lesson card */}
                {langActiveDay !== 'Quiz' && (() => {
                  const dayData = langPlan.days?.find((d: any) => d.day === langActiveDay)
                  if (!dayData) return null
                  return (
                    <div style={{ animation: 'fadeIn 0.2s ease' }}>
                      <div style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B8FD6', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>{langActiveDay}</div>
                        <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: TEXT, marginBottom: 20 }}>{dayData.focus}</h3>

                        {dayData.new_words?.length > 0 && (
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>Today's words</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                              {dayData.new_words.map((w: string, i: number) => {
                                const vocab = langPlan.vocabulary?.find((v: any) => v.word === w)
                                return (
                                  <div key={i} style={{ background: PRIMARY_BG, border: `1px solid ${PRIMARY_BORDER}`, borderRadius: 10, padding: '6px 12px' }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: PRIMARY }}>{w}</span>
                                    {vocab && <span style={{ fontSize: 12, color: TEXT_MUTED, marginLeft: 6 }}>— {vocab.translation}</span>}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {dayData.phrases?.length > 0 && (
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 }}>Useful phrases</div>
                            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                              {dayData.phrases.map((p: any, i: number) => (
                                <div key={i} style={{ background: GREEN_BG, borderRadius: 12, padding: '12px 16px', border: `1px solid ${GREEN_BORDER}` }}>
                                  <div style={{ fontSize: 15, fontWeight: 700, color: GREEN_DARK }}>{p.phrase}</div>
                                  <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 2 }}>{p.translation}</div>
                                  {p.pronunciation && <div style={{ fontSize: 12, color: TEXT_MUTED, fontStyle: 'italic' as const, marginTop: 2 }}>🔊 {p.pronunciation}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {dayData.mini_lesson && (
                          <div style={{ background: '#F0F5FF', borderRadius: 14, padding: 16, marginBottom: 16, border: '2px solid #C6D5F5' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6080C4', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>📖 Today's lesson</div>
                            <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{dayData.mini_lesson}</p>
                          </div>
                        )}

                        {dayData.activity && (
                          <div style={{ background: GREEN_BG, borderRadius: 14, padding: 16, marginBottom: 16, border: `1px solid ${GREEN_BORDER}` }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>🏃 Practice</div>
                            <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{dayData.activity}</p>
                          </div>
                        )}

                        {dayData.fun_fact && (
                          <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, border: '2px solid #FDE68A' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>⚡ Did you know?</div>
                            <p style={{ fontSize: 14, color: '#92400E', margin: 0, lineHeight: 1.7, fontStyle: 'italic' as const }}>{dayData.fun_fact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Weekly quiz */}
                {langActiveDay === 'Quiz' && langPlan.weekly_quiz && (
                  <div style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, border: `2px solid ${BEIGE_BORDER}`, animation: 'fadeIn 0.2s ease' }}>
                    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: TEXT, marginBottom: 20 }}>Weekly Review Quiz</h3>
                    {langPlan.weekly_quiz.map((q: any, qi: number) => {
                      const userAnswer = langQuizAnswers[qi]
                      return (
                        <div key={qi} style={{ marginBottom: 20 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{qi + 1}. {q.question}</p>
                          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                            {q.options.map((opt: string, oi: number) => {
                              let bg = BEIGE_CARD, border = BEIGE_BORDER, color = TEXT_MUTED
                              if (!langQuizSubmitted && userAnswer === oi) { bg = '#F0F5FF'; border = '#6B8FD6'; color = '#6080C4' }
                              if (langQuizSubmitted && oi === q.correct) { bg = GREEN_BG; border = GREEN; color = GREEN_DARK }
                              if (langQuizSubmitted && userAnswer === oi && oi !== q.correct) { bg = '#FFF1F2'; border = '#F4A7A7'; color = '#E07575' }
                              return (
                                <button key={oi} onClick={() => !langQuizSubmitted && setLangQuizAnswers(p => ({ ...p, [qi]: oi }))}
                                  style={{ padding: '12px 16px', borderRadius: 12, border: `2px solid ${border}`, background: bg, color, fontSize: 14, fontWeight: 600, textAlign: 'left' as const, fontFamily: 'inherit', cursor: langQuizSubmitted ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                                  {langQuizSubmitted && oi === q.correct && '✓ '}{langQuizSubmitted && userAnswer === oi && oi !== q.correct && '✗ '}{opt}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                    {!langQuizSubmitted ? (
                      <button onClick={() => setLangQuizSubmitted(true)}
                        style={{ padding: '12px 24px', borderRadius: 100, border: 'none', background: '#6B8FD6', color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                        Submit answers →
                      </button>
                    ) : (
                      <div style={{ background: GREEN_BG, borderRadius: 12, padding: 16, border: `2px solid ${GREEN}` }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: GREEN_DARK, margin: '0 0 4px 0' }}>
                          Score: {langPlan.weekly_quiz.filter((q: any, qi: number) => langQuizAnswers[qi] === q.correct).length} / {langPlan.weekly_quiz.length} 🎉
                        </p>
                        <p style={{ fontSize: 13, color: GREEN_DARK, margin: 0, opacity: 0.8 }}>Come back next week for Week {langPlan.week_number + 1}!</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {!langLoading && !langPlan && (
              <div style={{ textAlign: 'center' as const, padding: '60px 20px', color: TEXT_MUTED }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🗣️</div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>Something went wrong loading your language plan.</p>
                <button onClick={loadLanguagePlan} style={{ marginTop: 12, padding: '10px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}