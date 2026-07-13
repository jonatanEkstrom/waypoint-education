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
const GREEN_BG = '#EDF7F2'
const GREEN_BORDER = '#D5F0E3'
const TEXT = '#2D2D2D'
const TEXT_MUTED = '#9E9188'

// Maps the subject labels stored in children.subjects (see SUBJECT_OPTIONS in
// app/dashboard/children/page.tsx) to the subject_slug values /api/generate-lesson expects.
const SUBJECT_SLUGS: Record<string, string> = {
  'Math': 'mathematics', 'Mathematics': 'mathematics',
  'Science': 'science',
  'Language Arts': 'language', 'Language': 'language', 'Languages': 'language',
}

const SUBJECT_META: Record<string, { icon: string; bg: string; text: string; border: string }> = {
  mathematics: { icon: '🔢', bg: '#FFF0F5', text: '#C4748E', border: '#F5C6D5' },
  science: { icon: '🔬', bg: GREEN_BG, text: GREEN_DARK, border: GREEN_BORDER },
  language: { icon: '🗣️', bg: '#F0F5FF', text: '#6080C4', border: '#C6D5F5' },
}

function getTodayName() {
  const map: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' }
  return map[new Date().getDay()] || 'Monday'
}

function getWeekNumber() {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
}

export default function DashboardPage() {
  const [child, setChild] = useState<any>(null)
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | null>(null)
  const [lesson, setLesson] = useState<any>(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [lessonError, setLessonError] = useState<'all_complete' | 'error' | null>(null)
  const [markingComplete, setMarkingComplete] = useState(false)
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
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
    setChild(childData)
    refreshChild(childData.id, childData.user_id)
  }, [])

  async function refreshChild(id: string, userId?: string) {
    try {
      const { data } = await supabase.from('children').select('*').eq('id', id).single()
      if (data) {
        const fresh = { ...data, user_id: userId }
        setChild(fresh)
        localStorage.setItem('activeChild', JSON.stringify(fresh))
      }
    } catch (e) { console.error('[Dashboard] Failed to refresh child:', e) }
  }

  async function loadLesson(slug: string) {
    if (!child) return
    setLessonLoading(true)
    setLesson(null)
    setLessonError(null)
    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: child.id, subject_slug: slug, city: child.city, country: child.country })
      })
      if (!res.ok || !res.body) throw new Error('Failed to load lesson')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
      }
      fullText += decoder.decode()
      const cleaned = fullText.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      if (parsed.error === 'all_complete') {
        setLessonError('all_complete')
      } else {
        setLesson(parsed)
      }
    } catch (e) {
      console.error('[loadLesson] Failed:', e)
      setLessonError('error')
    } finally {
      setLessonLoading(false)
    }
  }

  function handleSubjectClick(slug: string) {
    setSelectedSubjectSlug(slug)
    loadLesson(slug)
  }

  async function markLessonComplete() {
    if (!lesson?.concept_id || !child?.id || !selectedSubjectSlug) return
    setMarkingComplete(true)
    try {
      const { error } = await supabase.from('child_progress').insert({
        child_id: child.id,
        concept_id: lesson.concept_id,
        status: 'completed',
      })
      if (error) throw error
      await loadLesson(selectedSubjectSlug)
    } catch (e) {
      console.error('[markLessonComplete] Failed:', e)
    } finally {
      setMarkingComplete(false)
    }
  }

  function closeLesson() {
    setSelectedSubjectSlug(null)
    setLesson(null)
    setLessonError(null)
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

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/auth')
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const availableSubjects = ((child?.subjects || []) as string[])
    .map(name => ({ name, slug: SUBJECT_SLUGS[name] }))
    .filter((s): s is { name: string; slug: string } => !!s.slug)

  const btn = (id: string, base: React.CSSProperties, hoverStyle: React.CSSProperties): React.CSSProperties => ({
    ...base, ...(hover === id ? hoverStyle : {}), transition: 'all 0.15s ease', cursor: 'pointer'
  })

  if (!child) return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: 48, height: 48, border: `5px solid ${PRIMARY_BORDER}`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
        @keyframes menuSlideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .mobile-menu { animation: menuSlideDown 0.18s ease; }
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

      <div className="no-print" style={{ background: BEIGE_CARD, borderBottom: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '12px 14px' : '14px 24px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🧭</span>
            <div>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 15 : 18, fontWeight: 700, color: TEXT }}>Waypoint <span style={{ color: PRIMARY }}>Education</span></span>
              {!isMobile && <div style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{child?.name} · {child?.city}, {child?.country}</div>}
            </div>
          </div>

          {/* Desktop nav */}
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
              <button onClick={() => router.push('/dashboard/children')}
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

          {/* Mobile hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ background: menuOpen ? PRIMARY_BG : 'none', border: `2px solid ${menuOpen ? PRIMARY_BORDER : BEIGE_BORDER}`, borderRadius: 10, width: 40, height: 40, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0 }}
              aria-label="Menu">
              <span style={{ display: 'block', width: 18, height: 2, background: menuOpen ? PRIMARY : TEXT_MUTED, borderRadius: 2, transition: 'all 0.2s ease', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ display: 'block', width: 18, height: 2, background: menuOpen ? PRIMARY : TEXT_MUTED, borderRadius: 2, transition: 'all 0.2s ease', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: 18, height: 2, background: menuOpen ? PRIMARY : TEXT_MUTED, borderRadius: 2, transition: 'all 0.2s ease', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && menuOpen && (
          <div className="mobile-menu" style={{ borderTop: `1px solid ${BEIGE_BORDER}`, padding: '8px 14px 14px', background: BEIGE_CARD }}>
            {[['children', '👨‍👧 Children', '/dashboard/children'], ['little-readers', '📚 Little Readers', '/little-readers'], ['practice', '🎯 Practice', '/practice'], ['journal', '📖 Journal', '/journal'], ['portfolio', '🎨 Portfolio', '/portfolio'], ['community', '🌍 Community', '/community'], ['worksheets', '📄 Worksheets', '/worksheets'], ['la-report', '🏛️ LA Report', '/la-report']].map(([key, label, path]) => (
              <button key={key} onClick={() => { setMenuOpen(false); router.push(path) }}
                style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '13px 4px', background: 'none', border: 'none', borderBottom: `1px solid ${BEIGE_BORDER}`, fontSize: 15, fontWeight: 700, color: TEXT, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' as const, gap: 10 }}>
                {label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setMenuOpen(false); router.push('/dashboard/children') }}
                style={{ flex: 1, padding: '11px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                + New plan
              </button>
              <button onClick={() => { setMenuOpen(false); handleLogout() }}
                style={{ flex: 1, padding: '11px', borderRadius: 100, border: '2px solid #F4A7A7', background: BEIGE_CARD, fontSize: 13, fontWeight: 700, color: '#E07575', fontFamily: 'inherit', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
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
              📚 Lessons
            </button>
            <button onClick={() => { setActiveTab('language'); if (!langPlan && !langLoading) loadLanguagePlan() }}
              style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: activeTab === 'language' ? '#6B8FD6' : 'transparent', color: activeTab === 'language' ? 'white' : TEXT_MUTED, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s' }}>
              🗣️ {child.language_learning}
            </button>
          </div>
        )}

        {activeTab === 'plan' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: TEXT, margin: '0 0 4px 0' }}>Hi {child?.name}! 👋</h2>
              <p style={{ color: TEXT_MUTED, fontSize: 14, margin: 0 }}>Pick a subject to start today's lesson.</p>
            </div>

            {availableSubjects.length === 0 ? (
              <div style={{ background: BEIGE_CARD, borderRadius: 16, padding: 24, border: `2px solid ${BEIGE_BORDER}`, textAlign: 'center' as const, color: TEXT_MUTED }}>
                No lessons available for your subjects yet.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 24 }}>
                {availableSubjects.map(({ name, slug }) => {
                  const meta = SUBJECT_META[slug]
                  const isActive = selectedSubjectSlug === slug
                  return (
                    <button key={slug} className="tap-btn" onClick={() => handleSubjectClick(slug)}
                      onMouseEnter={() => setHover(`subj-${slug}`)} onMouseLeave={() => setHover(null)}
                      style={btn(`subj-${slug}`, {
                        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8,
                        padding: '20px 24px', minWidth: 120, borderRadius: 18,
                        border: `2px solid ${isActive ? meta.text : meta.border}`,
                        background: isActive ? meta.text : meta.bg,
                        color: isActive ? 'white' : meta.text,
                        fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                      }, { filter: 'brightness(0.97)' })}>
                      <span style={{ fontSize: 28 }}>{meta.icon}</span>
                      <span>{name}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {selectedSubjectSlug && (
              <div className="lesson-card" style={{ background: BEIGE_CARD, borderRadius: 20, padding: 24, border: `2px solid ${BEIGE_BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button onClick={closeLesson}
                    onMouseEnter={() => setHover('close-lesson')} onMouseLeave={() => setHover(null)}
                    style={btn('close-lesson', { background: 'none', border: 'none', color: TEXT_MUTED, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', padding: 0 }, { color: PRIMARY })}>
                    ✕ Close
                  </button>
                </div>

                {lessonLoading && (
                  <div style={{ textAlign: 'center' as const, padding: '40px 20px' }}>
                    <div style={{ width: 48, height: 48, border: `4px solid ${PRIMARY_BORDER}`, borderTopColor: PRIMARY, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Preparing your lesson...</p>
                  </div>
                )}

                {!lessonLoading && lessonError === 'all_complete' && (
                  <div style={{ textAlign: 'center' as const, padding: '30px 20px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>You've completed all lessons in this subject!</p>
                  </div>
                )}

                {!lessonLoading && lessonError === 'error' && (
                  <div style={{ textAlign: 'center' as const, padding: '30px 20px' }}>
                    <p style={{ fontSize: 15, color: TEXT_MUTED, marginBottom: 16 }}>Something went wrong loading this lesson.</p>
                    <button onClick={() => loadLesson(selectedSubjectSlug)}
                      style={{ padding: '10px 24px', borderRadius: 100, border: 'none', background: PRIMARY, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                      Try again
                    </button>
                  </div>
                )}

                {!lessonLoading && !lessonError && lesson && (
                  <div>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: isMobile ? 20 : 24, color: TEXT, marginBottom: 20 }}>{lesson.reading_title}</h2>

                    {lesson.introduction && (
                      <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>🎯 Introduction</div>
                        <p style={{ fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.75 }}>{lesson.introduction}</p>
                      </div>
                    )}

                    {lesson.main_content && (
                      <div style={{ background: BEIGE, borderRadius: 14, padding: 20, marginBottom: 16, border: `2px solid ${BEIGE_BORDER}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 12 }}>📚 The Lesson</div>
                        {lesson.main_content.split('\n\n').map((para: string, i: number) => (
                          <p key={i} style={{ fontSize: 15, color: TEXT, lineHeight: 1.8, margin: '0 0 10px 0' }}>{para}</p>
                        ))}
                      </div>
                    )}

                    {lesson.example && (
                      <div style={{ background: GREEN_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${GREEN_BORDER}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: GREEN_DARK, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>💡 Example</div>
                        <p style={{ fontSize: 15, color: TEXT, margin: 0, lineHeight: 1.75 }}>{lesson.example}</p>
                      </div>
                    )}

                    {lesson.activity && (
                      <div style={{ background: PRIMARY_BG, borderRadius: 14, padding: 18, marginBottom: 16, border: `2px solid ${PRIMARY_BORDER}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>🏃 Activity — {lesson.activity.title}</div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 12 }}>
                          {lesson.activity.time && (
                            <span style={{ padding: '3px 10px', borderRadius: 100, background: PRIMARY, color: 'white', fontSize: 11, fontWeight: 700 }}>⏱ {lesson.activity.time}</span>
                          )}
                          {lesson.activity.materials && (
                            <span style={{ padding: '3px 10px', borderRadius: 100, background: GREEN_BG, color: GREEN_DARK, fontSize: 11, fontWeight: 700, border: `1px solid ${GREEN_BORDER}` }}>🧰 {lesson.activity.materials}</span>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.7 }}>{lesson.activity.description}</p>
                      </div>
                    )}

                    {lesson.discussion_questions?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>💬 Discuss Together</div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                          {lesson.discussion_questions.map((q: string, i: number) => (
                            <div key={i} style={{ background: BEIGE, borderRadius: 12, padding: '12px 16px', border: `2px solid ${BEIGE_BORDER}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span style={{ background: PRIMARY_BG, color: PRIMARY, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                              <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>{q}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {lesson.fun_fact && (
                      <div style={{ background: '#FFFBEB', borderRadius: 14, padding: 16, marginBottom: 16, border: '2px solid #FDE68A' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>⚡ Fun Fact</div>
                        <p style={{ fontSize: 15, color: '#92400E', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>{lesson.fun_fact}</p>
                      </div>
                    )}

                    {lesson.parent_tip && (
                      <div style={{ background: '#FFF8EC', borderLeft: `4px solid #F5DFA0`, borderRadius: '0 12px 12px 0', padding: '12px 16px', marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#C49040', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>👨‍👩‍👧 Parent tip</div>
                        <p style={{ fontSize: 13, color: '#6B5A3E', margin: 0, lineHeight: 1.6 }}>{lesson.parent_tip}</p>
                      </div>
                    )}

                    <button className="tap-btn" onClick={markLessonComplete} disabled={markingComplete}
                      onMouseEnter={() => setHover('mark-complete')} onMouseLeave={() => setHover(null)}
                      style={btn('mark-complete', { width: '100%', padding: '13px 16px', minHeight: 48, borderRadius: 12, border: 'none', background: GREEN, color: GREEN_DARK, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: markingComplete ? 0.7 : 1 }, { background: GREEN_DARK, color: 'white' })}>
                      {markingComplete ? (
                        <>
                          <span style={{ width: 14, height: 14, border: `2px solid ${GREEN_BORDER}`, borderTopColor: GREEN_DARK, borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                          Saving...
                        </>
                      ) : '✓ Mark as complete & continue'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
