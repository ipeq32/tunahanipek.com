import { atomWithStorage } from 'jotai/utils'

export const blogSidebarOpenAtom = atomWithStorage<boolean>('blogSidebarOpen', false)
blogSidebarOpenAtom.debugLabel = 'blogSidebarOpenAtom'