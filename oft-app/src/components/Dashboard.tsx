/**
 * Главная страница приложения: показывает dashboard в зависимости от роли
 */

import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../router/routes';
import Spinner from '../components/ui/Spinner';

const TrainerDashboard = lazy(() => import('../pages/trainer/TrainerDashboard'));
const ClientDashboard = lazy(() => import('../pages/client/ClientHome'));

const LoadingFallback = () => (
  <div
    className="min-h-screen flex items-center justify-center animate-fade-in"
    style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)'
    }}
  >
    <div className="text-center">
      <Spinner size="lg" />
      <p
        className="mt-4 text-lg font-medium animate-pulse-once"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Загрузка...
      </p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, role } = useAuthStore();
  const { activeClient } = useAppStore();

  // Если не авторизован, перенаправляем на auth
  if (!user || !role) {
    return <Navigate to="/" replace />;
  }

  // Для клиента: проверяем, прошел ли онбординг
  if (role === 'client' && activeClient?.isFirstLogin) {
    return <Navigate to={ROUTES.CLIENT.ONBOARDING} replace />;
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingFallback />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {role === 'trainer' ? (
            <TrainerDashboard />
          ) : (
            <ClientDashboard />
          )}
        </motion.div>
      </Suspense>
    </div>
  );
}