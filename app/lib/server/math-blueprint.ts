type MathGoal = {
  prerequisite: string
  activity: string
  check: string
  success: string
}

// England's Year 1–4 mathematics programmes informed these goal boundaries.
// https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study
// Keep the database's concept IDs and ordering so existing progress remains valid.
const goals: Readonly<Record<string, MathGoal>> = {
  m56_count_20: {
    prerequisite: 'Count a small set by touching or moving each object once.',
    activity: 'Collect up to 20 small objects and move each into a new pile while counting aloud.',
    check: 'Ask the learner to count a new arrangement of 16 objects and tell you how many there are.',
    success: 'Counts each object once and gives the final count as the total.',
  },
  m56_read_write_20: {
    prerequisite: 'Count objects up to 20 and say the total.',
    activity: 'Match numbered cards to trays of counters. Take turns making a set for someone else to label.',
    check: 'Show the card 14. Ask the learner to build that number, then write the numeral for a different set of 12.',
    success: 'Builds a set of 14 and labels the second set 12. Accept pointing to 12 if handwriting is a barrier.',
  },
  m56_one_more_less: {
    prerequisite: 'Count objects and say how many are in the set.',
    activity: 'Make a small pretend market stall. Add or remove one object at a time and predict the new total.',
    check: 'Starting with 8 objects, ask the learner to show one more and then one less than 8.',
    success: 'Makes sets of 9 and 7 and explains which action changed the count each way.',
  },
  m56_compare: {
    prerequisite: 'Count two small sets separately.',
    activity: 'Make two rows of toy goods and pair one object from each row to see which has extras.',
    check: 'Show sets of 9 and 12 laid out with different spacing. Ask which has more and how to prove it.',
    success: 'Identifies 12 as greater and justifies it by counting or one-to-one matching.',
  },
  m56_number_bonds_10: {
    prerequisite: 'Count to 10 and identify the total in two small groups.',
    activity: 'Fill a ten-frame with counters of two colours and try different ways to make 10.',
    check: 'Show 6 counters on a ten-frame and ask how many more fill it.',
    success: 'Shows that 4 more make 10 and can point to both parts.',
  },
  m56_add_symbols: {
    prerequisite: 'Combine two small sets and count the total.',
    activity: 'Model a shopping basket with two groups and match it to an addition equation. Move the total to the other side of the equals sign and discuss why both sides still balance.',
    check: 'Ask the learner to model 3 + 4 = 7 and explain what the plus and equals signs say.',
    success: 'Shows that plus combines the groups and equals means both sides have the same value.',
  },
  m56_add_20: {
    prerequisite: 'Join two small groups and use number bonds to 10.',
    activity: 'Pack objects into a ten-frame first when joining two groups with a total no greater than 20.',
    check: 'Ask the learner to show 8 + 5 with counters or a drawing.',
    success: 'Gets 13 and shows how the two quantities were combined.',
  },
  m56_subtract_20: {
    prerequisite: 'Count sets to 20 and understand that removing objects makes a smaller set.',
    activity: 'Start with a pile of objects, move some away and describe what changed.',
    check: 'Ask the learner to show 14 take away 5 using objects or a drawing.',
    success: 'Shows the starting 14, removes 5 and identifies the 9 remaining.',
  },
  m56_count_100: {
    prerequisite: 'Count to 20 and recognise that each successive number is one more.',
    activity: 'Take turns saying the next number along a paper track. Stop at a change of tens and count across it.',
    check: 'Ask the learner to count from 46 to 54 and then from 96 to 100.',
    success: 'Continues the sequence across changes of tens and reaches 100 in order.',
  },
  m56_tens_ones: {
    prerequisite: 'Count 10 objects reliably and recognise numerals up to 20.',
    activity: 'Bundle 10 sticks or straws, then add loose ones to model teen numbers.',
    check: 'Ask the learner to build 17 with a bundle and loose objects.',
    success: 'Shows one group of ten and seven ones, and explains that the bundle stands for ten.',
  },
  m56_equal_groups: {
    prerequisite: 'Count small sets and recognise when two sets contain the same amount.',
    activity: 'Put the same number of objects on each of three plates and count the total.',
    check: 'Ask the learner to make three equal groups of two objects.',
    success: 'Builds three groups with two in each and identifies six objects in total.',
  },
  m56_sharing: {
    prerequisite: 'Count small sets and tell when two groups have the same number.',
    activity: 'Deal ten counters one at a time between two pretend customers. Compare the piles and put the counters back together.',
    check: 'Ask the learner to share 12 counters fairly among three people.',
    success: 'Gives each person four counters and explains that everyone has the same amount.',
  },
  m56_halves: {
    prerequisite: 'Understand that fair sharing gives each group the same amount.',
    activity: 'Fold paper shapes or divide sets into two equal parts and compare with an unequal split.',
    check: 'Ask the learner to split eight counters into halves and explain why both parts are halves.',
    success: 'Makes two equal groups of four and explains that halves must be equal.',
  },
  m56_quarters: {
    prerequisite: 'Split a whole into two equal parts and explain what a half is.',
    activity: 'Fold a rectangular paper menu in half and then fold it in half again. Unfold it to compare the four equal parts.',
    check: 'Ask the learner to show one quarter of a paper strip and explain why it is a quarter.',
    success: 'Partitions the original strip into four equal parts and identifies one of them.',
  },
  m79_place_value_100: {
    prerequisite: 'Understand that ten ones make one ten.',
    activity: 'Trade loose counters for tens and record the number of tens and ones.',
    check: 'Ask the learner to build 34 with tens and ones and explain what the 3 represents.',
    success: 'Shows three tens and four ones and explains that the 3 represents 30.',
  },
  m79_place_value_1000: {
    prerequisite: 'Represent two-digit numbers in tens and ones.',
    activity: 'Build three-digit numbers on a place-value mat, including one with an empty place.',
    check: 'Ask the learner to represent 305 and explain the zero.',
    success: 'Shows three hundreds, zero tens and five ones.',
  },
  m79_number_line: {
    prerequisite: 'Compare numbers by their value and recognise equal steps of ten.',
    activity: 'Use a strip of paper as a route between two stops. Mark the endpoints and add equally spaced stops before placing a number.',
    check: 'On a number line marked 20, 30 and 40 at equal intervals, ask where 35 belongs.',
    success: 'Places 35 halfway between 30 and 40 and explains it is five from each.',
  },
  m79_times_2_5_10: {
    prerequisite: 'Make equal groups and count in twos, fives or tens.',
    activity: 'Make arrays or group everyday objects and match each arrangement to a multiplication statement.',
    check: 'Ask the learner to model four groups of five and find the total.',
    success: 'Shows four groups of five and connects them to 4 × 5 = 20.',
  },
  m79_unit_fractions: {
    prerequisite: 'Partition a whole into equal parts and identify a half.',
    activity: 'Fold equal-sized paper strips into different numbers of equal pieces and label one piece of each.',
    check: 'Ask the learner to shade one third of a strip and explain why it is one third.',
    success: 'Shows three equal parts and identifies one of them.',
  },
  m79_non_unit_fractions: {
    prerequisite: 'Find one equal share of a whole set and explain what the denominator counts.',
    activity: 'Divide 12 counters into four equal groups and select one, then two, then three of those groups.',
    check: 'Ask the learner to find two thirds of nine counters and show how they know.',
    success: 'Makes three groups of three, selects two groups and explains that the selected groups contain six counters.',
  },
  m79_equivalent_fractions: {
    prerequisite: 'Name unit and non-unit fractions of a whole divided into equal parts.',
    activity: 'Fold two strips of the same length into halves and quarters, then line up one half with two quarters.',
    check: 'Ask the learner to show whether one half and two quarters of the same whole represent the same amount.',
    success: 'Aligns the shaded lengths or uses an equivalent drawing and explains why the amounts match.',
  },
  m79_add_fractions: {
    prerequisite: 'Read fractions with a shared denominator as counts of equal-sized parts of the same whole.',
    activity: 'Use a strip divided into fifths and combine one fifth with two fifths to count the selected parts.',
    check: 'Ask the learner to model two sixths plus one sixth and explain what stays the same.',
    success: 'Shows three sixths and explains that the parts are still sixths. Accepts one half if supported by the model.',
  },
  m56_missing_number: {
    prerequisite: "Understand addition as joining two parts.",
    activity: "Hide some of ten counters under a cup and work out how many are hidden.",
    check: "Show 6 + □ = 10 with counters.",
    success: "Finds 4 and explains why both parts make 10.",
  },
  m56_number_bonds_20: {
    prerequisite: "Know several pairs that make 10.",
    activity: "Fill two ten-frames using two colours and record the parts.",
    check: "Show two different pairs that make 20.",
    success: "Models two distinct pairs whose totals are 20.",
  },
  m56_word_problems: {
    prerequisite: "Add and subtract small sets with objects.",
    activity: "Act out a short story about goods arriving or being sold at a stall.",
    check: "There are 13 buns and 4 are sold. Show how many remain.",
    success: "Chooses subtraction and shows 9 remaining.",
  },
  m56_count_2s: {
    prerequisite: "Count objects one at a time.",
    activity: "Lay out pairs of socks and count each completed pair by twos.",
    check: "Count six pairs of socks without counting each sock separately.",
    success: "Counts 2, 4, 6, 8, 10, 12 and identifies 12 socks.",
  },
  m56_count_5s_10s: {
    prerequisite: "Recognise equal groups.",
    activity: "Arrange bundles of five and ten sticks and count by bundle.",
    check: "Count four groups of five and three groups of ten separately.",
    success: "Gives 20 and 30 and identifies the respective steps.",
  },
  m56_doubles: {
    prerequisite: "Join two small groups.",
    activity: "Use a mirror or duplicate a pattern of counters.",
    check: "Show double 6.",
    success: "Makes two groups of six and combines them to make 12.",
  },
  m56_length: {
    prerequisite: "Compare two objects directly.",
    activity: "Measure objects with identical blocks laid end to end.",
    check: "Measure a strip with equal blocks and explain why there should be no gaps.",
    success: "Aligns units from the endpoint without gaps or overlaps and counts them.",
  },
  m56_mass: {
    prerequisite: "Use heavier and lighter in everyday comparisons.",
    activity: "Compare small objects on a balance.",
    check: "Compare two similar-sized objects and say which is heavier using the balance.",
    success: "Reads the lower pan as heavier and explains the comparison.",
  },
  m56_capacity: {
    prerequisite: "Compare full and empty containers.",
    activity: "Use one small cup to fill two containers with water.",
    check: "Find which of two containers holds more using the same cup.",
    success: "Counts comparable cupfuls and uses them to justify the result.",
  },
  m56_coins: {
    prerequisite: "Read numerals and compare small values.",
    activity: "Sort labelled pretend coins and make prices with them.",
    check: "Show two ways to pay 10 units with 1, 2 or 5 unit coins.",
    success: "Identifies coin values and makes two correct totals.",
  },
  m56_days_months: {
    prerequisite: "Use before and after for familiar events.",
    activity: "Put day cards in order and mark a family activity on a calendar.",
    check: "Name the day after Thursday and the month after June.",
    success: "Identifies Friday and July using their sequences.",
  },
  m56_oclock: {
    prerequisite: "Recognise the numbers on a clock face.",
    activity: "Move the hands of a paper clock to match a daily routine.",
    check: "Show 3 o’clock and half past 3.",
    success: "Places the minute hand at 12 and 6 respectively and moves the hour hand appropriately.",
  },
  m56_2d_shapes: {
    prerequisite: "Notice straight and curved boundaries.",
    activity: "Sort flat shapes, including ones turned different ways.",
    check: "Pick out a triangle and a rectangle from mixed cards and explain each choice.",
    success: "Uses three sides for the triangle and four right angles for the rectangle without relying on orientation.",
  },
  m56_3d_shapes: {
    prerequisite: "Recognise common flat shapes.",
    activity: "Sort boxes, balls and cans by how they stack or roll.",
    check: "Choose a sphere, a cube and a cylinder from everyday objects.",
    success: "Matches each solid and describes a recognizable property.",
  },
  m56_turns: {
    prerequisite: "Follow a simple movement instruction.",
    activity: "Guide a toy along a route with quarter and half turns.",
    check: "Show a quarter turn and a half turn from the same starting direction.",
    success: "Turns through the intended amount and shows that a half turn reverses direction.",
  },
  m56_ordinal: {
    prerequisite: "Count a row from a stated starting point.",
    activity: "Line up toy travellers and describe their places.",
    check: "Starting from the front, point to the second and fourth objects.",
    success: "Counts positions from the correct end and locates both.",
  },
  m79_compare_order: {
    prerequisite: "Represent tens, ones and hundreds.",
    activity: "Order pretend ticket numbers using a place-value mat.",
    check: "Order 306, 360 and 63 from least to greatest.",
    success: "Orders 63, 306, 360 and justifies comparing hundreds before tens.",
  },
  m79_round_10_100: {
    prerequisite: "Locate numbers on an evenly spaced number line.",
    activity: "Use number lines to locate the neighbouring multiples of ten or hundred.",
    check: "Round 146 to the nearest ten and nearest hundred.",
    success: "Gives 150 and 100 and justifies each by comparing distances.",
  },
  m79_mental_add_sub: {
    prerequisite: "Partition two-digit numbers into tens and ones.",
    activity: "Use a number line to jump in tens and then adjust the ones.",
    check: "Work out 47 + 19 without a written column.",
    success: "Gives 66 and explains a valid mental strategy.",
  },
  m79_column_add: {
    prerequisite: "Understand place value and exchange ten ones for one ten.",
    activity: "Use blocks to model each column before writing the calculation.",
    check: "Work out 268 + 157 by column addition and explain an exchange.",
    success: "Gives 425 with aligned digits and correct exchanges.",
  },
  m79_column_sub: {
    prerequisite: "Understand place value and exchange one ten for ten ones.",
    activity: "Model exchanging a ten with place-value blocks before recording it.",
    check: "Calculate 352 − 178 and explain one exchange.",
    success: "Gets 174 and shows valid exchanges and place alignment.",
  },
  m79_inverse_check: {
    prerequisite: "Understand addition and subtraction as related operations.",
    activity: "Make a fact family from a model and check a calculation by reversing it.",
    check: "Check 83 − 36 = 47 using addition.",
    success: "Shows 47 + 36 = 83 and explains why that checks the result.",
  },
  m79_times_3_4_8: {
    prerequisite: "Represent multiplication as equal groups or an array.",
    activity: "Make arrays for groups of four and double them to model groups of eight.",
    check: "Find 6 × 8 using 6 × 4, then show why it works.",
    success: "Gets 48 and explains that eight is twice four.",
  },
  m79_times_to_12: {
    prerequisite: "Recall or derive simpler multiplication facts.",
    activity: "Split an array into a familiar ten-group part and a smaller part.",
    check: "Derive 7 × 12 from 7 × 10 and 7 × 2.",
    success: "Gives 84 and connects both partial products to the full array.",
  },
  m79_multiply_2digit: {
    prerequisite: "Decompose numbers into tens and ones and multiply small factors.",
    activity: "Model 23 × 3 with an area diagram split into 20 × 3 and 3 × 3.",
    check: "Work out 24 × 3 by splitting 24.",
    success: "Gives 72 by combining 60 and 12 and explains the split.",
  },
  m79_division_remainders: {
    prerequisite: "Make equal groups and interpret division as grouping.",
    activity: "Pack counters into boxes of five and describe any leftovers.",
    check: "Pack 23 objects into bags of five. How many full bags and loose objects?",
    success: "Shows four full bags and three loose objects and checks the total.",
  },
  m79_two_step_problems: {
    prerequisite: "Solve one-step addition, subtraction and grouping problems.",
    activity: "Draw a simple diagram for each action in a market problem.",
    check: "There are three trays of eight rolls and five are sold. How many remain?",
    success: "Works out 24 first, then subtracts five to get 19.",
  },
  m79_tenths_hundredths: {
    prerequisite: "Recognise equal parts of a whole and understand decimal place value.",
    activity: "Shade a ten-by-ten grid and connect whole rows to tenths and individual squares to hundredths.",
    check: "On a hundred-square grid, show 0.34 and explain the digits.",
    success: "Shows 34 squares as three tenths and four hundredths.",
  },
  m79_money_change: {
    prerequisite: "Add and subtract within 100.",
    activity: "Run a pretend shop using labelled tokens and represent change by counting up.",
    check: "An item costs 37 units and the customer pays 50. Find the change.",
    success: "Gives 13 and verifies that price plus change is 50.",
  },
  m79_measure_units: {
    prerequisite: "Compare lengths and count equal units.",
    activity: "Use a ruler starting at zero and compare measured objects.",
    check: "Measure a strip and report its length in centimetres.",
    success: "Aligns at zero, reads the endpoint and includes the unit.",
  },
  m79_perimeter: {
    prerequisite: "Measure lengths with consistent units and add them.",
    activity: "Trace the boundary of a paper rectangle and label its sides.",
    check: "Find the perimeter of a rectangle with sides 6 cm and 4 cm.",
    success: "Adds all four sides to get 20 cm and identifies it as boundary length.",
  },
  m79_area_squares: {
    prerequisite: "Count equal units and see rows and columns in an array.",
    activity: "Cover a drawn region with square tiles without gaps or overlaps.",
    check: "Find the area of a four-by-three tile rectangle.",
    success: "Counts 12 square units and distinguishes coverage from boundary length.",
  },
  m79_time_minutes: {
    prerequisite: "Read the hour and half-hour and count by fives.",
    activity: "Move a model clock forward and count minute marks as the hand moves.",
    check: "Read a model clock showing 4:37.",
    success: "Identifies 37 minutes past 4 and uses the hour hand between 4 and 5.",
  },
  m79_timetables: {
    prerequisite: "Read clock times and compare earlier and later.",
    activity: "Order a short bus schedule and use jumps along a timeline.",
    check: "A bus leaves at 9:45 and arrives at 10:20. How long is the trip?",
    success: "Gets 35 minutes and explains the crossing of the hour.",
  },
  m79_angles_lines: {
    prerequisite: "Recognise a quarter turn as a right angle.",
    activity: "Use a paper corner to compare angles on objects or drawings.",
    check: "Identify one angle smaller than a right angle and one larger.",
    success: "Compares openings with the paper corner, independently of line length.",
  },
  m79_symmetry: {
    prerequisite: "Recognise matching shapes and positions.",
    activity: "Fold paper shapes or use a mirror to test proposed symmetry lines.",
    check: "Find and verify a line of symmetry of a non-square rectangle.",
    success: "Shows a centre line that makes both halves coincide and rejects a diagonal.",
  },
  m79_coordinates: {
    prerequisite: "Read an ordered grid with horizontal and vertical axes.",
    activity: "Plot pretend landmarks on a first-quadrant map.",
    check: "Plot (3, 2) and (2, 3) and explain why the points differ.",
    success: "Moves horizontally first, vertically second and places both correctly.",
  },
  m79_bar_charts: {
    prerequisite: "Count categories and read values in a simple table.",
    activity: "Record a small tally and draw bars with a common scale.",
    check: "Read two bars at 6 and 10 and explain the difference.",
    success: "Reads the scale, gives a difference of 4 and names the categories being compared.",
  },
}

export function mathBlueprintGuidance(conceptKey: string): string {
  if (!Object.hasOwn(goals, conceptKey)) return ''
  const goal = goals[conceptKey]
  return [
    'Use the authored curriculum guidance below. Localise the setting and objects while preserving the mathematical demand.',
    `Check prerequisite: ${goal.prerequisite}`,
    `Activity model: ${goal.activity}`,
    `Independent check model: ${goal.check}`,
    `Success criterion: ${goal.success}`,
  ].join('\n')
}
