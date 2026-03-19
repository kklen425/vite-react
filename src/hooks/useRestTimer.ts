import { useState, useEffect, useCallback, useRef } from 'react';

export function useRestTimer(defaultSeconds: number) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = useCallback((secs?: number) => {
    setSeconds(secs ?? defaultSeconds);
    setRunning(true);
  }, [defaultSeconds]);

  const stop = useCallback(() => {
    setRunning(false);
    setSeconds(defaultSeconds);
  }, [defaultSeconds]);

  const addTime = useCallback((extra: number) => {
    setSeconds(s => s + extra);
  }, []);

  return { seconds, running, start, stop, addTime };
}
