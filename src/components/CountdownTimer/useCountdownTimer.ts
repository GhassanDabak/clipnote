import { useState, useEffect, useCallback } from "react";

interface UseCountdownTimerOptions {
  initialCount?: number;
  onComplete?: () => void;
}

export function useCountdownTimer({
  initialCount = 3,
  onComplete
}: UseCountdownTimerOptions = {}) {
  const [count, setCount] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  const start = useCallback(() => {
    setCount(initialCount);
    setIsActive(true);
  }, [initialCount]);

  const stop = useCallback(() => {
    setCount(null);
    setIsActive(false);
  }, []);

  useEffect(() => {
    if (!isActive || count === null) return;

    if (count === 0) {
      // First hide the countdown UI
      setCount(null);
      setIsActive(false);

      // Then wait a bit before starting the recording
      setTimeout(() => {
        onComplete?.();
      }, 200);
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isActive, onComplete]);

  return {
    count,
    isActive,
    start,
    stop,
  };
}
