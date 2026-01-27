import { lazy, Suspense, useEffect, useState, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { ROUTES } from './router/routes';
import { isMiniApp } from './lib/telegramWebApp';

import Layout from './components/layout/Layout';
import ToastContainer from './components/ui/ToastContainer';
import Spinner from './components/ui/Spinner';
import SplashCursor from './components/ui/SplashCursor';
import MiniAppInit from './components/MiniAppInit';
import AuthInit from './components/AuthInit';

const StartPage = lazy(() => import('./pages/StartPage'));
const TelegramAuth = lazy(() => import('./pages/auth/TelegramAuth'));
const RoleSelectPage = lazy(() => import('./pages/auth/RoleSelectPage'));

// Trainer pages - Lazy loaded
const TrainerDashboard = lazy(() => import('./pages/trainer/TrainerDashboard'));
const AddClientWizard = lazy(() => import('./pages/trainer/AddClientWizard'));
const AssignWorkout = lazy(() => import('./pages/trainer/AssignWorkout'));
const ClientProfile = lazy(() => import('./pages/trainer/ClientProfile'));

// Client pages - Lazy loaded
const ClientHome = lazy(() => import('./pages/client/ClientHome'));
const Onboarding = lazy(() => import('./pages/client/Onboarding'));
const Catalog = lazy(() => import('./pages/client/Catalog'));
const ExerciseDetail = lazy(() => import('./pages/client/ExerciseDetail'));
const TodayWorkout = lazy(() => import('./pages/client/TodayWorkout'));
const Progress = lazy(() => import('./pages/client/Progress'));
const Profile = lazy(() => import('./pages/client/Profile'));
const WorkoutHistory = lazy(() => import('./pages/client/WorkoutHistory'));
const MyPlan = lazy(() => import('./pages/client/MyPlan'));
const Programs = lazy(() => import('./pages/client/Programs'));
const WorkoutGenerator = lazy(() => import('./pages/client/WorkoutGenerator'));

// Loading fallback component
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

/** Ожидание rehydrate persist перед проверкой авторизации */
// Глобальный флаг готовности - инициализируется один раз
let globalReadyState = false;
let globalReadyTimer: ReturnType<typeof setTimeout> | null = null;
const globalReadyListeners: Array<(v: boolean) => void> = [];

function useAuthReady() {
  const [ready, setReady] = useState(globalReadyState);

  useEffect(() => {
    // If already ready, ensure state is true
    if (globalReadyState) {
      if (!ready) setReady(true);
      return;
    }

    // Register listener to be notified when global becomes ready
    const listener = (v: boolean) => {
      if (v) setReady(true);
    };
    globalReadyListeners.push(listener);

    // Start a single global timer to flip ready state (only once)
    if (!globalReadyTimer) {
      globalReadyTimer = setTimeout(() => {
        globalReadyState = true;
        // notify all listeners
        globalReadyListeners.forEach((l) => {
          try {
            l(true);
          } catch (e) {
            // ignore listener errors
          }
        });
        // clear timer reference
        globalReadyTimer = null;
      }, 280);
    }

    return () => {
      // remove listener on unmount
      const idx = globalReadyListeners.indexOf(listener);
      if (idx !== -1) globalReadyListeners.splice(idx, 1);
    };
  }, [ready]);

  return ready;
}

function AuthGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const ready = useAuthReady();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);

  if (!ready) return <LoadingFallback />;

  if (isAuth && role === 'client' && location.pathname === '/auth/telegram') {
    return <Navigate to={ROUTES.CLIENT.HOME} replace />;
  }

  return <>{children}</>;
}

function ClientRouteGuard({ children }: { children: ReactNode }) {
  const activeClient = useAppStore((s) => s.activeClient);
  const clients = useAppStore((s) => s.clients || []);
  const client = activeClient || clients[0];
  const location = useLocation();
  const hasRedirectedRef = useRef(false);

  // Разрешаем доступ к onboarding без проверок
  if (location.pathname === '/client/onboarding') {
    hasRedirectedRef.current = false;
    return <>{children}</>;
  }
  
  if (!client) return <>{children}</>;
  
  // Проверяем isFirstLogin только если он явно true (не undefined и не false)
  // Предотвращаем бесконечные редиректы
  if (client.isFirstLogin === true && !hasRedirectedRef.current) {
    hasRedirectedRef.current = true;
    return <Navigate to="/client/onboarding" replace />;
  }
  
  hasRedirectedRef.current = false;
  return <>{children}</>;
}

function TrainerRouteGuard({ children }: { children: ReactNode }) {
  const ready = useAuthReady();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  if (!ready) return <LoadingFallback />;
  if (!isAuth || role !== 'trainer') {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <>{children}</>;
}

function ClientRouteGuardByAuth({ children }: { children: ReactNode }) {
  const ready = useAuthReady();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  if (!ready) return <LoadingFallback />;
  if (!isAuth || role !== 'client') {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const ready = useAuthReady();
  const hasRedirectedRef = useRef(false);
  const lastPathRef = useRef(location.pathname);

  const onRoot = location.pathname === '/';
  
  // Сбрасываем флаг редиректа при изменении пути
  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      lastPathRef.current = location.pathname;
      hasRedirectedRef.current = false;
    }
  }, [location.pathname]);
  
  // Используем useMemo для предотвращения пересчета на каждом рендере
  const redirectTo = useMemo(() => {
    // Если не готов или не авторизован - не редиректим
    if (!ready || !isAuth || !role || !onRoot) {
      return null;
    }
    
    // Предотвращаем повторные редиректы
    if (hasRedirectedRef.current) {
      return null;
    }
    
    const target = role === 'trainer'
      ? ROUTES.TRAINER.DASHBOARD
      : ROUTES.CLIENT.HOME;
    
    // Проверяем, что мы не уже на целевой странице
    if (location.pathname === target) {
      return null;
    }
    
    // Устанавливаем флаг только если действительно нужно редиректить
    hasRedirectedRef.current = true;
    return target;
  }, [ready, isAuth, role, onRoot, location.pathname]);

  return (
    <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            redirectTo ? (
              <Navigate to={redirectTo} replace />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StartPage />
              </motion.div>
            )
          }
        />
        <Route
          path="/auth/telegram"
          element={
            <AuthGuard>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TelegramAuth />
              </motion.div>
            </AuthGuard>
          }
        />
        <Route
          path="/auth/role-select"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <RoleSelectPage />
            </Suspense>
          }
        />

        <Route
          path="/trainer/*"
          element={
            <TrainerRouteGuard>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Routes>
                      <Route index element={<TrainerDashboard />} />
                      <Route path="add-client" element={<AddClientWizard />} />
                      <Route path="assign/:clientId" element={<AssignWorkout />} />
                      <Route path="client/:id" element={<ClientProfile />} />
                    </Routes>
                  </motion.div>
                </Suspense>
              </Layout>
            </TrainerRouteGuard>
          }
        />

        <Route
          path="/client/*"
          element={
            <ClientRouteGuardByAuth>
            <ClientRouteGuard>
              <Layout>
                <Suspense fallback={<LoadingFallback />}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Routes>
                      <Route 
                        path="onboarding" 
                        element={
                          <div style={{ minHeight: '100vh' }}>
                            <Onboarding />
                          </div>
                        } 
                      />
                      <Route index element={<ClientHome />} />
                      <Route path="catalog" element={<Catalog />} />
                      <Route path="muscle-map" element={<Navigate to={ROUTES.CLIENT.CATALOG + '?tab=map'} replace />} />
                      <Route path="exercises" element={<Navigate to={ROUTES.CLIENT.CATALOG + '?tab=list'} replace />} />
                      <Route path="exercises/:id" element={<ExerciseDetail />} />
                      <Route path="today" element={<TodayWorkout />} />
                      <Route path="progress" element={<Progress />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="history" element={<WorkoutHistory />} />
                      <Route path="my-plan" element={<MyPlan />} />
                      <Route path="programs" element={<Programs />} />
                      <Route path="workout-generator" element={<WorkoutGenerator />} />
                      <Route path="generator" element={<WorkoutGenerator />} />
                    </Routes>
                  </motion.div>
                </Suspense>
              </Layout>
            </ClientRouteGuard>
            </ClientRouteGuardByAuth>
          }
        />
        </Routes>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const miniApp = isMiniApp();

  useEffect(() => {
    if (miniApp) setShowSplash(false);
  }, [miniApp]);

  return (
    <>
      <MiniAppInit />
      <BrowserRouter>
        <AuthInit />
        <div className="min-h-screen">
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
          <ToastContainer />
        </div>
      </BrowserRouter>
      {showSplash && !miniApp && (
        <SplashCursor onFinish={() => setShowSplash(false)} />
      )}
    </>
  );
}

export default App;
