import { useAppStore } from '../store/appStore';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ReminderBanner() {
  const reminder = useAppStore(s => s.reminder);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reminder?.message) setVisible(true);
  }, [reminder?.message]);

  if (!reminder || !reminder.message || !visible) return null;

  const isDanger = reminder.level === 'danger';

  return (
    <div className={`rounded-xl p-4 border mb-4 flex items-center justify-between gap-3 transition-all
      ${isDanger ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {isDanger ? (
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
        )}
        <div className={`font-medium truncate ${isDanger ? 'text-red-700' : 'text-yellow-800'}`}>
          {reminder.message}
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className={`p-1 rounded-md transition-colors flex-shrink-0
          ${isDanger ? 'hover:bg-red-100 text-red-500' : 'hover:bg-yellow-100 text-yellow-600'}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
