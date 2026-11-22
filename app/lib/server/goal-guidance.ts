import { mathBlueprintGuidance } from './math-blueprint'
import { scienceBlueprintGuidance } from './science-blueprint'

export function goalGuidance(conceptKey: string) {
  return mathBlueprintGuidance(conceptKey) || scienceBlueprintGuidance(conceptKey)
}
