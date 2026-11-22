type GeographyGoal = {
  prerequisite: string
  activity: string
  check: string
  success: string
}

// England's primary geography programmes informed the map and fieldwork tasks.
// https://www.gov.uk/government/publications/national-curriculum-in-england-geography-programmes-of-study
const goals: Readonly<Record<string, GeographyGoal>> = {
  g56_continents: {
    prerequisite: "Recognise a globe as a model of Earth.",
    activity: "Place seven continent labels on a supplied world map and find the continent you are in.",
    check: "Point to two named continents on a different map.",
    success: "Identifies both and distinguishes a continent from a country.",
  },
  g56_oceans: {
    prerequisite: "Distinguish land and water on a globe.",
    activity: "Trace the five named oceans on a labelled map using the five-ocean model.",
    check: "Point to the Atlantic and Pacific and name a continent beside each.",
    success: "Locates both oceans and identifies a bordering continent for each.",
  },
  g56_uk_countries: {
    prerequisite: "Know that a country can be located on a map.",
    activity: "Fit four labelled country cards onto a UK outline and compare it with Great Britain.",
    check: "Name the four UK countries and locate Northern Ireland.",
    success: "Names England, Scotland, Wales and Northern Ireland and locates the latter correctly.",
  },
  g56_our_country: {
    prerequisite: "Know the name of a familiar town or city.",
    activity: "Find the current country on a globe or atlas and mark the city on a closer map.",
    check: "Name the country and show whether the city is near the coast or inland.",
    success: "Uses the maps to locate the country and make a justified observation about the city.",
  },
  g56_hot_cold_areas: {
    prerequisite: "Distinguish hot from cold and read a simple colour key.",
    activity: "Compare a broad world temperature map with a globe showing the Equator and poles.",
    check: "Point to a generally warm area and a generally cold area and explain one map clue.",
    success: "Uses the key and recognises the pattern without treating every place in a band as alike.",
  },
  g56_seasonal_weather: {
    prerequisite: "Recognise sunny, cloudy and rainy weather.",
    activity: "Record weather symbols and compare observations from two local times of year.",
    check: "Name one thing that changed and one thing a single day cannot tell you.",
    success: "Uses the record and distinguishes short-term weather from a seasonal pattern.",
  },
  g56_physical_features: {
    prerequisite: "Recognise basic land and water forms.",
    activity: "Sort photos of a river, beach and hill and point to the feature in each.",
    check: "Identify a natural feature in a new photo and explain a visual clue.",
    success: "Names a plausible feature and ties it to what is visible.",
  },
  g56_human_features: {
    prerequisite: "Recognise that people build things.",
    activity: "Compare photos of a village road, bridge and surrounding landscape.",
    check: "Name two built features and say what one is used for.",
    success: "Identifies both features correctly and gives a plausible use.",
  },
  g56_compare_places: {
    prerequisite: "Describe one feature of a familiar place.",
    activity: "Compare two labelled photographs with a simple list of natural and built features.",
    check: "Describe one similarity and one difference between the places.",
    success: "Makes a comparison supported by both pictures.",
  },
  g56_compass: {
    prerequisite: "Understand that a map can show a fixed orientation.",
    activity: "Use a map with a north arrow to move a token north, south, east and west.",
    check: "Tell which direction a dot lies from another on the supplied map.",
    success: "Uses the north arrow and names the correct cardinal direction.",
  },
  g56_directional_words: {
    prerequisite: "Identify a starting point and distinguish left and right.",
    activity: "Give directions from a toy figure to nearby landmarks using simple movement words.",
    check: "Give a short route from a stated starting position and direction.",
    success: "Uses left or right from the traveller's perspective and reaches the intended place.",
  },
  g56_aerial_photos: {
    prerequisite: "Recognise a familiar place from ground level.",
    activity: "Match ground-level and overhead pictures of the same simple scene.",
    check: "Find a road and a large building in the overhead view.",
    success: "Uses visible shape or position to identify both.",
  },
  g56_simple_map: {
    prerequisite: "Recognise a view from above and use simple symbols.",
    activity: "Draw a plan of a room or pretend campsite using three symbols and a key.",
    check: "Ask someone to find two features using only the map and key.",
    success: "Symbols lead the reader to both features and are positioned sensibly.",
  },
  g56_fieldwork: {
    prerequisite: "Notice a feature in the immediate surroundings.",
    activity: "From a safe observation point with an adult, tally two kinds of feature or use prepared photos.",
    check: "Show one tally and explain what was counted.",
    success: "Matches marks to observations and describes the area observed.",
  },
  g56_local_food: {
    prerequisite: "Recognise that food comes from plants or animals.",
    activity: "Trace a familiar food from where it grows to a shop using a label or supplied source.",
    check: "Name where one ingredient came from and what source told you.",
    success: "Distinguishes where it grew from where it was bought and cites the label or source.",
  },
  g56_jobs: {
    prerequisite: "Describe a place and what people do there.",
    activity: "Match illustrated local roles to the places or services they support.",
    check: "Describe one way a job helps people use a place.",
    success: "Links a plausible task to a local need without stereotyping who does it.",
  },
  g56_transport: {
    prerequisite: "Recognise familiar ways to travel.",
    activity: "Use a route picture to compare walking, bus and boat for different parts of a journey.",
    check: "Choose a way to travel a short route and give a reason.",
    success: "Chooses a feasible option and links it to the route or passenger need.",
  },
  g56_greetings_language: {
    prerequisite: "Recognise that people use multiple languages.",
    activity: "Listen to two verified greetings and discuss who might use them and when.",
    check: "Match a greeting to a supplied example context without assuming everyone uses it.",
    success: "Uses the example accurately and allows for variation within places.",
  },
  g56_festivals: {
    prerequisite: "Recognise that people celebrate in different ways.",
    activity: "Use two sourced festival photos to discuss one shared feature and one difference.",
    check: "Describe one detail from an example and say where the information came from.",
    success: "Cites the example without treating one festival as representative of everyone.",
  },
  g56_traditional_stories: {
    prerequisite: "Retell one event from a short story.",
    activity: "Listen to a sourced retelling and find the region associated with that account on a map.",
    check: "Name one setting detail and say whether it comes from the story or a map.",
    success: "Distinguishes story evidence from map evidence and avoids treating the tale as historical proof.",
  },
  g56_art_craft: {
    prerequisite: "Describe a visible shape or material.",
    activity: "Look at a sourced image of a craft object and draw a pattern inspired by what you see.",
    check: "Point to an observed feature and explain one choice in your own drawing.",
    success: "Distinguishes an observed feature from an original design choice.",
  },
  g56_famous_landmarks: {
    prerequisite: "Recognise that landmarks can help people locate places.",
    activity: "Use verified photos and map pins to sort natural and built landmarks.",
    check: "Name one landmark, locate it on the provided map and describe its type.",
    success: "Connects the landmark with the correct place and identifies whether it is natural or built.",
  },
  g56_history_old_new: {
    prerequisite: "Use words such as before, after and now.",
    activity: "Compare two dated pictures of the same place and find what stayed familiar.",
    check: "Name one change and point to the evidence for it.",
    success: "Uses a visible difference and puts the pictures in the correct order.",
  },
  g56_animals_habitats: {
    prerequisite: "Recognise that animals need food, water or shelter.",
    activity: "Use local habitat photos to match pictured animals to a suitable place without disturbing wildlife.",
    check: "Choose a suitable location for an animal and say what it provides.",
    success: "Links one reasonable habitat feature to a need of the animal.",
  },
  g56_rivers_seas: {
    prerequisite: "Distinguish land from water on a map.",
    activity: "Trace a short river on a diagram through to a larger body of water.",
    check: "Point to the river and explain one difference between it and the sea.",
    success: "Identifies the flowing channel and the larger receiving body of water in the example.",
  },
  g56_money_shops: {
    prerequisite: "Recognise that prices have amounts and units.",
    activity: "Compare two fictional shop labels showing different currency names and symbols.",
    check: "Point to the number and the currency on each label.",
    success: "Reads both labels and recognises that different currencies use different units.",
  },
  g56_homes: {
    prerequisite: "Describe a feature of a building.",
    activity: "Compare two sourced home photos and discuss how a feature could suit weather or surroundings.",
    check: "Describe one difference and suggest a possible reason.",
    success: "Points to visible evidence and treats the suggested reason as a possibility.",
  },
  g56_caring_environment: {
    prerequisite: "Name a familiar outdoor place and who uses it.",
    activity: "Use pictures to choose an achievable way to care for a shared place.",
    check: "Name one action and explain what it could improve.",
    success: "Proposes a relevant action and links it to the place without handling unsafe litter.",
  },
  g56_route_plan: {
    prerequisite: "Use landmarks and simple direction words.",
    activity: "Trace a route on a small plan and choose between two marked paths.",
    check: "Give a route to a destination using two landmarks or turns.",
    success: "Instructions follow a usable route from the stated start.",
  },
  g56_travel_journey: {
    prerequisite: "Place events in order and use a simple map.",
    activity: "Draw a strip map of a real or fictional journey with stops and travel modes.",
    check: "Use the map to tell the story of your journey in order.",
    success: "Names the start and finish and connects at least two stops in sequence.",
  },
  g79_world_countries: {
    prerequisite: "Recognise continents and use a world atlas index.",
    activity: "Locate three countries using a labelled atlas and describe their relative positions.",
    check: "Find two named countries and state a continent and nearby sea or country for each.",
    success: "Locates both accurately and supports the descriptions from the map.",
  },
  g79_country_profile: {
    prerequisite: "Distinguish a city, country and continent.",
    activity: "Build a brief profile with a map, one physical feature and one sourced population or settlement fact.",
    check: "Explain how two selected facts help a reader understand the country.",
    success: "Uses reliable supplied facts and avoids reducing a country to a single characteristic.",
  },
  g79_cities_regions: {
    prerequisite: "Recognise that a city is part of a larger area.",
    activity: "Use nested maps to locate a city, its named region and its country.",
    check: "Explain the relationship between the city and region shown.",
    success: "Gets the nesting right and locates both on the provided maps.",
  },
  g79_latitude_longitude: {
    prerequisite: "Locate the Equator and recognise a globe grid.",
    activity: "Use labelled grids to find approximate locations north or south and east or west.",
    check: "Locate 20° N, 30° E on a supplied grid and say what each coordinate tells you.",
    success: "Matches latitude to north of the Equator and longitude to east of the prime meridian.",
  },
  g79_time_zones: {
    prerequisite: "Read clock times and use simple differences.",
    activity: "Use a fictional map with UTC offsets to schedule a call across two zones.",
    check: "If it is 10:00 at UTC+0, what time is it at UTC+7?",
    success: "Finds 17:00 and explains the seven-hour difference for the provided offsets.",
  },
  g79_uk_geography: {
    prerequisite: "Name the countries of the UK and use a map key.",
    activity: "Compare a physical map and a settlement map of the UK.",
    check: "Locate one city and a nearby named physical feature using the maps.",
    success: "Locates both accurately and distinguishes their feature types.",
  },
  g79_climate_zones: {
    prerequisite: "Distinguish daily weather from long-term patterns.",
    activity: "Compare simplified long-term temperature and rainfall charts for two places.",
    check: "Use both charts to say which place is typically wetter and which is warmer.",
    success: "Uses the correct axes and compares like periods without inferring climate from one day.",
  },
  g79_biomes: {
    prerequisite: "Relate local habitats to conditions.",
    activity: "Match vegetation images to broad climate descriptions and note that boundaries vary.",
    check: "Explain why one pictured vegetation type fits the given conditions.",
    success: "Connects a relevant temperature or moisture pattern to an observed feature.",
  },
  g79_rivers: {
    prerequisite: "Recognise a river and the direction it flows.",
    activity: "Trace a river from source to mouth and label a tributary on a diagram.",
    check: "Point to the source, tributary and mouth and explain their positions.",
    success: "Labels all three and explains that a tributary joins a larger stream or river.",
  },
  g79_mountains: {
    prerequisite: "Recognise height and slope in a landscape.",
    activity: "Compare a profile and a map of a mountain area using elevations.",
    check: "Identify the higher point and explain the evidence.",
    success: "Reads elevation data rather than inferring height from picture size alone.",
  },
  g79_volcanoes: {
    prerequisite: "Recognise that Earth has an outer surface and internal layers.",
    activity: "Compare a simple tectonic map and a cross-section of a volcano with a teacher-provided example.",
    check: "Explain one difference between an eruption and an earthquake and name one setting where each can occur.",
    success: "Distinguishes material release from shaking and makes a supported location link.",
  },
  g79_coasts: {
    prerequisite: "Recognise where land and sea meet.",
    activity: "Compare two sourced photos or diagrams to identify possible erosion and deposition features.",
    check: "Explain one way waves can move material and cite a clue in an example.",
    success: "Links movement of sediment to erosion or deposition and uses specific evidence.",
  },
  g79_water_cycle: {
    prerequisite: "Recognise liquid water and water vapour.",
    activity: "Trace water through the cycle and show where it can collect or flow across land.",
    check: "Explain how rain in uplands can reach the sea through a river.",
    success: "Connects precipitation to runoff or streams and follows a plausible downstream route.",
  },
  g79_settlements: {
    prerequisite: "Recognise built and physical features on maps.",
    activity: "Compare two site maps and identify access to routes, water and land.",
    check: "Give one advantage and a trade-off for settling at a chosen site.",
    success: "Uses specific map features and explains both considerations.",
  },
  g79_land_use: {
    prerequisite: "Read a map key and recognise different activities.",
    activity: "Make a colour-coded map showing housing, services, green spaces and transport links.",
    check: "Identify two land uses and explain how they sit beside each other.",
    success: "Uses the key accurately and gives a supported example of proximity or conflict.",
  },
  g79_trade_food: {
    prerequisite: "Distinguish growing a food from selling it.",
    activity: "Trace a labelled food product through a simple supply-chain map using its stated origin.",
    check: "Explain one reason a product could be grown in one place and sold in another.",
    success: "Connects a plausible supply or demand factor to the sourced route.",
  },
  g79_natural_resources: {
    prerequisite: "Recognise that everyday products use materials or energy.",
    activity: "Match water, minerals and timber to uses and discuss limits on supply.",
    check: "Name a natural resource, a use and one reason to manage it carefully.",
    success: "Makes a consistent link between the resource, use and constraint.",
  },
  g79_compare_regions: {
    prerequisite: "Read a map and use one common measure.",
    activity: "Compare two regions using the same indicators, such as rainfall and settlement patterns.",
    check: "Write one physical and one human similarity or difference with evidence.",
    success: "Uses comparable information and clearly distinguishes the two kinds of geography.",
  },
  g79_os_maps: {
    prerequisite: "Know that symbols can represent features.",
    activity: "Use an official or supplied map key to identify symbols and plan a route.",
    check: "Identify two symbols and show where they appear on a supplied map.",
    success: "Uses the matching key and identifies the correct locations.",
  },
  g79_grid_references: {
    prerequisite: "Read a numbered grid and distinguish horizontal from vertical.",
    activity: "Find places on a labelled grid by reading eastings before northings.",
    check: "Give a four-figure reference for a marked square and find a second supplied reference.",
    success: "Uses the correct coordinate order and identifies both squares.",
  },
  g79_eight_compass: {
    prerequisite: "Use the four cardinal points on a map.",
    activity: "Add NE, SE, SW and NW to a compass rose and follow a two-leg route.",
    check: "Name the direction from the centre to two marked locations.",
    success: "Identifies the correct intermediate directions from the stated start.",
  },
  g79_fieldwork_data: {
    prerequisite: "Make a tally and keep observations comparable.",
    activity: "With an adult or from supplied photos, tally the same features at two locations for equal periods.",
    check: "Compare the results and name one limitation of the sampling.",
    success: "Cites both tallies and a plausible limit such as time of day or sample size.",
  },
  g79_digital_maps: {
    prerequisite: "Recognise symbols and a map scale.",
    activity: "Compare satellite and street layers of the same public place, then zoom to inspect scale.",
    check: "Explain which layer is better for finding a walkway and which helps see ground cover.",
    success: "Uses evidence from the displayed layers and explains a choice for each task.",
  },
  g79_language_culture: {
    prerequisite: "Recognise that people may use more than one language.",
    activity: "Compare two verified examples of public signage and discuss who each may help.",
    check: "Describe one visible language choice and what it might tell us about the intended audience.",
    success: "Uses a specific clue without assuming it represents every resident.",
  },
  g79_traditions: {
    prerequisite: "Distinguish one example from a general claim.",
    activity: "Compare two sourced examples of customs connected to place or season.",
    check: "Explain one similarity and one difference, including the source for each.",
    success: "Uses evidence from both examples and allows for variation within communities.",
  },
  g79_local_history: {
    prerequisite: "Put dated evidence in time order.",
    activity: "Annotate two maps or photos of the same area from different periods.",
    check: "Identify one change in land use and cite the dated evidence.",
    success: "Uses both time points and distinguishes observation from a possible explanation.",
  },
  g79_ancient_civilisation: {
    prerequisite: "Locate a river or coast and explain one use.",
    activity: "Use a verified map and source about a historical settlement to examine its links with water or routes.",
    check: "Explain how one geographical feature could have supported the settlement.",
    success: "Links a specific map feature to a plausible activity supported by the source.",
  },
  g79_art_architecture: {
    prerequisite: "Describe building materials and visible forms.",
    activity: "Compare two sourced building images and link possible design choices to setting or purpose.",
    check: "Identify one feature and explain a possible reason for it using visible details.",
    success: "Makes a reasonable, evidence-based inference and avoids treating it as certain.",
  },
  g79_environment: {
    prerequisite: "Describe how a shared place is used.",
    activity: "Compare two feasible proposals to protect a park or coastline using a simple impact table.",
    check: "Choose an action and explain one benefit and one trade-off.",
    success: "Supports the choice with a relevant observation and gives a genuine trade-off.",
  },
  g79_travel_guide: {
    prerequisite: "Use a map, cite details and write for an audience.",
    activity: "Make a one-page guide with a route, a physical feature and a sourced local detail.",
    check: "Give a short guide that lets a reader locate two stops and understand why they matter.",
    success: "Includes a usable map or directions, accurate details and a reason to visit each stop.",
  },
}

export function geographyBlueprintGuidance(conceptKey: string): string {
  if (!Object.hasOwn(goals, conceptKey)) return ''
  const goal = goals[conceptKey]
  return [
    'Use the authored geography guidance below. Provide a simple diagram, observation table or labelled map description when needed. Use a reliable source for factual claims about places and current conditions, or clearly label invented data as a model. Keep fieldwork safe and offer a picture-based alternative.',
    `Check prerequisite: ${goal.prerequisite}`,
    `Activity model: ${goal.activity}`,
    `Independent check model: ${goal.check}`,
    `Success criterion: ${goal.success}`,
  ].join('\n')
}
