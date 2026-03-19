import { create } from 'zustand';

interface TimerState {
  isRunning: boolean;
  secondsLeft: number;
  duration: number;
  intervalRef: ReturnType<typeof setInterval> | null;

  start: (duration: number) => void;
  stop: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  secondsLeft: 90,
  duration: 90,
  intervalRef: null,

  start: (duration: number) => {
    const { intervalRef } = get();
    if (intervalRef) clearInterval(intervalRef);

    const ref = setInterval(() => {
      get().tick();
    }, 1000);

    set({ isRunning: true, secondsLeft: duration, duration, intervalRef: ref });
  },

  stop: () => {
    const { intervalRef } = get();
    if (intervalRef) clearInterval(intervalRef);
    set({ isRunning: false, intervalRef: null });
  },

  reset: () => {
    const { intervalRef, duration } = get();
    if (intervalRef) clearInterval(intervalRef);
    set({ isRunning: false, secondsLeft: duration, intervalRef: null });
  },

  tick: () => {
    const { secondsLeft, stop } = get();
    if (secondsLeft <= 1) {
      stop();
      set({ secondsLeft: 0 });
    } else {
      set({ secondsLeft: secondsLeft - 1 });
    }
  },
}));
