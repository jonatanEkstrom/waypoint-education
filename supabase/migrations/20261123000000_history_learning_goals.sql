begin;

insert into public.subjects (slug, name, sort)
values ('history', 'History', 5)
on conflict (slug) do nothing;

with goals (band, position, key, strand, title, description) as (
  values
    ('3-4', 1, 'first_then', 'Chronology', 'First and then', 'Put two adult-demonstrated actions in order using first and then. Use toys and spoken answers.'),
    ('3-4', 2, 'past_present', 'Chronology', 'Before and now', 'Use an object that the adult moves to tell what was there before and what is there now.'),
    ('3-4', 3, 'yesterday_today', 'Chronology', 'Yesterday and today', 'Tell which of two familiar events happened yesterday and which happened today, with an adult supplying the examples.'),
    ('3-4', 4, 'photo_clue', 'Evidence', 'A clue in a picture', 'Point to one visible detail in an adult-selected picture and describe it without guessing beyond the picture.'),
    ('3-4', 5, 'same_different', 'Change', 'Same and different', 'Compare two pictures of the same toy or place at different times and name one visible difference.'),
    ('3-4', 6, 'remember_order', 'Chronology', 'Tell it in order', 'Retell two moments from a familiar activity in the order they happened using objects or gestures.'),
    ('5-6', 1, 'personal_timeline', 'Chronology', 'A three-event timeline', 'Place three pictured events from a fictional child’s life in order and explain which came first.'),
    ('5-6', 2, 'past_words', 'Chronology', 'Past, present and future', 'Sort three familiar examples into something that happened, is happening or will happen.'),
    ('5-6', 3, 'object_clue', 'Evidence', 'An old object as a clue', 'Name one physical feature of a familiar historical object and use it to suggest how the object was used.'),
    ('5-6', 4, 'old_photo', 'Evidence', 'What can a photo tell us?', 'Identify one thing we can see in a photo and one question the photo leaves unanswered.'),
    ('5-6', 5, 'place_change', 'Change', 'What changed in this place?', 'Use two views of the same place to explain one change between earlier and later.'),
    ('5-6', 6, 'place_continuity', 'Change', 'What stayed the same?', 'Identify one feature that stayed the same across two views of a place or everyday object.'),
    ('7-9', 1, 'dated_events', 'Chronology', 'Put dated events in order', 'Place four events with Common Era year dates on an ordered timeline and use earlier and later correctly.'),
    ('7-9', 2, 'source_vs_guess', 'Evidence', 'Observation or inference?', 'Distinguish what a historical picture directly shows from an inference about it, using a visible detail to support the inference.'),
    ('7-9', 3, 'sources_compare', 'Evidence', 'Compare two clues', 'Compare two short sources about one event and name one detail that both contain.'),
    ('7-9', 4, 'everyday_life', 'Change', 'Compare everyday life', 'Compare how a single everyday task was done in two time periods and describe a difference using the examples provided.'),
    ('7-9', 5, 'cause_effect', 'Explanation', 'One cause and one result', 'Identify one plausible cause and one consequence in a short account, explaining the distinction in one sentence.'),
    ('7-9', 6, 'multiple_viewpoints', 'Perspective', 'Two people, one event', 'Compare how two people in different roles describe the same event and relate one difference to their roles.'),
    ('10-12', 1, 'historical_scale', 'Chronology', 'Years, decades and centuries', 'Order four dated events and choose which units best describe the gaps. Use Common Era examples that avoid year-zero calculations.'),
    ('10-12', 2, 'primary_secondary', 'Evidence', 'Primary and secondary sources', 'Decide whether a source is primary or secondary for a given question by relating its creation to the event under inquiry.'),
    ('10-12', 3, 'corroboration', 'Evidence', 'Corroborating a detail', 'Identify where two independent accounts support the same claim and where one leaves a gap.'),
    ('10-12', 4, 'cause_chain', 'Explanation', 'Link causes and consequences', 'Use a short historical account to explain one chain of cause and consequence without treating sequence alone as proof of cause.'),
    ('10-12', 5, 'change_continuity', 'Change', 'Change alongside continuity', 'Use a short before-and-after comparison to describe one change and one continuity in the same aspect of life.'),
    ('10-12', 6, 'historical_significance', 'Explanation', 'Judge historical significance', 'Use one explicit criterion, such as how many people were affected, to justify why a change mattered.'),
    ('13+', 1, 'source_claim', 'Evidence', 'How far does a source support a claim?', 'Give two short clearly labelled practice sources about a historical change. In a short claim-evidence-reasoning response, quote or paraphrase one detail supporting a claim and name a limit on what can be concluded. Do not present invented practice sources as authentic.'),
    ('13+', 2, 'source_provenance', 'Evidence', 'Use provenance to judge a source', 'Use author, date, audience or purpose to explain one specific strength or limitation for a stated historical inquiry.'),
    ('13+', 3, 'interpretations', 'Perspective', 'Compare historical interpretations', 'Compare two interpretations of the same change, identifying a difference in emphasis and the type of evidence that could help resolve it.'),
    ('13+', 4, 'relative_causation', 'Explanation', 'Weigh competing historical causes', 'Distinguish an immediate trigger from a longer-term condition and explain their relative importance using provided evidence.'),
    ('13+', 5, 'continuity_periods', 'Change', 'Question a historical turning point', 'Use evidence about what changed and what continued to assess whether one date is a convincing boundary between periods.'),
    ('13+', 6, 'qualified_conclusion', 'Evidence', 'Write a qualified conclusion', 'Combine evidence from two sources to reach a reasoned conclusion and state what new evidence could change it.')
)
insert into public.curriculum_concepts (subject_id, age_group_id, sequence_order, concept_key, strand, concept_name, concept_description)
select s.id, a.id, g.position, 'hist_' || replace(g.band, '+', 'plus') || '_' || g.key, g.strand, g.title, g.description
from goals g
join public.age_groups a on a.label = g.band
join public.subjects s on s.slug = 'history'
on conflict (concept_key) do update set
  sequence_order = excluded.sequence_order,
  strand = excluded.strand,
  concept_name = excluded.concept_name,
  concept_description = excluded.concept_description;

commit;
