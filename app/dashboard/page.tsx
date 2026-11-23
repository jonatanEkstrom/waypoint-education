import { redirect } from 'next/navigation'
import { adminClient, getAccessProfile, getSessionUser, hasAccess } from '../lib/server/access'
import LessonDashboard from './lesson-dashboard'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ child?: string | string[] }> }) {
  const user = await getSessionUser()
  if (!user) redirect('/auth')

  const admin = adminClient()
  const profile = await getAccessProfile(admin, user.id)
  if (!hasAccess(profile)) redirect('/subscribe')

  const { child } = await searchParams
  let selectedChild = null
  if (child !== undefined) {
    if (typeof child !== 'string' || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(child)) redirect('/dashboard/children')
    const { data, error } = await admin.from('children')
      .select('id, user_id, name, age_group, city, country, language_learning, subjects')
      .eq('id', child)
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) throw error
    if (!data) redirect('/dashboard/children')
    selectedChild = data
  }

  return <LessonDashboard
    key={selectedChild?.id ?? user.id}
    selectedChild={selectedChild}
    accountId={user.id}
    trialEndsAt={profile?.subscription_status === 'trial' ? profile.trial_end_date : null}
  />
}
