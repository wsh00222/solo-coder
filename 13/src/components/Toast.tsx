import { useAppStore } from '../store/appStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export function Toast() {
  const message = useAppStore(s => s.message);
  const clearMessage = useAppStore(s => s.clearMessage);

  if (!message) return null;

  const styles = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };

  const Icon = icons[message.type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${styles[message.type]} max-w-sm`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium text-sm flex-1">{message.text}</span>
        <button onClick={clearMessage} className="opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
