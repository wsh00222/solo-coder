import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isShaking?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'danger',
  isShaking = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-100',
      confirm: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: 'text-yellow-500',
      iconBg: 'bg-yellow-100',
      confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-100',
      confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className={isShaking ? 'animate-shake' : ''}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${styles.iconBg}`}>
            <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl transition-colors font-medium ${styles.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
