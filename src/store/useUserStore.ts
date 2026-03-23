import { create } from 'zustand';
import type { UserProfile } from '../types';
import { getUserProfile, updateUserProfile } from '../db/repositories/progressRepo';

interface UserState {
  profile: UserProfile | null;
  loadProfile: () => Promise<void>;
  saveProfile: (fields: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,

  loadProfile: async () => {
    const profile = await getUserProfile();
    set({ profile });
  },

  saveProfile: async (fields) => {
    await updateUserProfile(fields);
    const current = get().profile;
    if (current) {
      set({ profile: { ...current, ...fields } });
    }
  },
}));
