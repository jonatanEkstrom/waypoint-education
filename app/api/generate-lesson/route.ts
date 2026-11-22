import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAccess } from '@/app/lib/server/access'

import { curriculumBand, teachingGuidance } from '@/app/lib/curriculum'

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const guard = await requireAccess()
  if ('response' in guard) return guard.response

  try {
    const { child_id, subject_slug, city, country } = await request.json()

    const supabase = guard.admin

    // Service role bypasses RLS, so ownership must be checked explicitly.
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('name, age_group, focus_time, reading_level')
      .eq('id', child_id)
      .eq('user_id', guard.user.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'child_not_found' }, { status: 404 })
    }

    const { data: ageGroup, error: ageGroupError } = await supabase
      .from('age_groups')
      .select('id')
      .eq('label', curriculumBand(child.age_group))
      .single()

    if (ageGroupError || !ageGroup) {
      return NextResponse.json({ error: 'age_group_not_found' }, { status: 200 })
    }

    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', subject_slug)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'subject_not_found' }, { status: 404 })
    }

    const { data: completedProgress, error: progressError } = await supabase
      .from('child_progress')
      .select('concept_id')
      .eq('child_id', child_id)
      .eq('status', 'completed')

    if (progressError) throw progressError

    const completedIds = (completedProgress ?? []).map((p) => p.concept_id)

    let conceptQuery = supabase
      .from('curriculum_concepts')
      .select('id, concept_key, concept_name, concept_description, sequence_order')
      .eq('subject_id', subject.id)
      .eq('age_group_id', ageGroup.id)
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

    if (!concept) {
      return NextResponse.json({ error: 'all_complete' }, { status: 200 })
    }

    const systemPrompt = `You are a children's lesson writer. Write a lesson that teaches EXACTLY one concept, and no other:

Concept: ${concept.concept_name}
Description: ${concept.concept_description}
Learner: ${child.age_group}
Teaching guidance: ${teachingGuidance(child.age_group)}
Reading level: ${child.reading_level || "unspecified"}
Preferred focus time: ${child.focus_time || "unspecified"}. Use the shorter of this and the teaching guidance; split longer work into steps with movement breaks.

Do not introduce, explain, or drift into any other topic or concept, even if it seems related. The child's city (${city}, ${country}) may only be used as a backdrop or setting for examples — it must never change the subject matter or pull in unrelated topics. Stay strictly within the bounds of the concept above for the entire lesson.`

    const userPrompt = `Create a short lesson for ${child.name} on the concept "${concept.concept_name}". Return ONLY valid JSON, no markdown.

OUTPUT this exact JSON:
{
  "concept_id": "${concept.id}",
  "reading_title": "Specific lesson title",
  "introduction": "Exactly 2 sentences introducing the topic. Reference ${city} as a backdrop.",
  "main_content": "Point 1 in 1 sentence.\\n\\nPoint 2 in 1 sentence.\\n\\nPoint 3 in 1 sentence.",
  "example": "One concrete example illustrating the concept.",
  "activity": {
    "title": "Activity name",
    "materials": "Materials or 'None needed'",
    "time": "Short duration consistent with the teaching guidance",
    "description": "3-4 sentences describing what to do."
  },
  "discussion_questions": ["One open-ended question about the topic."],
  "check_for_understanding": "One quick task, with a separate note for the parent describing what a correct response demonstrates.",
  "fun_fact": "One surprising fact in 1 sentence.",
  "parent_tip": "One practical tip for the parent."
}`

    const stream = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPrompt,
      stream: true,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error: any) {
    console.error('Generate lesson error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
