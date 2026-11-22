type EnglishGoal = {
  prerequisite: string
  activity: string
  check: string
  success: string
}

// England's primary English programmes informed the activities and checks.
// https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study
const goals: Readonly<Record<string, EnglishGoal>> = {
  e56_phonics_digraphs: {
    prerequisite: "Match some single letters to sounds.",
    activity: "Slide s and h together on letter cards and blend ship and shop.",
    check: "Point to the letters making /sh/ in shop and read the word.",
    success: "Treats sh as one sound and blends the remaining sounds in order.",
  },
  e56_blend_cvc: {
    prerequisite: "Say the sounds for the letters in the chosen word.",
    activity: "Move a counter for each sound in map, then sweep across the counters and say the word.",
    check: "Read a new decodable word such as sit without a picture clue.",
    success: "Blends the sounds in order to read sit.",
  },
  e56_ccvc: {
    prerequisite: "Blend three-sound words confidently.",
    activity: "Use four sound boxes for stop and blend adjacent consonants without dropping one.",
    check: "Read clap and point to each sound as you go.",
    success: "Includes all four sounds and blends them into clap.",
  },
  e56_vowel_teams: {
    prerequisite: "Blend familiar consonants with a short vowel.",
    activity: "Compare rain and train using the same familiar ai spelling.",
    check: "Read tail and underline the letters making the vowel sound.",
    success: "Reads tail and points to ai as the spelling of its vowel sound.",
  },
  e56_split_digraph: {
    prerequisite: "Read words with short vowels.",
    activity: "Build cap with letter cards and add e to make cape, then compare pronunciations.",
    check: "Read kit and kite and explain what changed.",
    success: "Reads both words and identifies the i–e spelling as the clue in kite.",
  },
  e56_tricky_words: {
    prerequisite: "Blend words with familiar spellings.",
    activity: "Map the expected and less expected sounds in a small set such as said and was.",
    check: "Read said in a short sentence and point to its unusual spelling.",
    success: "Reads said and identifies ai as the unusual part in this word.",
  },
  e56_endings: {
    prerequisite: "Read a simple base word.",
    activity: "Build jump, jumps, jumped and jumping and match each to a sentence.",
    check: "Read jumping and show which part stays the same.",
    success: "Recognises jump as the base and reads the ending as part of the word.",
  },
  e56_segment_spell: {
    prerequisite: "Say the sounds in a simple spoken word.",
    activity: "Say a word aloud, move a counter for each sound, then replace counters with letters.",
    check: "Spell fish from dictation and explain which letters represent its last sound.",
    success: "Writes fish and maps its final sound to sh.",
  },
  e56_days_spelling: {
    prerequisite: "Sequence the days orally.",
    activity: "Build day-name cards by noticing shared endings and distinctive letters, then write a weekly label.",
    check: "Write Monday from memory and check it against the card.",
    success: "Writes Monday with a capital and its letters in order.",
  },
  e56_letter_formation: {
    prerequisite: "Recognise the target letter by sight.",
    activity: "Trace a large model and then form the letter on paper using a consistent starting point.",
    check: "Write the target letter twice without tracing.",
    success: "Forms a recognisable letter with consistent orientation and direction.",
  },
  e56_capitals: {
    prerequisite: "Know what a sentence and a name are.",
    activity: "Sort labels and sentences, then add capital letters at the start and for names.",
    check: "Fix 'mia saw a boat.'",
    success: "Writes Mia with a capital at the start of the sentence.",
  },
  e56_finger_spaces: {
    prerequisite: "Say a short sentence as separate words.",
    activity: "Move a token for each spoken word and leave a space between words when writing.",
    check: "Rewrite 'Iseetheboat.' so the words are easy to read.",
    success: "Separates I, see, the and boat without spaces inside words.",
  },
  e56_full_stops: {
    prerequisite: "Recognise a complete spoken statement.",
    activity: "Read two short statements aloud and mark where each thought ends.",
    check: "Add full stops to two clearly separated statements.",
    success: "Places a full stop at both sentence boundaries.",
  },
  e56_question_marks: {
    prerequisite: "Distinguish asking from telling.",
    activity: "Sort spoken statements, questions and exclamations and choose punctuation cards.",
    check: "Punctuate 'Where is the bus' and 'Watch out' for their intended meanings.",
    success: "Uses a question mark for the query and an exclamation mark for the warning.",
  },
  e56_and_joining: {
    prerequisite: "Say two related ideas clearly.",
    activity: "Join pairs of words or two short related clauses with and.",
    check: "Join 'I packed a hat' and 'I packed a book'.",
    success: "Makes a clear sentence using and and keeps both pieces of information.",
  },
  e56_say_write_sentence: {
    prerequisite: "Say a complete idea about a picture.",
    activity: "Say one sentence, count its words, write it and read it back.",
    check: "Say and write one sentence about a boat arriving.",
    success: "Writes a readable sentence matching the spoken idea, with spaces and appropriate punctuation.",
  },
  e56_postcard: {
    prerequisite: "Write a short sentence to a reader.",
    activity: "Make a pretend postcard with a greeting, one detail and a sign-off.",
    check: "Write a postcard about a place with one thing the reader can picture.",
    success: "Includes a greeting, a specific detail and a sign-off.",
  },
  e56_sequence_writing: {
    prerequisite: "Use first, next and last orally.",
    activity: "Arrange three pictures of a simple outing and caption them in order.",
    check: "Read your captions in order and show what happened last.",
    success: "Matches each caption to its picture and preserves the event order.",
  },
  e56_listen_stories: {
    prerequisite: "Listen to a short spoken passage.",
    activity: "Read a short story aloud and pause for the learner to recall who did what.",
    check: "Name the main character and tell one thing they did.",
    success: "Accurately recalls a character and an action from the story.",
  },
  e56_key_stories: {
    prerequisite: "Recall a character and an event.",
    activity: "Use three pictures to retell a familiar traditional tale in your own words.",
    check: "Retell the beginning, a key event and the ending.",
    success: "Includes meaningful events in a sensible order.",
  },
  e56_predict: {
    prerequisite: "Recall one detail from a story.",
    activity: "Pause before the ending and make a prediction from something heard or seen.",
    check: "Say what might happen next and name your clue.",
    success: "Gives a plausible prediction and links it to a specific clue.",
  },
  e56_title_events: {
    prerequisite: "Recall the order of two events.",
    activity: "Read a short cause-and-effect story and connect events with because.",
    check: "Explain why a character opens an umbrella in the supplied story.",
    success: "Cites the relevant detail from the story and gives a coherent reason.",
  },
  e56_poems_by_heart: {
    prerequisite: "Repeat a short spoken phrase.",
    activity: "Practise an original two-line rhyme with actions and repeated reading.",
    check: "Recite the two lines using the actions if helpful.",
    success: "Recites the selected lines recognisably with their rhythm.",
  },
  e56_non_fiction: {
    prerequisite: "Recognise that a book can give facts.",
    activity: "Look through a short fact page and use a heading or picture to find an answer.",
    check: "Find one fact and point to where it appears.",
    success: "States an accurate fact and identifies its source on the page.",
  },
  e56_adjectives: {
    prerequisite: "Name a thing shown in a picture.",
    activity: "Describe two similar objects by adding a word about their appearance or texture.",
    check: "Add two useful describing words to help someone find a bag.",
    success: "Chooses words that describe the bag and help distinguish it.",
  },
  e56_plurals: {
    prerequisite: "Count and distinguish one from more than one.",
    activity: "Label pictures of one and several objects using regular -s and -es forms.",
    check: "Change cat and box to their plural forms.",
    success: "Writes cats and boxes and connects each to more than one.",
  },
  e56_prefix_un: {
    prerequisite: "Know the meaning of a simple base word.",
    activity: "Compare happy and unhappy in two illustrated scenes.",
    check: "Explain how adding un- changes kind.",
    success: "Recognises unkind as not kind and keeps the base spelling.",
  },
  e56_labels_captions: {
    prerequisite: "Name objects in pictures.",
    activity: "Add short labels to a map picture and one caption explaining the whole scene.",
    check: "Write a label for a place and a caption explaining what someone does there.",
    success: "Distinguishes the brief label from the explanatory caption.",
  },
  e56_speaking_show_tell: {
    prerequisite: "Name a familiar object and describe it briefly.",
    activity: "Practise a short show-and-tell using what it is, where it came from and one detail.",
    check: "Tell a listener two clear things about the object and answer one question.",
    success: "Gives two relevant details and responds to the question.",
  },
  e56_signs_menus: {
    prerequisite: "Read familiar words and recognise common signs.",
    activity: "Use a pretend menu and simple signs whose words match the learner’s reading level.",
    check: "Find an item on the menu and explain what an Exit sign tells people.",
    success: "Finds the intended item and interprets the sign in context.",
  },
  e79_suffixes: {
    prerequisite: "Recognise a root word.",
    activity: "Build word families with -ful, -less and -ness and compare their meanings.",
    check: "Use help and -less in a sentence that shows what helpless means.",
    success: "Forms helpless and shows its meaning through the sentence.",
  },
  e79_prefixes: {
    prerequisite: "Recognise a base word and explain its meaning.",
    activity: "Add re-, mis- or dis- to suitable base words and compare meanings.",
    check: "Explain how rewrite differs from write and use it in context.",
    success: "Connects re- to doing the action again and uses the word appropriately.",
  },
  e79_homophones: {
    prerequisite: "Read a sentence and infer its meaning.",
    activity: "Match pairs such as to, too and two with sentences that make the intended meaning clear.",
    check: "Complete 'I bought ___ tickets ___ go on the boat.'",
    success: "Uses two and to and explains the meaning clue for each.",
  },
  e79_apostrophe_contraction: {
    prerequisite: "Read the full forms of common contractions.",
    activity: "Cross out omitted letters on word cards and put the apostrophe in their place.",
    check: "Write do not as a contraction and identify the missing letter.",
    success: "Writes don't and identifies the omitted o.",
  },
  e79_apostrophe_possession: {
    prerequisite: "Recognise a noun and identify who owns an object.",
    activity: "Compare one traveller’s bag with two travellers’ bags using labels.",
    check: "Punctuate 'the guides map' when the map belongs to one guide.",
    success: "Writes the guide's map and explains what the apostrophe shows.",
  },
  e79_commas_lists: {
    prerequisite: "Recognise where a list starts and ends.",
    activity: "Make a travel packing list, then write it as part of a sentence.",
    check: "Punctuate 'We packed hats socks water and maps.'",
    success: "Uses commas between the listed items and retains and before the last item.",
  },
  e79_conjunctions: {
    prerequisite: "Write two related clauses.",
    activity: "Join clause cards with and, but, because or when and discuss how each changes the relationship.",
    check: "Join 'We waited inside' and 'it was raining' to show a reason.",
    success: "Uses because or an equivalent causal conjunction and preserves the meaning.",
  },
  e79_noun_phrases: {
    prerequisite: "Identify a noun and a describing word.",
    activity: "Expand a noun in a picture using precise modifiers and a detail about its position.",
    check: "Expand 'the boat' so a listener can tell which one you mean.",
    success: "Keeps boat as the head noun and adds details that identify it.",
  },
  e79_tense: {
    prerequisite: "Recognise the action word in a sentence.",
    activity: "Compare a diary entry with a live description and change selected verbs.",
    check: "Change 'I go to the market and buy rice' to past tense.",
    success: "Writes went and bought and keeps the tense consistent.",
  },
  e79_fronted_adverbials: {
    prerequisite: "Identify how a phrase can tell when or where something happens.",
    activity: "Move a time or place phrase to the beginning of a sentence and mark the pause.",
    check: "Start 'We found a shell' with 'After lunch'.",
    success: "Writes 'After lunch, we found a shell' and uses the comma correctly.",
  },
  e79_speech_marks: {
    prerequisite: "Recognise when a character is speaking.",
    activity: "Act out a short exchange and mark the exact words spoken on a script.",
    check: "Punctuate 'Mia said I can help' as direct speech.",
    success: "Quotes only I can help and places the reporting clause comma and closing punctuation appropriately.",
  },
  e79_paragraphs: {
    prerequisite: "Recognise when a text changes topic, time or event.",
    activity: "Group jumbled sentences about two aspects of a trip.",
    check: "Divide a short mixed passage into paragraphs and explain the break.",
    success: "Groups related ideas and identifies the change that signals the new paragraph.",
  },
  e79_handwriting_joined: {
    prerequisite: "Form individual letters clearly.",
    activity: "Practise joining a short set of familiar letters using the learner’s handwriting style.",
    check: "Write a short phrase with two practised joins.",
    success: "Uses the intended joins where appropriate and keeps letters legible and evenly spaced.",
  },
  e79_diary: {
    prerequisite: "Sequence events and use past-tense verbs.",
    activity: "Write from the perspective of a fictional traveller, including an event and a reaction.",
    check: "Write a short diary entry that says what happened and how you felt.",
    success: "Uses a clear first-person account and a relevant reflection.",
  },
  e79_letter: {
    prerequisite: "Recognise that writing changes with audience and purpose.",
    activity: "Draft a short note asking a museum a question and compare it with a note to a friend.",
    check: "Write a polite letter asking for information about an exhibit.",
    success: "Uses a greeting, states a clear request and includes an appropriate sign-off.",
  },
  e79_instructions: {
    prerequisite: "Sequence actions and use action verbs.",
    activity: "Write instructions for folding a simple shape and ask someone to follow them without hints.",
    check: "Write three steps for a simple paper-folding task.",
    success: "Uses ordered steps and precise action verbs that a reader can follow.",
  },
  e79_setting_description: {
    prerequisite: "Choose nouns and descriptive details.",
    activity: "Study a market or harbour image, then describe it using two senses.",
    check: "Write two sentences that help a reader picture the setting.",
    success: "Uses specific sensory details that suit the setting.",
  },
  e79_story_structure: {
    prerequisite: "Retell a short story in order.",
    activity: "Sketch three scenes that introduce a character, create a problem and resolve it.",
    check: "Plan a short story with a believable response to its main problem.",
    success: "Connects the setup, problem and resolution causally.",
  },
  e79_edit_improve: {
    prerequisite: "Reread a short paragraph aloud.",
    activity: "Revise one vague phrase for meaning, then proofread one sentence for punctuation.",
    check: "Improve one detail and correct one error in a supplied draft.",
    success: "Explains how the revision improves meaning and identifies the corrected convention.",
  },
  e79_retrieve: {
    prerequisite: "Read a short paragraph and identify a key word in a question.",
    activity: "Search a short information text for answers and point to the exact phrases.",
    check: "Find when a ferry leaves and what passengers should bring in the text.",
    success: "Retrieves both details accurately and shows where they appear.",
  },
  e79_inference: {
    prerequisite: "Find details that are stated directly.",
    activity: "Read a short scene with an unstated emotion and underline two clues.",
    check: "Infer how the character feels and cite a line that supports it.",
    success: "Gives a reasonable inference grounded in a relevant detail from the passage.",
  },
  e79_summarise: {
    prerequisite: "Identify a topic and key supporting details.",
    activity: "Cross out examples and repetitions in a short text while preserving its main point.",
    check: "Summarise the passage in one or two sentences.",
    success: "Keeps the main idea and necessary details without copying the full passage.",
  },
  e79_vocab_context: {
    prerequisite: "Read the words around an unfamiliar term.",
    activity: "Use clue words in an original short passage to infer a meaning before checking a dictionary.",
    check: "Explain what 'sheltered' means in a passage about a cove protected from wind.",
    success: "Infers protected and cites the wind clue.",
  },
  e79_myths_legends: {
    prerequisite: "Retell the main events of a traditional story.",
    activity: "Compare two short, sourced retellings and consider what each story explains or celebrates.",
    check: "Identify a shared feature and one difference between the stories.",
    success: "Cites details from both stories and avoids treating a cultural tradition as a factual historical account.",
  },
  e79_poetry_performance: {
    prerequisite: "Read a short poem aloud.",
    activity: "Try two readings with different pauses or emphasis and discuss their effects.",
    check: "Perform four lines and explain one deliberate performance choice.",
    success: "Uses an audible choice that supports the meaning or rhythm.",
  },
  e79_poetry_writing: {
    prerequisite: "Notice sound, rhythm or repetition in a short poem.",
    activity: "Write an original four-line poem using an image and a deliberate sound pattern.",
    check: "Read the poem and point to one sound or image choice.",
    success: "Uses the chosen technique and explains its intended effect.",
  },
  e79_non_fiction_features: {
    prerequisite: "Find a fact in a short text.",
    activity: "Compare a heading, caption and diagram in a short fact sheet.",
    check: "Show how two features help you locate or understand information.",
    success: "Identifies the features and describes a different useful role for each.",
  },
  e79_persuasive: {
    prerequisite: "Express an opinion and give a reason.",
    activity: "Prepare a short argument for a family destination, using reasons suited to the audience.",
    check: "Write a recommendation with two relevant reasons and a clear invitation to act.",
    success: "States a position, gives two relevant reasons and makes a clear request.",
  },
  e79_synonyms: {
    prerequisite: "Recognise that words can have related meanings.",
    activity: "Compare walk, stroll and march in different sentences and discuss the difference.",
    check: "Choose the best replacement for walk in a sentence about soldiers moving together.",
    success: "Chooses march or another defensible word and explains its effect.",
  },
  e79_presenting: {
    prerequisite: "Organise two or three facts about a topic.",
    activity: "Plan a one-minute talk with an opening, key points and a closing sentence.",
    check: "Present two points in order and answer one listener question.",
    success: "Speaks clearly enough to follow and answers with a relevant detail.",
  },
}

export function englishBlueprintGuidance(conceptKey: string): string {
  if (!Object.hasOwn(goals, conceptKey)) return ''
  const goal = goals[conceptKey]
  return [
    'Use the authored English guidance below. Keep the target sound, spelling pattern or language skill when adapting examples. Supply any short original text needed for the task.',
    `Check prerequisite: ${goal.prerequisite}`,
    `Activity model: ${goal.activity}`,
    `Independent check model: ${goal.check}`,
    `Success criterion: ${goal.success}`,
  ].join('\n')
}
