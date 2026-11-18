# Waypoint curriculum

Source of truth for `public.curriculum_concepts`. One file per subject; each
file has one array per age band, in teaching order.

Each concept: `[key, name, objective, nc_reference, strand]`

- `objective` is written for the lesson generator: what the child should be able
  to do after the concept's three lessons (Discover → Practise → Explore).
- `nc_reference` names the England National Curriculum (or EYFS for 3–4) year
  group and programme-of-study domain the concept supports. It is an alignment
  label for parents and LA reports, not a statutory citation.

Age bands → National Curriculum stage:

| Band  | Stage                      |
|-------|----------------------------|
| 3-4   | EYFS (Nursery/Reception)   |
| 5-6   | Reception – Year 1 (KS1)   |
| 7-9   | Years 2–4 (KS1–Lower KS2)  |
| 10-12 | Years 5–7 (Upper KS2–KS3)  |
| 13+   | Years 8–9 (KS3)            |

The app syncs these files into the database automatically (see
`app/lib/server/curriculum.ts`): the first lesson request after a deploy that
changed them upserts the concepts. Validate edits with
`node supabase/curriculum/build-seed.mjs --check`.
