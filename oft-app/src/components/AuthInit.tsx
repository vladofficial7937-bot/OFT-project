/**
 * Инициализация авторизации: Supabase + Telegram Mini App.
 * - При старте: проверка профиля по tg_id.
 * - Если профиль найден: сразу в Dashboard.
 * - Если нет: экран приветствия с подтверждением, затем выбор роли.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore, type AuthUser } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { getTelegramWebApp } from '../lib/telegramWebApp';
import { isMiniApp } from '../lib/telegramWebApp';
import { fetchProfile, fetchClientsForTrainer } from '../lib/supabaseProfiles';
import { ROUTES } from '../router/routes';
import Spinner from '../components/ui/Spinner';

const REHYDRATE_DELAY_MS = 280;

export default function AuthInit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const didInit = useRef(false);

  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  navigateRef.current = navigate;
  locationRef.current = location;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), REHYDRATE_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || didInit.current) return;
    
    // Дополнительная проверка - не инициализируем, если уже на нужной странице
    const currentPath = locationRef.current.pathname;
    if (currentPath !== '/' && currentPath !== '/auth/telegram' && currentPath !== '/auth/role-select') {
      didInit.current = true;
      return;
    }
    
    didInit.current = true;

    const run = async () => {
      let tgId: string;
      let userData: any = null;

      if (isMiniApp()) {
        const wa = getTelegramWebApp();
        userData = (wa as any)?.initDataUnsafe?.user;
        if (userData) {
          tgId = String(userData.id);
        } else {
          // Если нет данных, использовать тестовый
          tgId = '99999';
          userData = { id: 99999, first_name: 'Test User', username: 'testuser' };
        }
      } else {
        // Для браузера: тестовый id
        tgId = '99999';
        userData = { id: 99999, first_name: 'Test User', username: 'testuser' };
      }

      const user: AuthUser = {
        id: tgId,
        firstName: userData.first_name || 'User',
        username: userData.username || '',
      };
      setAuthUser(user);

      // Запрос профиля
      const profile = await fetchProfile(tgId);
      setLoading(false);

      if (profile) {
        // Профиль найден: сразу в Dashboard
        useAuthStore.getState().login(user, profile.role);
        const app = useAppStore.getState();
        if (app.userMode !== profile.role) {
          app.setMode(profile.role);
        }

        const nav = navigateRef.current;
        if (profile.role === 'client') {
          const tgUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: '',
            username: user.username,
            photoUrl: '',
            authDate: Math.floor(Date.now() / 1000),
            hash: 'miniapp',
          };
          const { isNewUser, client } = app.loginViaTelegram(tgUser);
          app.selectClient(client.id);
          nav(isNewUser ? ROUTES.CLIENT.ONBOARDING : ROUTES.CLIENT.HOME, { replace: true });
        } else {
          // Загружаем клиентов для тренера
          const clients = await fetchClientsForTrainer(user.id);
          if (clients.length > 0) {
            clients.forEach(client => {
              const existing = app.clients.find(c => c.id === client.id);
              if (!existing) {
                app.addClient(client);
              }
            });
          }
          nav(ROUTES.TRAINER.DASHBOARD, { replace: true });
        }
      } else {
        // Профиль не найден: показать welcome
        setShowWelcome(true);
      }
    };

    run();
  }, [ready]);

  const handleConfirmRegistration = async () => {
    if (!isMiniApp()) {
      // Для браузера: сразу к выбору роли
      setShowWelcome(false);
      navigate(ROUTES.AUTH.ROLE_SELECT, { replace: true, state: { user: authUser } });
      return;
    }

    const wa = getTelegramWebApp();
    if (wa?.showConfirm) {
      wa.showConfirm('Подтвердите создание профиля в OFT', (confirmed) => {
        if (confirmed) {
          setShowWelcome(false);
          navigate(ROUTES.AUTH.ROLE_SELECT, { replace: true, state: { user: authUser } });
        }
      });
    } else {
      // Fallback
      setShowWelcome(false);
      navigate(ROUTES.AUTH.ROLE_SELECT, { replace: true, state: { user: authUser } });
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center animate-fade-in"
        style={{ 
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)'
        }}
      >
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            Проверяем профиль...
          </p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in"
        style={{ 
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div 
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="mb-6">
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #26A5E4 0%, #0088cc 100%)',
                  boxShadow: '0 8px 24px rgba(38, 165, 228, 0.3)',
                }}
              >
                <span className="text-4xl">🎉</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Добро пожаловать в OFT</h1>
              <p className="text-white/70">
                Персональный фитнес-тренер в вашем кармане
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmRegistration}
              className="w-full py-4 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #26A5E4 0%, #0088cc 100%)',
                boxShadow: '0 8px 24px rgba(38, 165, 228, 0.3)',
              }}
            >
              <span>Подтвердить регистрацию через Telegram</span>
            </motion.button>

            <p className="text-xs text-white/50 mt-4">
              Мы создадим ваш профиль и синхронизируем данные
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
