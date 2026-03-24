export type Plan = 'trial' | 'pro' | 'family'

export interface Profile {
  id: string
  email: string
  plan: Plan
  trial_ends_at: string
  stripe_customer_id?: string
}

export interface Child {
  id: string
  profile_id: string
  name: string
  age_group: string
  subjects: string[]
  curriculum: string
  learn_style: string
  notes?: string
  language_learning?: string
}

export interface WeekPlan {
  id: string
  child_id: string
  country: string
  city: string
  week_data: any
  created_at: string
}

export interface JournalEntry {
  id: string
  child_id: string
  entry_date: string
  keywords: string[]
  story: string
}