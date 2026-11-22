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
  m56_one_more_less: {
    prerequisite: 'Count objects and say how many are in the set.',
    activity: 'Make a small pretend market stall. Add or remove one object at a time and predict the new total.',
    check: 'Starting with 8 objects, ask the learner to show one more and then one less than 8.',
    success: 'Makes sets of 9 and 7 and explains which action changed the count each way.',
  },
  m56_number_bonds_10: {
    prerequisite: 'Count to 10 and identify the total in two small groups.',
    activity: 'Fill a ten-frame with counters of two colours and try different ways to make 10.',
    check: 'Show 6 counters on a ten-frame and ask how many more fill it.',
    success: 'Shows that 4 more make 10 and can point to both parts.',
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
