import { NextRequest, NextResponse } from 'next/server'
import { requireAccess } from '@/app/lib/server/access'
import { LESSONS_PER_CONCEPT } from '@/app/lib/server/curriculum'

// Records a finished lesson: advances the child's progress on the concept and
// writes a lesson_history row (used by the portfolio and LA report).
export async function POST(request: NextRequest) {
  const guard = await requireAccess()
  if ('response' in guard) return guard.response
  const { admin, user } = guard

  try {
    const body = await request.json().catch(() => ({}))
    const childId = typeof body.child_id === 'string' ? body.child_id : ''
    const conceptId = typeof body.concept_id === 'string' ? body.concept_id : ''
    const stage = Number(body.stage)
    const quizScore = Number.isFinite(Number(body.quiz_score)) ? Number(body.quiz_score) : null
    const quizTotal = Number.isFinite(Number(body.quiz_total)) ? Number(body.quiz_total) : null
    if (!childId || !conceptId || !Number.isInteger(stage) || stage < 1 || stage > LESSONS_PER_CONCEPT) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    const [{ data: child }, { data: concept }] = await Promise.all([
      admin.from('children').select('id, name, city, country').eq('id', childId).eq('user_id', user.id).maybeSingle(),
      admin.from('curriculum_concepts')
        .select('id, concept_name, nc_reference, subjects(name)')
        .eq('id', conceptId).maybeSingle(),
    ])
    if (!child) return NextResponse.json({ error: 'child_not_found' }, { status: 404 })
    if (!concept) return NextResponse.json({ error: 'concept_not_found' }, { status: 404 })

    const { data: existing } = await admin
      .from('child_progress')
      .select('lessons_completed')
      .eq('child_id', childId).eq('concept_id', conceptId)
      .maybeSingle()

    // Only advance one stage at a time and never go backwards.
    const current = existing?.lessons_completed ?? 0
    if (stage !== current + 1) {
      return NextResponse.json({ ok: true, lessons_completed: current, skipped: true })
    }
    const lessonsCompleted = stage
    const conceptDone = lessonsCompleted >= LESSONS_PER_CONCEPT

    const { error: progErr } = await admin.from('child_progress').upsert({
      child_id: childId,
      concept_id: conceptId,
      lessons_completed: lessonsCompleted,
      status: conceptDone ? 'completed' : 'in_progress',
      started_at: existing ? undefined : new Date().toISOString(),
      completed_at: conceptDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'child_id,concept_id' })
    if (progErr) throw progErr

    const subjectName = (concept.subjects as unknown as { name?: string } | null)?.name ?? ''
    const stageName = ['Discover', 'Practise', 'Explore'][stage - 1]
    await admin.from('lesson_history').insert({
      user_id: user.id,
      child_id: childId,
      child_name: child.name,
      concept_id: conceptId,
      subject: subjectName,
      topic: `${concept.concept_name} — ${stageName}${quizTotal ? ` (quiz ${quizScore ?? 0}/${quizTotal})` : ''}`,
      stage,
      nc_reference: concept.nc_reference,
      city: child.city,
      country: child.country,
    })

    return NextResponse.json({ ok: true, lessons_completed: lessonsCompleted, concept_done: conceptDone })
  } catch (error: unknown) {
    console.error('[lesson-complete] error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
