import { useState, useCallback } from 'react';
import type { UserPrefs } from '../types';
import { loadPrefs, savePrefs } from '../utils/storage';

export function useUserPrefs() {
  const [prefs, setPrefs] = useState<UserPrefs>(loadPrefs);

  const updatePrefs = useCallback((updates: Partial<UserPrefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...updates };
      savePrefs(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(
    (goal: UserPrefs['goal'], frequency: number, experience: UserPrefs['experience']) => {
      updatePrefs({ onboardingComplete: true, goal, frequency, experience });
    },
    [updatePrefs]
  );

  const togglePro = useCallback(() => {
    updatePrefs({ isPro: !prefs.isPro });
  }, [prefs.isPro, updatePrefs]);

  return { prefs, updatePrefs, completeOnboarding, togglePro };
}
