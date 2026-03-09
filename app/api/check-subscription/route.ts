import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ active: false })

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data) return NextResponse.json({ active: false })

  const isTrialing = data.status === 'trialing' && new Date(data.trial_ends_at) > new Date()
  const isActive = data.status === 'active'

  return NextResponse.json({
    active: isTrialing || isActive,
    status: data.status,
    plan: data.plan,
    children_count: data.children_count,
    trial_ends_at: data.trial_ends_at,
  })
}