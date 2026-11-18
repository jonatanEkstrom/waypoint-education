import { NextRequest, NextResponse } from 'next/server'
import { requireAccess } from '@/app/lib/server/access'
import { ageBandFor, ensureCurriculum, LESSONS_PER_CONCEPT } from '@/app/lib/server/curriculum'

// Per-subject progress for one child: concepts done, total, and what's next.
export async function GET(request: NextRequest) {
  const guard = await requireAccess()
  if ('response' in guard) return guard.response
  const { admin, user } = guard

  const childId = request.nextUrl.searchParams.get('child_id') ?? ''
  if (!childId) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  try {
    await ensureCurriculum(admin)
    const { data: child } = await admin
      .from('children').select('id, age_group').eq('id', childId).eq('user_id', user.id).maybeSingle()
    if (!child) return NextResponse.json({ error: 'child_not_found' }, { status: 404 })

    const band = ageBandFor(child.age_group)
    const { data: ageGroup } = await admin.from('age_groups').select('id, nc_stage').eq('label', band).maybeSingle()
    if (!ageGroup) return NextResponse.json({ error: 'age_group_not_found' }, { status: 422 })

    const [{ data: subjects }, { data: concepts }, { data: progress }] = await Promise.all([
      admin.from('subjects').select('id, slug, name, sort').order('sort'),
      admin.from('curriculum_concepts')
        .select('id, subject_id, concept_name, sequence_order')
        .eq('age_group_id', ageGroup.id)
        .order('sequence_order'),
      admin.from('child_progress').select('concept_id, lessons_completed').eq('child_id', childId),
    ])
    const done = new Map((progress ?? []).map(p => [p.concept_id, p.lessons_completed ?? 0]))

    const result = (subjects ?? []).map(s => {
      const list = (concepts ?? []).filter(c => c.subject_id === s.id)
      const completed = list.filter(c => (done.get(c.id) ?? 0) >= LESSONS_PER_CONCEPT).length
      const next = list.find(c => (done.get(c.id) ?? 0) < LESSONS_PER_CONCEPT)
      const lessonsDone = list.reduce((n, c) => n + Math.min(done.get(c.id) ?? 0, LESSONS_PER_CONCEPT), 0)
      return {
        slug: s.slug,
        name: s.name,
        total_concepts: list.length,
        concepts_completed: completed,
        lessons_completed: lessonsDone,
        total_lessons: list.length * LESSONS_PER_CONCEPT,
        next_concept: next?.concept_name ?? null,
        next_stage: next ? (done.get(next.id) ?? 0) + 1 : null,
      }
    })

    return NextResponse.json({ band, nc_stage: ageGroup.nc_stage, subjects: result })
  } catch (error: unknown) {
    console.error('[progress] error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
