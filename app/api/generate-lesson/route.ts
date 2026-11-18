import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAccess } from '@/app/lib/server/access'
import { ageBandFor, ensureCurriculum, LESSONS_PER_CONCEPT, type AgeBand } from '@/app/lib/server/curriculum'
import { buildLessonPrompt, parseLesson, STAGES } from '@/app/lib/server/lesson-prompt'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-haiku-4-5-20251001'

export async function POST(request: NextRequest) {
  const guard = await requireAccess()
  if ('response' in guard) return guard.response
  const { admin, user } = guard

  try {
    const body = await request.json().catch(() => ({}))
    const childId = typeof body.child_id === 'string' ? body.child_id : ''
    const subjectSlug = typeof body.subject_slug === 'string' ? body.subject_slug : ''
    if (!childId || !subjectSlug) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

    await ensureCurriculum(admin)

    // Service role bypasses RLS, so ownership is checked explicitly.
    const { data: child } = await admin
      .from('children')
      .select('id, name, age_group, city, country, interests, subjects, learning_style, learn_style, reading_level, focus_time')
      .eq('id', childId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!child) return NextResponse.json({ error: 'child_not_found' }, { status: 404 })

    const band: AgeBand = ageBandFor(child.age_group)
    const [{ data: subject }, { data: ageGroup }] = await Promise.all([
      admin.from('subjects').select('id, slug, name').eq('slug', subjectSlug).maybeSingle(),
      admin.from('age_groups').select('id, label, nc_stage').eq('label', band).maybeSingle(),
    ])
    if (!subject) return NextResponse.json({ error: 'subject_not_found' }, { status: 404 })
    if (!ageGroup) return NextResponse.json({ error: 'age_group_not_found' }, { status: 422 })

    const [{ data: concepts }, { data: progress }] = await Promise.all([
      admin
        .from('curriculum_concepts')
        .select('id, concept_key, concept_name, concept_description, nc_reference, strand, sequence_order')
        .eq('subject_id', subject.id)
        .eq('age_group_id', ageGroup.id)
        .order('sequence_order', { ascending: true }),
      admin.from('child_progress').select('concept_id, lessons_completed').eq('child_id', child.id),
    ])
    const list = concepts ?? []
    const done = new Map((progress ?? []).map(p => [p.concept_id, p.lessons_completed ?? 0]))

    const index = list.findIndex(c => (done.get(c.id) ?? 0) < LESSONS_PER_CONCEPT)
    if (index === -1) {
      return NextResponse.json({ error: 'all_complete', total_concepts: list.length }, { status: 200 })
    }
    const concept = list[index]
    const stage = (done.get(concept.id) ?? 0) + 1
    const previous = list.slice(Math.max(0, index - 3), index).map(c => c.concept_name)

    const city = (child.city || '').trim()
    const country = (child.country || '').trim()
    const { system, user: userPrompt } = buildLessonPrompt({
      childName: child.name,
      band,
      ncStage: ageGroup.nc_stage ?? '',
      subjectName: subject.name,
      concept: {
        name: concept.concept_name,
        objective: concept.concept_description,
        nc: concept.nc_reference ?? '',
        strand: concept.strand ?? '',
      },
      stage,
      previousConcepts: previous,
      city,
      country,
      interests: [...(Array.isArray(child.interests) ? child.interests : []), ...(Array.isArray(child.subjects) ? child.subjects : [])],
      learningStyle: child.learning_style || child.learn_style || '',
      readingLevel: child.reading_level || '',
      focusTime: child.focus_time || '',
    })

    let lesson = null
    for (let attempt = 0; attempt < 2 && !lesson; attempt++) {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2500,
        system,
        messages: [{ role: 'user', content: userPrompt }],
      })
      const text = msg.content.map(b => (b.type === 'text' ? b.text : '')).join('')
      lesson = parseLesson(text)
    }
    if (!lesson) return NextResponse.json({ error: 'generation_failed' }, { status: 502 })

    return NextResponse.json({
      ...lesson,
      concept_id: concept.id,
      concept_name: concept.concept_name,
      nc_reference: concept.nc_reference,
      stage,
      stage_name: STAGES[stage - 1].name,
      progress: {
        concept_number: index + 1,
        total_concepts: list.length,
        lessons_per_concept: LESSONS_PER_CONCEPT,
        concepts_completed: list.filter(c => (done.get(c.id) ?? 0) >= LESSONS_PER_CONCEPT).length,
      },
    })
  } catch (error: unknown) {
    console.error('[generate-lesson] error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
