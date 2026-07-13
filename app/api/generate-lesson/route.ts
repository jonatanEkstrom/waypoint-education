import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// children.age_group is stored as a free-text label like "5–6 years" (en-dash + "years"),
// while age_groups.label is a plain "5-6" range. Normalize before matching.
function normalizeAgeGroup(raw: string): string {
  const hyphenated = raw.replace(/[‐-―]/g, '-')
  const range = hyphenated.match(/\d+\s*-\s*\d+/)
  if (range) return range[0].replace(/\s+/g, '')
  return hyphenated.replace(/\byears?\b/gi, '').trim()
}

export async function POST(request: NextRequest) {
  try {
    const { child_id, subject_slug, city, country } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: child, error: childError } = await supabase
      .from('children')
      .select('name, age_group')
      .eq('id', child_id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'child_not_found' }, { status: 404 })
    }

    const { data: ageGroup, error: ageGroupError } = await supabase
      .from('age_groups')
      .select('id')
      .eq('label', normalizeAgeGroup(child.age_group))
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

    const { data: completedProgress } = await supabase
      .from('child_progress')
      .select('concept_id')
      .eq('child_id', child_id)
      .eq('status', 'completed')

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
    "time": "10-15 min",
    "description": "3-4 sentences describing what to do."
  },
  "discussion_questions": ["One open-ended question about the topic."],
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
