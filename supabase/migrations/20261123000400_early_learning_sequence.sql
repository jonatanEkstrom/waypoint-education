-- Keep existing concept IDs and progress while adjusting the teaching order.
with geography_order (concept_key, position) as (
  values
    ('g56_our_country', 1),
    ('g56_physical_features', 2),
    ('g56_human_features', 3),
    ('g56_seasonal_weather', 4),
    ('g56_greetings_language', 5),
    ('g56_local_food', 6),
    ('g56_homes', 7),
    ('g56_transport', 8),
    ('g56_jobs', 9),
    ('g56_famous_landmarks', 10),
    ('g56_directional_words', 11),
    ('g56_simple_map', 12),
    ('g56_compass', 13),
    ('g56_aerial_photos', 14),
    ('g56_fieldwork', 15),
    ('g56_route_plan', 16),
    ('g56_rivers_seas', 17),
    ('g56_animals_habitats', 18),
    ('g56_festivals', 19),
    ('g56_traditional_stories', 20),
    ('g56_art_craft', 21),
    ('g56_money_shops', 22),
    ('g56_history_old_new', 23),
    ('g56_caring_environment', 24),
    ('g56_travel_journey', 25),
    ('g56_continents', 26),
    ('g56_oceans', 27),
    ('g56_hot_cold_areas', 28),
    ('g56_uk_countries', 29),
    ('g56_compare_places', 30)
)
update public.curriculum_concepts as concept
set sequence_order = geography_order.position
from geography_order, public.subjects as subject, public.age_groups as age_group
where concept.concept_key = geography_order.concept_key
  and concept.subject_id = subject.id and subject.slug = 'geography'
  and concept.age_group_id = age_group.id and age_group.label = '5-6';

update public.curriculum_concepts as concept
set sequence_order = case concept.concept_key when 'e56_blend_cvc' then 1 else 2 end
from public.subjects as subject, public.age_groups as age_group
where concept.concept_key in ('e56_blend_cvc', 'e56_phonics_digraphs')
  and concept.subject_id = subject.id and subject.slug = 'english'
  and concept.age_group_id = age_group.id and age_group.label = '5-6';

update public.curriculum_concepts
set concept_name = 'Where are we now?',
    concept_description = 'Say the name of the town and country you are in and find your town on a map with help.'
where concept_key = 'g56_our_country';
