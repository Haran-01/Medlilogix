import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';
import { cn } from '../../utils/cn';

export type ToastTone = 'success' | 'warning' | 'danger' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}

const toneConfig: Record<ToastTone, { className: string; icon: typeof FiInfo }> = {
  danger: { className: 'border-rose-200 bg-rose-50 text-rose-700', icon: FiXCircle },
  info: { className: 'border-blue-200 bg-blue-50 text-blue-700', icon: FiInfo },
  success: { className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: FiCheckCircle },
  warning: { className: 'border-amber-200 bg-amber-50 text-amber-700', icon: FiAlertCircle },
};

interface ToastStackProps {
  messages: ToastMessage[];
}

export function ToastStack({ messages }: ToastStackProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-5 top-24 z-[60] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-3">
      {messages.map((toast) => {
        const Icon = toneConfig[toast.tone].icon;

        return (
          <div
            className={cn(
              'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-bold shadow-[0_18px_40px_rgba(15,23,42,0.14)]',
              toneConfig[toast.tone].className,
            )}
            key={toast.id}
          >
            <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
