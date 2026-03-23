import { create } from 'zustand';

interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  setIsPro: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPro: false,
  isLoading: false,
  setIsPro: (value) => set({ isPro: value }),
  setLoading: (value) => set({ isLoading: value }),
}));
