import { create } from 'zustand'

export interface Profile {
  name: string
  email: string
}

interface ProfileState {
  profile: Profile | null
  setProfile: (profile: Profile) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile })
}))
