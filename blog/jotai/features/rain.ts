import { atomWithStorage } from 'jotai/utils'

export const rainEffectAtom = atomWithStorage<boolean>('rainEffect', false)
rainEffectAtom.debugLabel = 'rainEffectAtom'