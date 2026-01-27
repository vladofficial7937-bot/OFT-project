/**
 * Контейнер для Toast уведомлений
 */

import { useAppStore } from '../../store/useAppStore';
import Toast, { type ToastData } from './Toast';

export default function ToastContainer() {
  const toasts = useAppStore((state) => state.toasts || []);
  const removeToast = useAppStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-md">
      {toasts.map((toast: ToastData) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
