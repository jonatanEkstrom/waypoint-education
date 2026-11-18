import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import mathematics from '@/supabase/curriculum/mathematics.json'
import english from '@/supabase/curriculum/english.json'
import science from '@/supabase/curriculum/science.json'
import geography from '@/supabase/curriculum/geography.json'

type ConceptTuple = [string, string, string, string, string]
type SubjectFile = { subject: string; name: string; bands: Record<string, ConceptTuple[]> }

export const SUBJECT_FILES = [mathematics, english, science, geography] as unknown as SubjectFile[]
export const AGE_BANDS = ['3-4', '5-6', '7-9', '10-12', '13+'] as const
export type AgeBand = (typeof AGE_BANDS)[number]

export const SUBJECTS: { slug: string; name: string }[] =
  SUBJECT_FILES.map(f => ({ slug: f.subject, name: f.name }))

export const CURRICULUM_VERSION = createHash('sha1')
  .update(JSON.stringify(SUBJECT_FILES))
  .digest('hex')
  .slice(0, 12)

/** Lessons per concept: Discover → Practise → Explore. */
export const LESSONS_PER_CONCEPT = 3

/**
 * Maps the age label stored on a child ("3–4 years", "10–12 years", "13+ years",
 * or an older free-text value) to a curriculum band.
 */
export function ageBandFor(raw: string | null | undefined): AgeBand {
  const s = (raw ?? '').replace(/[‐-―]/g, '-').replace(/\byears?\b/gi, '').replace(/\s+/g, '')
  if ((AGE_BANDS as readonly string[]).includes(s)) return s as AgeBand
  if (s.includes('+')) return '13+'
  // Older labels and ranges ("4-6", "7-8", "13-15"): use the middle of the range.
  const range = s.match(/^(\d+)-(\d+)/)
  const n = range ? (Number(range[1]) + Number(range[2])) / 2 : parseInt(s, 10)
  if (Number.isFinite(n)) {
    if (n <= 4) return '3-4'
    if (n <= 6) return '5-6'
    if (n <= 9) return '7-9'
    if (n <= 12) return '10-12'
    return '13+'
  }
  return '7-9'
}

let syncedVersion: string | null = null

/**
 * Makes sure the database holds the curriculum shipped with this build.
 * Cheap when already in sync (one cached flag per server instance, one
 * key lookup otherwise). Safe to run concurrently: every write is an upsert.
 */
export async function ensureCurriculum(admin: SupabaseClient): Promise<void> {
  if (syncedVersion === CURRICULUM_VERSION) return

  const { data: meta } = await admin.from('app_meta').select('value').eq('key', 'curriculum_version').maybeSingle()
  if (meta?.value === CURRICULUM_VERSION) { syncedVersion = CURRICULUM_VERSION; return }

  const { error: subjErr } = await admin.from('subjects').upsert(
    SUBJECT_FILES.map((f, i) => ({ slug: f.subject, name: f.name, sort: i + 1 })),
    { onConflict: 'slug' }
  )
  if (subjErr) throw subjErr

  const [{ data: subjects, error: sErr }, { data: bands, error: bErr }] = await Promise.all([
    admin.from('subjects').select('id, slug'),
    admin.from('age_groups').select('id, label'),
  ])
  if (sErr) throw sErr
  if (bErr) throw bErr
  const subjectId = new Map((subjects ?? []).map(s => [s.slug, s.id]))
  const bandId = new Map((bands ?? []).map(b => [b.label, b.id]))

  const rows: Record<string, unknown>[] = []
  for (const f of SUBJECT_FILES) {
    for (const band of AGE_BANDS) {
      const sid = subjectId.get(f.subject)
      const bid = bandId.get(band)
      if (!sid || !bid) throw new Error(`Missing subject/band row for ${f.subject}/${band}`)
      f.bands[band].forEach(([key, name, objective, nc, strand], i) => {
        rows.push({
          concept_key: key, concept_name: name, concept_description: objective,
          nc_reference: nc, strand, sequence_order: i + 1, subject_id: sid, age_group_id: bid,
        })
      })
    }
  }

  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await admin.from('curriculum_concepts').upsert(rows.slice(i, i + 200), { onConflict: 'concept_key' })
    if (error) throw error
  }

  // Remove concepts no longer in the source (and subjects with nothing left).
  const keep = new Set(rows.map(r => r.concept_key as string))
  const { data: existing } = await admin.from('curriculum_concepts').select('id, concept_key')
  const stale = (existing ?? []).filter(c => !keep.has(c.concept_key)).map(c => c.id)
  if (stale.length) await admin.from('curriculum_concepts').delete().in('id', stale)
  await admin.from('subjects').delete().not('slug', 'in', `(${SUBJECTS.map(s => s.slug).join(',')})`)

  await admin.from('app_meta').upsert({ key: 'curriculum_version', value: CURRICULUM_VERSION, updated_at: new Date().toISOString() })
  syncedVersion = CURRICULUM_VERSION
}
