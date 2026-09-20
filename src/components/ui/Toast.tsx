import { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClear: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClear, duration = 3200 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClear();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClear, duration]);

  if (!message) return null;

  return (
    <div id="toast" className="toast">
      {message}
    </div>
  );
};