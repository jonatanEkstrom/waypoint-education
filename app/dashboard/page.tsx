import { redirect } from 'next/navigation'
import { adminClient, getAccessProfile, getSessionUser, hasAccess } from '../lib/server/access'
import LessonDashboard from './lesson-dashboard'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth')

  const profile = await getAccessProfile(adminClient(), user.id)
  if (!hasAccess(profile)) redirect('/subscribe')

  return <LessonDashboard
    key={user.id}
    accountId={user.id}
    trialEndsAt={profile?.subscription_status === 'trial' ? profile.trial_end_date : null}
  />
}
