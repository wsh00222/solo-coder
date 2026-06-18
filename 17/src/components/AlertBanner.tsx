import { AlertTriangle, X, Flame } from 'lucide-react';
import type { Alert } from '../../shared/types.js';

interface AlertBannerProps {
  alerts?: Alert[];
  alert?: Alert;
  onDismiss?: (planId: number) => void;
  onNavigate?: (planId: number) => void;
}

export default function AlertBanner({ alerts, alert, onDismiss, onNavigate }: AlertBannerProps) {
  const displayAlerts = alert ? [alert] : (alerts || []);
  if (displayAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {displayAlerts.map((alert) => (
        <div
          key={alert.planId}
          className={`relative overflow-hidden rounded-lg p-4 transition-all duration-300 ${
            alert.severity === 'danger'
              ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
              : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  alert.severity === 'danger' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
              >
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p
                  className={`font-semibold ${
                    alert.severity === 'danger' ? 'text-red-800' : 'text-yellow-800'
                  }`}
                >
                  计划「{alert.planName}」已 {alert.days} 天未学习
                </p>
                <p
                  className={`text-sm ${
                    alert.severity === 'danger' ? 'text-red-600' : 'text-yellow-600'
                  }`}
                >
                  {alert.severity === 'danger'
                    ? '立即恢复学习，保持良好习惯！'
                    : '别中断，继续加油！'}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  alert.severity === 'danger'
                    ? 'bg-red-200 text-red-700'
                    : 'bg-yellow-200 text-yellow-700'
                }`}
              >
                <Flame className="w-4 h-4" />
                {alert.days} 天
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onNavigate && (
                <button
                  onClick={() => onNavigate(alert.planId)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    alert.severity === 'danger'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  去学习
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.planId)}
                  className={`p-2 rounded-lg transition-colors ${
                    alert.severity === 'danger'
                      ? 'hover:bg-red-200 text-red-600'
                      : 'hover:bg-yellow-200 text-yellow-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
