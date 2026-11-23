export function earlyLearningStarter(conceptKey: string, needsReview: boolean) {
  if (conceptKey === 'e56_blend_cvc') {
    return {
      reading_title: 'Join three sounds',
      introduction: 'Words are made of sounds. Let’s join some together.',
      main_content: 'Point to the first letter.\n\nSay each sound in order.\n\nSlide your finger across. Say the word.',
      example: needsReview ? 'Point to each letter in “mat”. Say it slowly, then quickly.' : 'Point to each letter in “map”. Say it slowly, then quickly.',
      activity: {
        title: 'Point, say and slide',
        materials: 'Paper and pencil',
        time: '5–8 minutes',
        description: 'Write “mat” and “sat” on paper. Point to the letters in one word. Say the sounds together, then blend them. Swap roles for the second word.',
      },
      check_for_understanding: 'Here is “pat”. Can you join its sounds?',
      parent_success_criterion: 'The child says the sounds in order and blends them. Offer a different word made from sounds they know if p is unfamiliar.',
      parent_tip: 'Read the instructions aloud. Model the short letter sounds and keep consonants crisp. Give your child time to try each sound.',
    }
  }

  if (conceptKey === 'g56_our_country') {
    return {
      reading_title: 'Find our town',
      introduction: 'We are in a town or city. Let’s find it on a map.',
      main_content: 'A map shows where places are.\n\nOur town is in a country.\n\nWe can point to our town.',
      example: needsReview ? 'Put a finger on the town. Ask your child to copy you.' : 'The dot on a map can show your town.',
      activity: {
        title: 'Put your finger on our town',
        materials: 'A local map on paper or a device',
        time: '5–8 minutes',
        description: 'Show the child your town on the map. Say the town and country names together. Move your finger away. Ask them to find the same spot.',
      },
      check_for_understanding: 'Can you point to our town and say its name?',
      parent_success_criterion: 'The child points to the town with the map open and says its name. Prompt as needed for the country name.',
      parent_tip: 'Find the map before you start. Zoom in so your town label is easy to see.',
    }
  }

  return null
}
