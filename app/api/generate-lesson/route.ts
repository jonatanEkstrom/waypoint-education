import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type AgeTier = 'early' | 'young' | 'junior' | 'teen'

function getAgeTier(age_group: string): AgeTier {
  if (['3–4 years', '4–6 years', '5–6 years'].includes(age_group)) return 'early'
  if (['7–9 years'].includes(age_group)) return 'young'
  if (['10–12 years'].includes(age_group)) return 'junior'
  return 'teen'
}

function buildPrompt(params: {
  subject: string
  title: string
  age_group: string
  city: string
  country: string
  curriculum: string
  learn_style: string
  language_learning: string
  interests: string[]
  recent_topics: string[]
  reading_level: string
  focus_time: string
}): string {
  const {
    subject, title, age_group, city, country,
    curriculum, learn_style, language_learning,
    interests, recent_topics, reading_level, focus_time,
  } = params

  const tier = getAgeTier(age_group)
  const interestsStr = Array.isArray(interests) && interests.length ? interests.join(', ') : 'general curiosity'

  const recentStr = Array.isArray(recent_topics) && recent_topics.length
    ? `Avoid repeating these recent topics — build on or contrast them naturally:\n${recent_topics.slice(0, 3).join('\n')}`
    : ''

  const langStr = language_learning && language_learning !== 'None'
    ? `Weave in 1-2 ${language_learning} words or a short phrase directly related to this topic. Show each word in context naturally (e.g. "In Italian, the word for butterfly is *farfalla*").`
    : ''

  const styleGuide: Record<string, string> = {
    'Hands-on & building':      'Activity MUST produce a physical object or involve building something. Movement is central.',
    'Reading & writing':        'Include a writing component (journaling, short report, creative writing). Content should be text-rich.',
    'Visual & video':           'Activity involves drawing, mapping, or creating a visual. Describe things vividly so the child can picture them.',
    'Discussion & exploration': 'Frame everything as discovery. Discussion questions are the heart of the lesson. Activity is observation-based.',
    'Visual':                   'Include a drawing or visual activity. Use vivid imagery in all descriptions.',
    'Auditory':                 'Use rhythm, rhyme, or verbal explanation. Include a verbal or musical element.',
    'Kinesthetic':              'Activity MUST involve movement, physical manipulation, or building. Engage the body first.',
    'Reading/Writing':          'Include a writing component. Make the content text-rich with a journaling or composition task.',
  }
  const styleHint = styleGuide[learn_style] || 'Balance clear explanation with a hands-on activity.'

  const philGuide: Record<string, string> = {
    'Unschooling':      'Frame everything as natural discovery — never feel like a formal lesson. Let curiosity lead.',
    'Classical':        'Ground in the great conversation of ideas. Reference a historical figure or classical source where natural.',
    'Charlotte Mason':  'Use living, narrative prose. Bring in nature where possible. Short focused sessions with gentle narration prompts.',
    'Montessori':       'Hands-on and self-directed. Activity is concrete, orderly, and repeatable. Materials are simple and purposeful.',
    'Eclectic':         'Balance rich content, hands-on activity, and open discussion. Best of all worlds.',
    'Traditional':      'Clear structure. Sequential, skill-building approach. Step-by-step activity with clear outcomes.',
  }
  const philHint = philGuide[curriculum] || ''

  const readingGuide: Record<string, string> = {
    'letters': 'Child is just learning to read. Use only 1-2 syllable words. Max 6 words per sentence. Sound out any new word phonetically in the text.',
    'early':   'Early reader. Simple, clear sentences. Immediately define any new word in plain language right after using it.',
    'fluent':  'Confident reader. Normal vocabulary is fine. Introduce new terms naturally — trust them to engage with the text.',
  }
  const readingHint = readingGuide[reading_level] || ''

  const focusGuide: Record<string, string> = {
    '15min': 'STRICT: Total active time 10-15 minutes. One simple activity only. Very short, digestible content. No multi-step projects.',
    '30min': 'Total active time 20-30 minutes. One focused activity with 2-3 clear steps.',
    '60min': 'Total active time 45-60 minutes. Multi-step projects, experiments with recorded results, or creative deep-dives are appropriate.',
  }
  const focusHint = focusGuide[focus_time] || ''

  const context = `LESSON: "${title}" (${subject})

CHILD PROFILE:
- Age group: ${age_group}, currently in ${city}, ${country}
- Interests: ${interestsStr}
- Teaching philosophy: ${philHint || 'Eclectic — mix of content, hands-on, and discussion'}
- Learning style: ${styleHint}${readingHint ? `\n- Reading level: ${readingHint}` : ''}${focusHint ? `\n- Focus time: ${focusHint}` : ''}${langStr ? `\n- Language being learned: ${langStr}` : ''}${recentStr ? `\n\n${recentStr}` : ''}

PERSONALIZATION RULES (apply to every field):
- Reference ${city} or ${country} in at least one concrete example
- Connect to at least one of their interests (${interestsStr})
- Match vocabulary and sentence length to the reading level above
- Every activity must be doable anywhere in the world with no or minimal materials
- Be specific, vivid, and accurate — never vague or generic
- Address the child directly as "you" throughout — warm and personal`

  // ── EARLY EXPLORERS (4–6) ────────────────────────────────────────────────────
  if (tier === 'early') {
    return `You are a gifted early-years educator creating a magical lesson for a ${age_group} child.
Return ONLY valid JSON — no markdown, no extra text.

${context}

Make this feel like a wonderful story and adventure, not schoolwork. Every word should spark wonder.
Use the simplest possible language. Short sentences. Concrete comparisons to things a 5-year-old knows: toys, food, animals, bedtime.

OUTPUT this exact JSON (every field is required, no field may be null or empty):
{
  "reading_title": "A warm, exciting lesson title a 5-year-old would love — specific to the topic",
  "introduction": "A magical 3-4 sentence opening story that transports the child into the topic. Start with 'Once upon a time...', 'Imagine you are...', or a vivid scene. Set it in ${city} or a magical version of it. Pure wonder — no dry facts yet.",
  "story": "4-5 sentences continuing the story through a relatable character: a friendly animal, a child just like them, or a magical creature. Use comparisons to things they know. Make it funny or surprising. End with a little mystery or question that the lesson will answer.",
  "main_content": "3-4 concrete facts about this topic, written like you are talking directly to a curious 5-year-old. Start each fact with 'Did you know...' or 'Here is something amazing...'. Max 2 short sentences per fact. Use size comparisons ('as big as your bed'), sound comparisons ('it sounds like when you sneeze'), and animal analogies.",
  "activity": {
    "title": "A fun, action-based name like 'The Magic Leaf Hunt' or 'Counting Stars Game'",
    "materials": "Simple items — paper, crayons, leaves, rocks, household objects. Or: 'No materials needed'",
    "time": "10-15 minutes",
    "description": "3-4 steps written directly to the child using 'you'. Start each step with a number and an action word. Very concrete. Make it feel like a game. End with something to show, share, or display."
  },
  "discussion_questions": [
    "A simple wondering question a parent and child can explore together: 'Why do you think...?' or 'What would happen if...?'",
    "A connection to their everyday life: 'Have you ever seen...?' or 'Can you think of a time when...?'",
    "A silly or imaginative question: 'If you were a [topic creature or thing], what would you do all day?'"
  ],
  "fun_fact": "One genuinely jaw-dropping fact for a young child. Start with 'Guess what!' or 'Here is the coolest thing:'. Use a comparison they will instantly understand.",
  "rhyme": "A short 4-line rhyme or chant that helps remember the key concept from this lesson. Catchy, rhythmic, and easy to repeat. Must directly relate to the topic of ${title}. Example format: Line 1 / Line 2 / Line 3 / Line 4",
  "quiz": [
    { "question": "A very simple question about the main idea — max 8 words", "options": ["Wrong but believable", "The correct answer in simple words", "A silly wrong answer"], "correct": 1 },
    { "question": "A second easy question about something concrete from the lesson", "options": ["The correct answer in simple words", "A wrong answer", "Another wrong answer"], "correct": 0 }
  ],
  "parent_tip": "One warm, practical sentence for the parent: how to continue this learning naturally during the day — at mealtimes, on a walk, at bedtime, or in the bath."
}`
  }

  // ── YOUNG ADVENTURERS (7–9) ──────────────────────────────────────────────────
  if (tier === 'young') {
    return `You are an expert educator creating an exciting lesson for a ${age_group} child.
Return ONLY valid JSON — no markdown, no extra text.

${context}

This child is curious, energetic, and loves facts that make them say "WOW!". Make the lesson feel like an expedition.
Use clear, enthusiastic language. Introduce new vocabulary but always define it simply.

OUTPUT this exact JSON (every field is required, no field may be null or empty):
{
  "reading_title": "An exciting, specific title — like a magazine headline for curious kids. Makes them want to read immediately.",
  "introduction": "Open with a genuinely surprising or funny WOW-fact about this topic — something that makes an 8-year-old gasp or laugh out loud. Then 2-3 sentences pulling them into the topic with a vivid image or urgent question. Make them immediately curious.",
  "story": "4-5 sentences setting a vivid scene. Connect the topic to ${city} or ${country}, or to a real adventure, discovery, or moment in history. Use a real person, event, or place where possible. Make it feel like they are right there watching it happen.",
  "main_content": "4-6 key facts and ideas in enthusiastic, clear prose — 2-3 short paragraphs (separated by \\n\\n). Use analogies and real-world comparisons. Introduce 2-3 important vocabulary words — define each one simply in brackets right after first use. Include cause-and-effect. Keep the energy high throughout.",
  "activity": {
    "title": "An exciting project name — sounds like something a real scientist, artist, or explorer would do",
    "materials": "Common household items, paper, outdoor materials, or 'No materials needed'",
    "time": "${focus_time === '15min' ? '15-20 minutes' : focus_time === '60min' ? '35-45 minutes' : '20-30 minutes'}",
    "description": "4-6 numbered steps with a clear, satisfying outcome. Mix creative or scientific with hands-on. Include: what to observe, test, draw, measure, build, or write. End with what they will discover or be able to show."
  },
  "discussion_questions": [
    "An open question with no single right answer — invites genuine thinking and a real conversation between parent and child",
    "A question connecting this topic to their daily life in ${city} or to their interests (${interestsStr})",
    "A challenging speculation question: 'What do you think would happen if...?' or 'Why do you think people...?'"
  ],
  "fun_fact": "One mind-blowing extension fact that goes beyond the lesson — something that sparks even further curiosity. Start with 'Mind-blowing bonus:' or 'Here is something even MORE astonishing:'",
  "quiz": [
    { "question": "A clear question testing understanding of the main concept", "options": ["Plausible wrong answer", "The correct answer", "Another plausible wrong answer"], "correct": 1 },
    { "question": "A question about one of the vocabulary words or key facts from the lesson", "options": ["The correct answer", "A wrong answer", "Another wrong answer"], "correct": 0 },
    { "question": "A thinking question: 'Which of these is an example of...?' or 'What causes...?'", "options": ["A wrong example", "Another wrong example", "The correct example"], "correct": 2 }
  ],
  "parent_tip": "1-2 sentences. A specific conversation starter for dinner, a free online resource (named YouTube channel or website), or a nearby place in or around ${city} to extend this today."
}`
  }

  // ── JUNIOR SCHOLARS (10–12) ──────────────────────────────────────────────────
  if (tier === 'junior') {
    return `You are an expert educator creating a rigorous, engaging lesson for a ${age_group} child.
Return ONLY valid JSON — no markdown, no extra text.

${context}

This child is ready for real intellectual challenge — depth, nuance, and abstract thinking. Write with the confidence of a knowledgeable adult addressing a serious young learner. No dumbing down.

OUTPUT this exact JSON (every field is required, no field may be null or empty):
{
  "reading_title": "A sophisticated, specific title — like a chapter heading in a quality non-fiction book for young people",
  "introduction": "Open with a real-world mystery, unsolved problem, or surprising controversy related to this topic. 3-4 sentences that create genuine intellectual tension. Make them feel they are about to explore something that genuinely matters.",
  "story": "4-6 sentences of rich context. A real event, discovery, historical moment, or current situation in ${city}, ${country}, or connected to their interests (${interestsStr}). Be specific — name real people, places, dates, and numbers. No vague generalities.",
  "main_content": "3 solid paragraphs (separated by \\n\\n) of high-quality educational content. Use proper subject terminology (define inline on first use). Include: historical or scientific context, how this topic connects to other subjects, cause and effect, and real specific examples. Write as a knowledgeable adult addressing a serious young learner.",
  "activity": {
    "title": "A project name implying a tangible outcome: 'Write a...', 'Build a...', 'Design a...', 'Conduct a...'",
    "materials": "Common items — notebook, pencil, ruler, household objects, or outdoor materials",
    "time": "${focus_time === '15min' ? '20-25 minutes' : focus_time === '60min' ? '45-55 minutes' : '30-40 minutes'}",
    "description": "5-7 numbered steps producing a real outcome: a written report, annotated diagram, experiment with recorded results, debate preparation, or creative piece. Include what to observe, record, or present at the end. Describe what a strong outcome looks like."
  },
  "discussion_questions": [
    "A critical thinking question presenting two sides: 'Some people think X, while others argue Y — what is your view and why?'",
    "A local connection question: how does this topic specifically affect or appear in ${city} or ${country}?",
    "A cross-subject question connecting this topic to history, science, mathematics, or current events"
  ],
  "fun_fact": "A genuinely sophisticated extension fact that surprises even knowledgeable adults. Reference a real discovery, person, or statistic.",
  "vocabulary": [
    { "word": "Key subject term 1 used in the lesson", "definition": "Clear, precise definition a 10-12 year old can understand and use correctly" },
    { "word": "Key subject term 2", "definition": "Definition" },
    { "word": "Key subject term 3", "definition": "Definition" },
    { "word": "Key subject term 4", "definition": "Definition" }
  ],
  "perspectives": "Present two clearly different viewpoints or interpretations of a key contested aspect of this topic. Label them (e.g. 'View 1: Historians who argue...' vs 'View 2: Others contend...'). Give each view 2-3 sentences with the strongest form of the argument. End with: 'Which perspective do you find more convincing, and what evidence supports your view?'",
  "research_prompt": "One specific research question that cannot be answered from this lesson alone — it requires looking something up, visiting a library, or asking an expert. Make it genuinely interesting and open-ended.",
  "quiz": [
    { "question": "A question testing understanding of a key concept from the main content", "options": ["The correct answer", "A plausible wrong answer", "Another plausible wrong answer"], "correct": 0 },
    { "question": "A vocabulary question: 'What does [key term from the vocabulary list] mean?'", "options": ["A wrong definition", "The correct definition", "Another wrong definition"], "correct": 1 },
    { "question": "A higher-order question: 'Which of these best explains why...?' or 'What is an example of...?'", "options": ["A wrong answer", "Another wrong answer", "The correct answer"], "correct": 2 },
    { "question": "A cross-subject or real-world application question from the lesson", "options": ["The correct answer", "A wrong answer", "Another wrong answer"], "correct": 0 }
  ],
  "parent_tip": "2 sentences. Suggest a substantive dinner conversation (specific, not just 'ask what they learned') and one specific documentary, book, museum, or website relevant to ${city} or ${country}."
}`
  }

  // ── INDEPENDENT THINKERS (13–18) ─────────────────────────────────────────────
  return `You are an expert educator creating a rigorous academic lesson for a ${age_group} student.
Return ONLY valid JSON — no markdown, no extra text.

${context}

This student is capable of near-GCSE or high school level engagement. Treat them as an intelligent young adult. Challenge their thinking, not just their recall. Reference real events, thinkers, discoveries, and primary sources.

OUTPUT this exact JSON (every field is required, no field may be null or empty):
{
  "reading_title": "An intellectually provocative academic title — could appear as a chapter in a serious non-fiction book or quality journal article",
  "introduction": "Open with a complex real-world problem, ethical dilemma, or contested question related to this topic. 4-5 sentences establishing genuine stakes — why this topic matters in the real world today. Reference something specific to ${country} or a current global situation where natural.",
  "story": "5-6 sentences introducing a real case study, historical episode, scientific discovery, or current controversy that exemplifies the core tension of this topic. Name real people, institutions, dates, and places. Be specific and intellectually rigorous.",
  "main_content": "3-4 substantial paragraphs (separated by \\n\\n) of high-quality academic content at or near GCSE/high school level. Include: correct subject terminology used precisely, historical and geographical context, relevant data or quantified examples, connections across disciplines. Reference real events, thinkers, discoveries, or institutions. This should read like the best pages of a quality non-fiction book written for a serious young reader.",
  "activity": {
    "title": "An academically rigorous task: 'Write a structured essay on...', 'Analyse and evaluate...', 'Design and conduct an experiment into...', 'Prepare a structured debate on...'",
    "materials": "Notebook and pen — or specific materials if the task is experiment-based",
    "time": "${focus_time === '15min' ? '25-35 minutes' : focus_time === '60min' ? '50-60 minutes' : '35-45 minutes'}",
    "description": "6-8 numbered steps leading to a substantive outcome: a structured essay with clear argument, annotated source analysis, experiment with hypothesis and recorded results, or structured debate preparation with sourced evidence. Include what a high-quality response demonstrates."
  },
  "discussion_questions": [
    "A genuinely difficult ethical or philosophical question with no comfortable answer — requires taking a defensible position",
    "A question connecting this topic to ${country}'s specific history, geography, economy, or current political situation",
    "A cross-disciplinary question: how does this topic intersect with [a different subject area] in a non-obvious way?"
  ],
  "fun_fact": "A sophisticated, surprising fact that challenges common assumptions. Reference cutting-edge research, a counterintuitive historical finding, or something that overturns a widespread misconception.",
  "vocabulary": [
    { "word": "Academic subject term 1", "definition": "Precise, university-adjacent definition that captures the full meaning" },
    { "word": "Academic subject term 2", "definition": "Definition" },
    { "word": "Academic subject term 3", "definition": "Definition" },
    { "word": "Academic subject term 4", "definition": "Definition" },
    { "word": "Academic subject term 5", "definition": "Definition" }
  ],
  "perspectives": "Present 3 distinct viewpoints or schools of thought on a key contested aspect of this topic. Each perspective gets 2-3 sentences presenting the strongest version of that position. Label them clearly (e.g. 'The liberal institutionalist view', 'The realist critique', 'The post-colonial perspective'). End with: 'Having considered all three, write a paragraph arguing for the position you find most intellectually defensible — use evidence from the lesson and your own reasoning.'",
  "essay_prompt": "A proper academic essay question with: (1) the question itself — genuinely debatable, not recall-based; (2) key terms the student must define; (3) brief guidance on what a strong argument would include; (4) suggested structure: introduction with clear thesis, 2-3 body paragraphs each with a claim, evidence, and analysis, conclusion. Target 250-400 words.",
  "socratic_questions": [
    "A deep philosophical or epistemological question related to this topic — no easy answer, could generate hours of discussion",
    "A question about hidden assumptions: 'What are we taking for granted when we claim that...?'",
    "A question about implications and consequences: 'If [a key claim from the lesson] is true, what must follow — and what does that mean for how we act?'"
  ],
  "further_reading": [
    "Specific book title, author, and one sentence on why it is relevant — real and verifiable",
    "Specific documentary title or named YouTube channel — real, verifiable, and genuinely relevant to this topic",
    "Specific reputable organisation or website with a brief description of what to explore there"
  ],
  "quiz": [
    { "question": "A comprehension question on a key point from the academic content", "options": ["A plausible wrong answer", "The correct answer", "Another plausible wrong answer"], "correct": 1 },
    { "question": "A terminology question: 'Which definition best captures the meaning of [key term]?'", "options": ["The correct definition", "A plausible wrong definition", "Another wrong definition"], "correct": 0 },
    { "question": "An analysis question: 'Which of these best explains why...?' or 'Which statement is most accurate about...?'", "options": ["A wrong answer", "The correct answer", "A plausible wrong answer"], "correct": 1 },
    { "question": "An evaluation question requiring judgment about the content", "options": ["A wrong answer", "Another wrong answer", "The correct answer"], "correct": 2 }
  ],
  "parent_tip": "2-3 sentences for the parent. Suggest a specific dinner conversation that goes beyond the lesson content, and one concrete next step: a named local institution (museum, university open day, professional contact in this field) accessible in or near ${city}."
}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(body) }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const material = JSON.parse(cleaned)

    return NextResponse.json({ material })
  } catch (error: any) {
    console.error('Generate lesson error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
