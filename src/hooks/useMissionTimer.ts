import { useState, useEffect, useRef } from 'react';

interface UseMissionTimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onExpire: () => void;
}

export function useMissionTimer({
  initialSeconds,
  isRunning,
  onExpire
}: UseMissionTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  let statusClass = 'normal';
  if (secondsLeft <= 20) {
    statusClass = 'critical';
  } else if (secondsLeft <= 60) {
    statusClass = 'warning';
  }

  return {
    secondsLeft,
    formatted,
    statusClass,
    timeTakenSeconds: initialSeconds - secondsLeft
  };
}