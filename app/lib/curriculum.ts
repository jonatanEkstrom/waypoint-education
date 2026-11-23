export const AGE_GROUPS = ['3–4 years', '5–6 years', '7–9 years', '10–12 years', '13–15 years', '16–18 years'] as const

export function curriculumBand(age: string) {
  const label = age.replace(/[‐-―]/g, '-').replace(/\byears?\b/gi, '').replace(/\s/g, '')
  if (label === '4-6') return '5-6'
  if (['13-15', '16-18'].includes(label)) return '13+'
  return label
}

export const CURRICULUM_SUBJECTS: Record<string, string> = {
  Math: 'mathematics',
  Mathematics: 'mathematics',
  Science: 'science',
  'Language Arts': 'english',
  'Writing & Language': 'english',
  Language: 'english',
  Languages: 'english',
  English: 'english',
  Geography: 'geography',
  History: 'history',
}

export function teachingGuidance(age: string) {
  const band = curriculumBand(age)
  if (band === '3-4') return 'Adult-led play for 3–5 minutes. Use objects, movement and spoken answers. No independent reading or writing.'
  if (band === '5-6') return 'Use concrete objects or drawing, one instruction at a time and a 5–8 minute activity. Offer oral or hands-on answers.'
  if (band === '7-9') return 'Use a worked example and a 5–10 minute activity. Move from objects or drawings to simple notation when the concept calls for it.'
  if (band === '10-12') return 'Use a 10–15 minute activity. Ask for a short explanation and connect representations without introducing a new concept.'
  if (/16\s*[–-]\s*18/.test(age)) return 'Use independent reasoning, precise vocabulary and evidence or justification, while keeping the selected concept fixed.'
  return 'Use accessible secondary-school vocabulary and a real-world application. Ask the student to justify a choice at the selected concept level.'
}
