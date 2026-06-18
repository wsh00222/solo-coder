import { useEffect } from 'react';

function Toast({ message, type = 'success', duration = 3000, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' && '✅ '}
      {type === 'error' && '❌ '}
      {message}
    </div>
  );
}

export default Toast;
