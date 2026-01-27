/**
 * Основной Layout компонент с адаптивной навигацией
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCoachingStore } from '../../store/useCoachingStore';
import { ROUTES } from '../../router/routes';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import AIAssistant from '../ai/AIAssistant';
import RequestsDropdown from '../trainer/RequestsDropdown';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMiniApp, hapticTap, webApp } = useTelegramWebApp();

  const activeClient = useAppStore((state) => state.activeClient);
  const clients = useAppStore((state) => state.clients || []);
  const appLogout = useAppStore((state) => state.logout);
  const authLogout = useAuthStore((state) => state.logout);
  const addToast = useAppStore((state) => state.addToast);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const logoutMenuRef = useRef<HTMLDivElement>(null);
  const client = activeClient || clients[0];
  const isTrainerMode = location.pathname.startsWith('/trainer');
  const authUser = useAuthStore((s) => s.user);
  const authRole = useAuthStore((s) => s.role);
  
  // Состояние для ширины экрана
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Мемоизируем trainerId чтобы избежать пересчетов
  const trainerId = useMemo(() => {
    return authRole === 'trainer' ? (authUser?.username || authUser?.id || 'onlineft_bot') : '';
  }, [authRole, authUser?.username, authUser?.id]);
  
  // Используем селектор Zustand правильно - подписываемся на requests, а не вызываем функцию
  const coachingRequests = useCoachingStore((s) => s.requests);
  const pendingRequests = useMemo(() => {
    if (!trainerId) return [];
    return coachingRequests.filter(
      (r) => r.trainerId === trainerId && r.status === 'pending'
    );
  }, [trainerId, coachingRequests]);
  
  const acceptRequest = useCoachingStore((s) => s.acceptRequest);
  const rejectRequest = useCoachingStore((s) => s.rejectRequest);
  const updateClient = useAppStore((s) => s.updateClient);
  const [showRequestsDropdown, setShowRequestsDropdown] = useState(false);
  const requestsDropdownRef = useRef<HTMLDivElement>(null);

  // Telegram BackButton: показывать когда не на корне раздела
  const isRoot = location.pathname === '/' || location.pathname === '/client' || location.pathname === '/trainer';
  const backHandlerRef = useRef<() => void>(() => navigate(-1));

  useEffect(() => {
    backHandlerRef.current = () => {
      hapticTap('light');
      navigate(-1);
    };
  }, [hapticTap, navigate]);

  useEffect(() => {
    if (!webApp?.BackButton) return;
    if (isRoot) {
      webApp.BackButton.hide();
    } else {
      webApp.BackButton.show();
    }
    const fn = () => backHandlerRef.current();
    webApp.BackButton.onClick(fn);
    return () => {
      webApp.BackButton.offClick(fn);
      webApp.BackButton.hide();
    };
  }, [webApp, isRoot]);

  const handleLogout = () => {
    authLogout();
    appLogout();
    addToast({ type: 'info', message: 'Вы вышли из системы' });
    setShowLogoutConfirm(false);
    navigate(ROUTES.HOME);
  };

  // Закрытие меню выхода при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(target)) {
        setShowLogoutConfirm(false);
      }
      if (requestsDropdownRef.current && !requestsDropdownRef.current.contains(target)) {
        setShowRequestsDropdown(false);
      }
    };

    if (showLogoutConfirm || showRequestsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLogoutConfirm, showRequestsDropdown]);

  const handleGoHome = () => {
    navigate(ROUTES.HOME);
  };

  // Навигация для тренера
  const trainerNav = [
    { path: ROUTES.TRAINER.DASHBOARD, label: 'Клиенты', icon: '👥', shortLabel: 'Клиенты' },
    { path: ROUTES.TRAINER.ADD_CLIENT, label: 'Добавить клиента', icon: '➕', shortLabel: 'Добавить' },
  ];

  // Навигация для клиента — короткие подписи под узкий viewport (Mini App)
  const clientNav = [
    { path: ROUTES.CLIENT.HOME, label: 'Главная', icon: '🏠', shortLabel: 'Дом' },
    { path: ROUTES.CLIENT.GENERATOR, label: 'Генератор', icon: '✨', shortLabel: 'Генер.' },
    { path: ROUTES.CLIENT.CATALOG, label: 'Каталог', icon: '📚', shortLabel: 'Каталог' },
    { path: ROUTES.CLIENT.PROGRAMS, label: 'Программы', icon: '📜', shortLabel: 'Прогр.' },
    { path: ROUTES.CLIENT.PROFILE, label: 'Профиль', icon: '👤', shortLabel: 'Профиль' },
  ];

  const navItems = isTrainerMode ? trainerNav : clientNav;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Шапка: стекло, размытие */}
      <header
        className="border-b sticky top-0 z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
          paddingTop: 'var(--safe-area-inset-top)',
        }}
      >
        <div className={`max-w-7xl mx-auto px-3 sm:px-4 ${isMiniApp ? 'py-2' : 'py-4'}`}>
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* Лого */}
            <button
              onClick={() => {
                if (isMiniApp) hapticTap('light');
                handleGoHome();
              }}
              className={`font-bold transition-all duration-300 hover:scale-110 ${isMiniApp ? 'text-xl' : 'text-2xl'}`}
              style={{
                color: 'var(--color-accent)',
                textShadow: '0 0 15px #FF0000',
              }}
              aria-label="Вернуться на главную"
            >
              OFT
            </button>

            {/* Режим */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink">
              {client && !isTrainerMode && (
                <div className="text-right min-w-0">
                  <div 
                    className="text-sm font-semibold animate-fade-in truncate max-w-[120px] sm:max-w-none"
                    style={{ color: 'var(--color-text-primary)' }}
                    title={client.name}
                  >
                    {client.name}
                  </div>
                </div>
              )}
              
              {isTrainerMode && (
                <div className="relative" ref={requestsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isMiniApp) hapticTap('light');
                      setShowRequestsDropdown((v) => !v);
                    }}
                    className="p-1.5 rounded-xl transition-transform hover:scale-110 flex items-center justify-center"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    aria-label="Заявки"
                  >
                    <Bell className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
                  </button>
                  {pendingRequests.length > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full animate-pulse"
                      style={{
                        backgroundColor: '#FF5252',
                        boxShadow: '0 0 8px rgba(255, 82, 82, 0.8)',
                      }}
                    />
                  )}
                  {showRequestsDropdown && (
                    <RequestsDropdown
                      pendingRequests={pendingRequests}
                      clients={clients}
                      onAccept={(req) => {
                        acceptRequest(req.id);
                        updateClient(req.clientId, { assignedTrainerId: req.trainerId });
                        addToast({ type: 'success', message: 'Заявка принята' });
                        setShowRequestsDropdown(false);
                      }}
                      onReject={(req) => {
                        rejectRequest(req.id);
                        addToast({ type: 'info', message: 'Заявка отклонена' });
                      }}
                    />
                  )}
                </div>
              )}
              
              <span
                className="badge-primary px-3 py-1 rounded-full text-xs font-semibold animate-scale-in truncate max-w-[140px] sm:max-w-[200px]"
                style={{
                  background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
                  boxShadow: '0 0 15px #FF0000',
                }}
                title={isTrainerMode ? 'Тренер' : (client?.name ?? 'Клиент')}
              >
                {isTrainerMode ? '👨‍🏫 Тренер' : (client?.name ? `🏃 ${client.name}` : '🏃 Клиент')}
              </span>

              {/* Кнопка выхода */}
              <div className="relative" ref={logoutMenuRef}>
                <button
                  onClick={() => {
                    if (isMiniApp) hapticTap('light');
                    setShowLogoutConfirm(!showLogoutConfirm);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                  }}
                  title="Выйти из системы"
                >
                  Выйти
                </button>

                {/* Подтверждение выхода */}
                {showLogoutConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 p-3 rounded-[20px] shadow-xl z-50 min-w-[200px]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      Вы уверены, что хотите выйти?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (isMiniApp) hapticTap('light');
                          handleLogout();
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{
                          background: '#ef4444',
                          color: 'white',
                        }}
                      >
                        Да
                      </button>
                      <button
                        onClick={() => {
                          if (isMiniApp) hapticTap('light');
                          setShowLogoutConfirm(false);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{
                          background: 'var(--color-background-secondary)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        Нет
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Навигация для десктопа — стекло */}
      <nav
        className="border-b overflow-x-auto hidden md:block"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-3">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isMiniApp && hapticTap('light')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap relative overflow-visible ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  aria-label={item.label}
                >
                  {isActive && (
                    <>
                      <span
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 0 15px #FF0000, 0 8px 32px 0 rgba(0, 0, 0, 0.8)',
                        }}
                      />
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{
                          background: '#FF0000',
                          boxShadow: '0 0 15px #FF0000',
                        }}
                      />
                    </>
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="relative" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1 pb-[calc(5rem+var(--safe-area-inset-bottom))] md:pb-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <footer
        className="border-t mt-auto hidden md:block"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div>© 2026 OFT - Онлайн Фитнес Тренер</div>
            <button onClick={handleGoHome} className="hover:underline">
              Сменить режим
            </button>
          </div>
        </div>
      </footer>

      <nav
        className="fixed bottom-0 left-0 right-0 border-t md:hidden z-50 bottom-nav-safe"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8), 0 -4px 24px 0 rgba(0, 0, 0, 0.4)',
          paddingBottom: 'max(0.75rem, var(--safe-area-inset-bottom))',
        }}
      >
        <div className="flex justify-around items-center px-1 py-3 max-w-lg mx-auto gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMiniApp && hapticTap('light')}
                className="flex flex-col items-center justify-center flex-1 py-2 px-2 rounded-xl transition-all duration-300 relative min-w-0 min-h-[56px] touch-manipulation"
                style={{
                  color: isActive ? '#FF0000' : '#6b7280',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
                aria-label={item.label}
              >
                {isActive && (
                  <span
                    className="absolute inset-1 rounded-xl -z-10"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 0 15px #FF0000, 0 8px 32px 0 rgba(0, 0, 0, 0.8)',
                    }}
                  />
                )}
                <span
                  className="text-2xl sm:text-[28px] mb-1 transition-all duration-300 relative select-none"
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 15px #FF0000)' : 'none',
                  }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span
                  className="text-[10px] sm:text-[11px] font-medium text-center leading-tight w-full break-words"
                  style={{
                    color: isActive ? '#FF0000' : '#6b7280',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ИИ-помощник (доступен на всех страницах) */}
      <AIAssistant />

      {/* Нижняя навигация для мобильных клиентов */}
      {isMobile && !isTrainerMode && authRole === 'client' && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom" style={{ background: 'var(--color-background)' }}>
          <div className="flex items-center justify-around py-2 px-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {[
              { path: ROUTES.CLIENT.HOME, label: 'Главная', icon: '🏠' },
              { path: ROUTES.CLIENT.MY_PLAN, label: 'План', icon: '📋' },
              { path: ROUTES.CLIENT.PROGRESS, label: 'Прогресс', icon: '📊' },
              { path: ROUTES.CLIENT.PROFILE, label: 'Профиль', icon: '👤' },
            ].map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    hapticTap('light');
                    navigate(item.path);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Кнопка очистки данных (только для разработки) */}
      {import.meta.env.DEV && (
        <div className="fixed left-4 z-40 bottom-[calc(5.5rem+var(--safe-area-inset-bottom))] md:bottom-4">
          <button
            onClick={() => {
              if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
                const clearAllData = useAppStore.getState().clearAllData;
                clearAllData();
                window.location.reload();
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 opacity-50 hover:opacity-100"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
            title="Очистить демо-данные"
          >
            🗑️ Dev: Clear
          </button>
        </div>
      )}
    </div>
  );
}
