export type LessonQuickCheck = {
  adultCue: string
  options: readonly string[]
  answer: string
  hint: string
  success: string
}

const blendingCheck: LessonQuickCheck = {
  adultCue: 'Say the sounds for t, a and p separately. Use the short a in map. Ask your child to join the sounds and find the word.',
  options: ['map', 'tap', 'top'],
  answer: 'tap',
  hint: 'Listen to the first sound. Then listen to the short a in the middle.',
  success: 'You joined the sounds to make tap.',
}

const blendingReviewCheck: LessonQuickCheck = {
  adultCue: 'Say the sounds for s, a and t separately. Use the short a in map. Pause after each sound, then ask your child to find the word.',
  options: ['sit', 'mat', 'sat'],
  answer: 'sat',
  hint: 'Start with the sound s. Listen for the short a next.',
  success: 'You joined the sounds to make sat.',
}

export function quickCheckForGoal(conceptKey: string, needsReview: boolean): LessonQuickCheck | null {
  if (conceptKey !== 'e56_blend_cvc') return null
  return needsReview ? blendingReviewCheck : blendingCheck
}
