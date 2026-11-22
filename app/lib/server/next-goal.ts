import type { SupabaseClient } from '@supabase/supabase-js'

export async function nextGoal(supabase: SupabaseClient, child_id: string, ageGroupId: string, subjectId: string) {
  const { data: progress, error: progressError } = await supabase
    .from('child_progress')
    .select('concept_id, status')
    .eq('child_id', child_id)

  if (progressError) throw progressError

  const completedIds = (progress ?? []).filter(row => row.status === 'completed').map(row => row.concept_id)

  let conceptQuery = supabase
    .from('curriculum_concepts')
    .select('id, concept_key, concept_name, concept_description, sequence_order')
    .eq('subject_id', subjectId)
    .eq('age_group_id', ageGroupId)
    .order('sequence_order', { ascending: true })
    .limit(1)

  if (completedIds.length > 0) {
    conceptQuery = conceptQuery.not('id', 'in', `(${completedIds.join(',')})`)
  }

  const { data: concepts, error: conceptError } = await conceptQuery

  if (conceptError) {
    throw conceptError
  }

  const concept = concepts?.[0]

  return { concept, needsReview: !!concept && (progress ?? []).some(row => row.concept_id === concept.id && row.status === 'needs_review') }
}
