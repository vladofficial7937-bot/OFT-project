/**
 * Компонент Toast уведомления
 */

import { useEffect } from 'react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const getBackgroundColor = () => {
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b',
    };
    return colors[toast.type];
  };

  const accent = getBackgroundColor();
  return (
    <div
      className="text-white px-6 py-4 rounded-[20px] flex items-center gap-3 min-w-[300px] animate-slide-up"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderLeft: `4px solid ${accent}`,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
      }}
    >
      <span className="text-2xl">{icons[toast.type]}</span>
      <p className="flex-1 font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/80 hover:text-white text-xl leading-none transition-opacity"
        aria-label="Закрыть уведомление"
      >
        ×
      </button>
    </div>
  );
}
