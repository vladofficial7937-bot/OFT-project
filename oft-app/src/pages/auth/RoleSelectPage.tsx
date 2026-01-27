/**
 * Выбор роли при первой регистрации (Telegram Mini App + Supabase).
 * После выбора: INSERT в profiles → Zustand → редирект в кабинет.
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore, type AuthUser } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { useCoachingStore } from '../../store/useCoachingStore';
import { insertProfile } from '../../lib/supabaseProfiles';
import { getTelegramWebApp } from '../../lib/telegramWebApp';
import { ROUTES } from '../../router/routes';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loginViaTelegram = useAppStore((s) => s.loginViaTelegram);
  const setMode = useAppStore((s) => s.setMode);
  const addToast = useAppStore((s) => s.addToast);
  const addTrainer = useCoachingStore((s) => s.addTrainer);

  const user = location.state?.user as AuthUser | undefined;

  const handleSelect = async (role: 'client' | 'trainer') => {
    if (!user) {
      addToast({ type: 'error', message: 'Нет данных пользователя. Откройте приложение из Telegram.' });
      return;
    }
    setLoading(true);
    const { success, error } = await insertProfile({
      id: user.id,
      role,
      first_name: user.firstName,
      username: user.username || undefined,
    });
    setLoading(false);
    if (!success) {
      addToast({ type: 'error', message: error || 'Не удалось сохранить роль. Попробуйте снова.' });
      return;
    }

    // Показать подтверждение регистрации
    const wa = getTelegramWebApp();
    if (wa?.showAlert) {
      wa.showAlert('Регистрация завершена! Данные синхронизированы.');
    }

    login(user, role);
    if (role === 'trainer') {
      // Добавляем тренера в список доступных тренеров
      addTrainer({
        id: user.id,
        username: user.username || user.firstName,
        bio: 'Новый тренер. Заполните профиль для подробностей.',
        age: undefined, // Можно добавить позже
        photoUrl: undefined,
        specializations: [],
      });
      setMode('trainer');
      addToast({ type: 'success', message: 'Добро пожаловать, тренер!' });
      navigate(ROUTES.TRAINER.DASHBOARD, { replace: true });
      return;
    }
    const tgUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: '',
      username: user.username,
      photoUrl: '',
      authDate: Math.floor(Date.now() / 1000),
      hash: 'miniapp',
    };
    const result = loginViaTelegram(tgUser);
    setMode('client');
    if (result.isNewUser) {
      addToast({ type: 'success', message: 'Добро пожаловать! Заполните профиль.' });
      navigate(ROUTES.CLIENT.ONBOARDING, { replace: true });
    } else {
      addToast({ type: 'success', message: 'С возвращением!' });
      navigate(ROUTES.CLIENT.HOME, { replace: true });
    }
  };

  if (!user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center py-6 px-4"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' }}
      >
        <p className="text-center mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Откройте приложение из Telegram, чтобы выбрать роль.
        </p>
        <button
          onClick={() => navigate(ROUTES.HOME, { replace: true })}
          className="px-4 py-2 rounded-xl font-medium"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'var(--color-text-primary)',
          }}
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-6 px-4 safe-area-bottom"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#fff' }}>
              Привет, {user.firstName}!
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Выберите, как вы будете пользоваться OFT
            </p>
          </div>

          <div className="grid gap-4">
            <motion.button
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : undefined}
              whileTap={!loading ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect('trainer')}
              className="w-full p-6 rounded-2xl text-left flex items-center gap-4 transition-all disabled:opacity-60"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <span className="text-4xl">👨‍🏫</span>
              <div>
                <div className="font-bold text-lg" style={{ color: '#fff' }}>
                  Я Тренер
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Управляю клиентами и планами
                </div>
              </div>
            </motion.button>

            <motion.button
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : undefined}
              whileTap={!loading ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect('client')}
              className="w-full p-6 rounded-2xl text-left flex items-center gap-4 transition-all disabled:opacity-60"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <span className="text-4xl">🏃</span>
              <div>
                <div className="font-bold text-lg" style={{ color: '#fff' }}>
                  Я Клиент
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Тренируюсь по плану тренера
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
