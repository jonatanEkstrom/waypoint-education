type ScienceGoal = {
  prerequisite: string
  activity: string
  check: string
  success: string
}

// England's primary science programmes informed the activities and checks.
// https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study
const goals: Readonly<Record<string, ScienceGoal>> = {
  s56_plants_name: {
    prerequisite: "Notice how two plants look different.",
    activity: "Compare two familiar plants with photos or with a grown-up outdoors.",
    check: "Match two named plants to their pictures and point to a clue in each.",
    success: "Uses visible features to distinguish both plants.",
  },
  s56_plant_parts: {
    prerequisite: "Recognise a plant as a whole living thing.",
    activity: "Label a drawing made while looking at a plant with visible roots, stem, leaves and flower.",
    check: "Point to the four parts on a new picture.",
    success: "Labels roots, stem, leaves and flower in the right places.",
  },
  s56_deciduous_evergreen: {
    prerequisite: "Recognise leaves and notice seasonal changes.",
    activity: "Compare photos of one deciduous tree and one evergreen tree in different seasons.",
    check: "Explain which tree is deciduous using the photos.",
    success: "Identifies the tree that loses most leaves seasonally and knows an evergreen can still shed individual leaves.",
  },
  s56_animal_groups: {
    prerequisite: "Describe a visible animal feature.",
    activity: "Sort familiar animals using cards showing feathers, fur, scales or other visible clues.",
    check: "Group a pigeon, a cat and a goldfish and describe a clue for each.",
    success: "Names bird, mammal and fish and gives a relevant feature for each.",
  },
  s56_what_animals_eat: {
    prerequisite: "Recognise plants and animals.",
    activity: "Match rabbit, lion and bear food cards to plant foods, animal foods or both.",
    check: "Sort the three diets and explain one choice using the cards.",
    success: "Describes the rabbit as eating plants, the lion as eating animals and the example bear as eating both.",
  },
  s56_animal_bodies: {
    prerequisite: "Name simple body parts.",
    activity: "Compare photos of a bird and a fish using arrows to label visible features.",
    check: "Show one feature on each animal and explain how it helps the animal move.",
    success: "Links wings or fins to a plausible movement and locates each correctly.",
  },
  s56_human_senses: {
    prerequisite: "Identify eyes, ears, nose, tongue and skin.",
    activity: "Describe a safe familiar object using sight, touch and hearing. Avoid tasting or smelling unknown materials.",
    check: "Which body part helps you hear a bell and which helps you feel a rough surface?",
    success: "Identifies ears and skin, including skin on the hands.",
  },
  s56_living_nonliving: {
    prerequisite: "Notice that living things change over time.",
    activity: "Sort pictures showing a living plant, a detached dead leaf and a rock.",
    check: "Place a growing tree, a fallen dead leaf and a stone in the three groups.",
    success: "Gives alive, dead and never alive respectively and distinguishes being dead from never having lived.",
  },
  s56_habitats: {
    prerequisite: "Recognise that animals and plants have basic needs.",
    activity: "Match photos of organisms to familiar places, discussing shelter and food without moving animals.",
    check: "Pick a suitable home for a pond snail and name something it provides.",
    success: "Chooses a pond or suitable freshwater setting and identifies a relevant feature such as water.",
  },
  s56_food_chains: {
    prerequisite: "Know that some animals eat plants and others eat animals.",
    activity: "Arrange grass, rabbit and fox cards and draw arrows from food to the animal eating it.",
    check: "Build the chain and explain the arrow from grass to rabbit.",
    success: "Gives grass → rabbit → fox and explains that the rabbit gets food from the grass.",
  },
  s56_seeds_bulbs: {
    prerequisite: "Name a plant and recognise that plants grow.",
    activity: "Compare safe pictures of seeds and bulbs and follow photos of their growth.",
    check: "Name a plant that begins as a seed and one that can grow from a bulb.",
    success: "Gives a suitable example of each, such as bean and tulip.",
  },
  s56_plant_needs: {
    prerequisite: "Recognise that plants change and need care.",
    activity: "Observe two otherwise similar, already growing plants with different watering routines using teacher-provided photos or data.",
    check: "Explain why the dry plant may wilt and name another need of a growing green plant.",
    success: "Links wilting to lack of water and names light or a suitable temperature.",
  },
  s56_offspring: {
    prerequisite: "Distinguish a young animal from an adult.",
    activity: "Match adult and offspring photos, including a caterpillar and butterfly.",
    check: "Match three pairs and describe a change in one pair.",
    success: "Matches using the example organisms and names a plausible change as one grows.",
  },
  s56_healthy_living: {
    prerequisite: "Name an everyday routine.",
    activity: "Sort picture cards into movement, rest, handwashing and food routines.",
    check: "Give two different routines that help keep a person well and say how.",
    success: "Gives two practical examples and a plausible reason for each without ranking bodies or foods morally.",
  },
  s56_materials_name: {
    prerequisite: "Describe visible or touchable features of familiar objects.",
    activity: "Sort safe items or photos by the materials they are made from.",
    check: "Name the material in a wooden spoon, metal coin and glass jar shown in pictures.",
    success: "Names wood, metal and glass and distinguishes the objects from their materials.",
  },
  s56_object_material: {
    prerequisite: "Name familiar objects and materials.",
    activity: "Label an object card and a separate material card, then pair items that share a material.",
    check: "Explain the difference between a plastic cup and the plastic it is made of.",
    success: "Names the cup as the object and plastic as the material.",
  },
  s56_material_properties: {
    prerequisite: "Use descriptive words for safe objects.",
    activity: "Compare dry cardboard, cloth and plastic samples by gently folding or observing them.",
    check: "Describe two samples using observable properties and show how you checked one.",
    success: "Uses relevant words such as flexible or rigid and supports a claim with an observation.",
  },
  s56_waterproof: {
    prerequisite: "Recognise that water can pass through some materials.",
    activity: "Place equal drops of water on two samples over dry paper and check which paper becomes wet.",
    check: "Use the paper underneath to decide which sample kept water out during the test.",
    success: "Chooses from the observations and limits the claim to the test conditions.",
  },
  s56_squash_bend: {
    prerequisite: "Notice when something changes shape.",
    activity: "Use a sponge, paper strip and elastic fabric to compare gentle pushes, bends and stretches.",
    check: "Demonstrate bending and stretching on safe materials and say what changed.",
    success: "Shows two different actions and describes each change in shape.",
  },
  s56_material_uses: {
    prerequisite: "Compare materials using a familiar property.",
    activity: "Choose among cloth, card and plastic for a pretend rain cover and explain a trade-off.",
    check: "Pick a material for the cover and link its property to its use.",
    success: "Chooses a plausible water-resistant material and explains why keeping water out matters.",
  },
  s56_seasons: {
    prerequisite: "Notice patterns in weather and daylight.",
    activity: "Compare observations from two local times of year, using wet and dry seasons where appropriate.",
    check: "Describe two visible changes between the local observations.",
    success: "Uses evidence from the examples without assuming all places have the same seasons.",
  },
  s56_weather_record: {
    prerequisite: "Describe basic weather conditions.",
    activity: "Record weather symbols at the same safe observation point for several days.",
    check: "Which day in the record was rainy, and how can you tell?",
    success: "Identifies the day from the record and explains its symbol.",
  },
  s56_day_length: {
    prerequisite: "Recognise morning and evening.",
    activity: "Use two prepared sunrise and sunset charts for the same place and compare their daylight bars.",
    check: "Which of two days shown had more daylight, and how do you know?",
    success: "Selects the longer sunrise-to-sunset interval and distinguishes it from the full day.",
  },
  s56_sun_safety: {
    prerequisite: "Recognise direct sunshine and shade.",
    activity: "Use picture cards to choose a shaded place, a hat and other suitable sun protection for an outing. Never look at the Sun.",
    check: "Name two ways to reduce sun exposure outdoors.",
    success: "Names two actionable examples, such as seeking shade and wearing a wide-brimmed hat.",
  },
  s56_observe_closely: {
    prerequisite: "Describe one feature of a familiar object.",
    activity: "Draw a fallen leaf using a magnifier and label what can actually be seen.",
    check: "Point out two details on the leaf or a close-up photo.",
    success: "Reports two observable features without guessing how they formed.",
  },
  s56_simple_test: {
    prerequisite: "Make a prediction and describe an observation.",
    activity: "Compare which of two small objects floats in a shallow bowl, with an adult nearby, and record the result.",
    check: "Name what you changed and describe what happened to both objects.",
    success: "Identifies the objects as the comparison and reports each result accurately.",
  },
  s56_sorting_grouping: {
    prerequisite: "Notice a common feature in objects.",
    activity: "Sort familiar safe objects twice using two different visible features.",
    check: "State the sorting rule and show where a new item belongs.",
    success: "Uses a consistent rule and explains the placement.",
  },
  s56_ask_questions: {
    prerequisite: "Describe something you noticed.",
    activity: "Turn a playground observation into a question that can be checked without disturbing wildlife.",
    check: "Turn 'some leaves are bigger' into a question that could be investigated.",
    success: "Suggests an observable question, such as which of two fallen leaves is longer.",
  },
  s56_microhabitats: {
    prerequisite: "Know what a habitat provides.",
    activity: "Compare close-up photos of leaf litter and a sunny patch of ground without moving organisms.",
    check: "Name one feature that makes leaf litter a different habitat from open ground.",
    success: "Uses a relevant difference such as shade, cover or moisture.",
  },
  s56_local_wildlife: {
    prerequisite: "Notice visible traits of local plants or animals.",
    activity: "Draw or tally wildlife from a safe distance. Use photos if outdoor access is limited.",
    check: "Describe one organism and where you observed it.",
    success: "Gives a visible feature and a location without claiming an uncertain species identification.",
  },
  s79_plant_functions: {
    prerequisite: "Identify roots, stems, leaves and flowers.",
    activity: "Use a labelled plant model to match each major part with a function.",
    check: "Explain how roots, stem and leaves help a plant.",
    success: "Links roots to water uptake, stem to support or transport, and leaves to making food using light.",
  },
  s79_water_transport: {
    prerequisite: "Identify roots and stems and know plants need water.",
    activity: "Place an adult-prepared celery stalk in coloured water and observe tinted lines over time.",
    check: "Explain what the tinted lines provide evidence for.",
    success: "Identifies a route through the stalk and distinguishes the observation from the inference.",
  },
  s79_pollination: {
    prerequisite: "Recognise that flowers can help plants reproduce.",
    activity: "Move paper pollen dots between flower diagrams labelled with anther and stigma.",
    check: "Describe what moves and where it moves during pollination.",
    success: "Identifies the transfer of pollen from anther to stigma and distinguishes it from seed dispersal.",
  },
  s79_nutrition: {
    prerequisite: "Know that bodies need food to grow and function.",
    activity: "Use fictional meal cards to discuss energy, growth and variety without counting calories.",
    check: "Name a food source of protein and explain one role protein plays.",
    success: "Gives a reasonable source and links protein to growth or repair.",
  },
  s79_skeletons: {
    prerequisite: "Identify a limb and a joint.",
    activity: "Use a cardboard arm model to show how a muscle pull bends a joint.",
    check: "Explain what bones, joints and muscles do when an arm bends.",
    success: "Describes bones as supporting the limb, the joint as allowing movement and muscles as pulling.",
  },
  s79_digestion: {
    prerequisite: "Recognise that food moves through the body.",
    activity: "Sequence a diagram from mouth to oesophagus, stomach and intestines and label key actions.",
    check: "Trace the route and name where most nutrients are absorbed.",
    success: "Gives the main route in order and identifies the small intestine.",
  },
  s79_teeth: {
    prerequisite: "Recognise different tooth shapes.",
    activity: "Compare diagrams of incisors, canines and molars and discuss how shapes relate to their jobs.",
    check: "Which teeth help cut and which help grind food? Explain from shape.",
    success: "Links incisors to cutting and molars to grinding using a visible feature.",
  },
  s79_food_chains: {
    prerequisite: "Read a simple food-chain arrow.",
    activity: "Build a local food chain and label producer and consumers using teacher-provided species examples.",
    check: "Label the producer and two consumers in grass → grasshopper → frog.",
    success: "Labels grass as producer and the animals as consumers and explains the arrow direction.",
  },
  s79_classification_keys: {
    prerequisite: "Sort organisms by observable features.",
    activity: "Make a short yes-or-no key for four familiar organism pictures.",
    check: "Use the key to identify a new card and explain each choice.",
    success: "Follows both branches consistently with observable features.",
  },
  s79_environment_change: {
    prerequisite: "Identify what a habitat provides.",
    activity: "Compare two site photos before and after a change and list potential effects on organisms.",
    check: "Predict one effect of removing a pond margin and explain the reason.",
    success: "Links a specific habitat change to a plausible effect and marks it as a prediction.",
  },
  s79_rocks: {
    prerequisite: "Compare materials through observable properties.",
    activity: "Compare labelled rock samples or photos for grain, layers and texture.",
    check: "Describe two differences and state what further information would help identify the rocks.",
    success: "Uses observations and avoids guessing rock type from colour alone.",
  },
  s79_fossils: {
    prerequisite: "Know that organisms have identifying shapes.",
    activity: "Press a shell replica into modelling clay and discuss how an impression can be preserved.",
    check: "Explain how a preserved impression can show evidence of an earlier organism.",
    success: "Links the impression to the shape of a former organism and distinguishes the model from real fossil formation.",
  },
  s79_soil: {
    prerequisite: "Know soils can contain different materials.",
    activity: "Compare photographs or sealed samples of two soils for visible grains and organic matter.",
    check: "Describe one difference and explain a possible effect on water movement.",
    success: "Uses a visible feature and gives a plausible, testable prediction.",
  },
  s79_light_reflection: {
    prerequisite: "Know that light sources emit light.",
    activity: "Use a low-power torch and paper to trace reflected light from a handheld mirror away from eyes.",
    check: "Explain why a mirror can be seen without making its own light.",
    success: "Explains that light from a source reflects off the mirror towards the observer.",
  },
  s79_shadows: {
    prerequisite: "Recognise an opaque object and a light source.",
    activity: "Move an opaque card relative to a torch and screen while keeping the other distances fixed.",
    check: "Predict and test what happens when the card moves closer to the torch.",
    success: "Reports that the shadow gets larger in this setup and explains that the card blocks light.",
  },
  s79_sun_protection: {
    prerequisite: "Know the Sun is a strong natural light source.",
    activity: "Compare diagrams of shade, hats and protective sunglasses. Use indirect observations only.",
    check: "Explain why you must never look directly at the Sun, even with ordinary sunglasses.",
    success: "Identifies eye-injury risk and describes safer choices such as shade and looking away.",
  },
  s79_forces_surfaces: {
    prerequisite: "Describe a push or pull and recognise a distance.",
    activity: "Release the same toy car from the same ramp onto two dry surfaces and measure how far it travels.",
    check: "Explain how to compare the surfaces fairly and interpret the results.",
    success: "Keeps car and ramp fixed and links shorter travel in this setup to greater resistance while allowing for variation.",
  },
  s79_magnets: {
    prerequisite: "Recognise that a force can move an object.",
    activity: "Use a large classroom magnet under adult supervision to compare safe steel, aluminium and wooden samples. Avoid small or powerful magnets.",
    check: "Explain the results for steel, aluminium and wood.",
    success: "Recognises that the steel sample is attracted and that some metals are not attracted.",
  },
  s79_states_matter: {
    prerequisite: "Describe how water changes shape when poured.",
    activity: "Compare ice, liquid water and air in simple pictures or safe containers.",
    check: "Explain how a solid, liquid and gas behave in a container.",
    success: "Explains that a solid keeps its shape, a liquid flows and a gas spreads to fill available space.",
  },
  s79_melting_freezing: {
    prerequisite: "Distinguish solid and liquid water.",
    activity: "Observe an ice cube melting in a dish and use a photo sequence to model refreezing.",
    check: "Name both changes and explain when each occurs.",
    success: "Connects melting to solid-to-liquid on warming and freezing to liquid-to-solid on cooling.",
  },
  s79_water_cycle: {
    prerequisite: "Recognise water in different states.",
    activity: "Use a room-temperature closed clear bag or diagram to trace evaporation, condensation and precipitation. Avoid heating.",
    check: "Explain how liquid water becomes droplets in a cloud model.",
    success: "Distinguishes evaporation into water vapour from condensation back into liquid droplets.",
  },
  s79_sound_vibration: {
    prerequisite: "Recognise a repeated back-and-forth motion.",
    activity: "Gently pluck a ruler held over a desk edge and observe its movement and sound.",
    check: "Explain why the sound fades as the motion stops.",
    success: "Links the sound to vibration and describes how a vibration can travel through air to the ear.",
  },
  s79_pitch_volume: {
    prerequisite: "Recognise that sounds can differ in more than one way.",
    activity: "Compare a gently plucked ruler at two overhang lengths, then vary the pluck strength while keeping length fixed.",
    check: "Identify which change affects pitch and which affects loudness in the setup.",
    success: "Distinguishes higher or lower pitch from louder or quieter sound and uses the observations.",
  },
  s79_circuits: {
    prerequisite: "Recognise a battery, a wire and a lamp.",
    activity: "Draw or use an adult-supervised classroom low-voltage circuit kit. Keep mains electricity out of the activity.",
    check: "Decide which of two circuit diagrams lights a lamp and explain why.",
    success: "Identifies the diagram with a complete path between battery terminals through the lamp.",
  },
  s79_conductors: {
    prerequisite: "Recognise an open and a closed circuit.",
    activity: "Use a diagram or teacher-demonstrated low-voltage circuit kit to compare approved samples. No mains power.",
    check: "Predict which of a metal strip and plastic strip lets the lamp light and interpret a result.",
    success: "Identifies the metal strip as a conductor in the example and links the result to completing the circuit.",
  },
  s79_electrical_safety: {
    prerequisite: "Distinguish everyday battery devices from mains-powered fixtures.",
    activity: "Sort pictures of safe actions and situations that need a grown-up. Do not handle sockets, mains wiring or damaged equipment.",
    check: "What should you do if you see a damaged cable beside a socket?",
    success: "Keeps away and tells an adult without touching anything.",
  },
  s79_fair_test: {
    prerequisite: "Identify what was changed in a simple test.",
    activity: "Plan a paper-spinner comparison in which only wing length is deliberately changed.",
    check: "Name the factor to change, one to measure and two to keep the same.",
    success: "Changes wing length, measures a suitable outcome and controls relevant factors such as drop height and paper type.",
  },
  s79_measure_record: {
    prerequisite: "Read a simple scale and use a unit.",
    activity: "Measure three prepared objects and record the results with units in a table.",
    check: "Read a new ruler measurement and write it in the correct column.",
    success: "Reads from zero, includes the unit and records the result under the correct heading.",
  },
  s79_conclusions: {
    prerequisite: "Read a table and compare values.",
    activity: "Use several results from a classroom test to make a claim and identify variation.",
    check: "Use supplied measurements to decide which sample usually performed better and give one limitation.",
    success: "Cites data, addresses variation and limits the conclusion to the test.",
  },
  s79_local_ecosystem: {
    prerequisite: "Identify organisms and describe habitat features.",
    activity: "Observe or use photos of two small nearby habitats, recording visible organisms without disturbing them.",
    check: "Make one comparison supported by observations and propose a follow-up question.",
    success: "Uses specific recorded evidence and asks a question that can be investigated safely.",
  },
}

export function scienceBlueprintGuidance(conceptKey: string): string {
  if (!Object.hasOwn(goals, conceptKey)) return ''
  const goal = goals[conceptKey]
  return [
    'Use the authored science guidance below. Preserve safety limits and use the named observation or test.',
    `Check prerequisite: ${goal.prerequisite}`,
    `Activity model: ${goal.activity}`,
    `Independent check model: ${goal.check}`,
    `Success criterion: ${goal.success}`,
  ].join('\n')
}
