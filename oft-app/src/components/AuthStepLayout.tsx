/**
 * Экран выбора роли для регистрации
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { insertProfile } from '../lib/supabaseProfiles';
import { getTelegramWebApp } from '../lib/telegramWebApp';
import { useAppStore } from '../store/useAppStore';

type AuthRole = 'client' | 'trainer';

export default function AuthStepLayout() {
  const [isConfirming, setIsConfirming] = useState(false);
  const login = useAuthStore((s) => s.login);
  const setMode = useAppStore((s) => s.setMode);
  const addToast = useAppStore((s) => s.addToast);

  const handleRoleSelect = async (role: AuthRole) => {
    setIsConfirming(true);

    // Получаем данные пользователя
    const wa = getTelegramWebApp();
    let userData;

    if (wa?.initDataUnsafe?.user) {
      const tgUser = wa.initDataUnsafe.user;
      userData = {
        id: String(tgUser.id),
        firstName: tgUser.first_name || 'User',
        username: tgUser.username || '',
      };
    } else {
      // Тестовые данные для ПК
      userData = {
        id: '99999',
        firstName: 'Admin_Test',
        username: 'admin_test',
      };
    }

    // Показываем подтверждение Telegram
    if (wa) {
      wa.showConfirm(`Вы подтверждаете регистрацию как ${role === 'trainer' ? 'Тренер' : 'Клиент'}?`, async (confirmed) => {
        if (confirmed) {
          await performRegistration(role, userData);
        } else {
          setIsConfirming(false);
        }
      });
    } else {
      // Fallback для ПК - сразу регистрируем
      await performRegistration(role, userData);
    }
  };

  const performRegistration = async (role: AuthRole, userData: any) => {
    try {
      // Upsert в profiles
      const result = await insertProfile({
        id: userData.id,
        role,
        first_name: userData.firstName,
        username: userData.username,
      });

      if (!result.success) {
        throw new Error(result.error || 'Ошибка сохранения профиля');
      }

      // Только после успешного upsert обновляем состояние
      login(userData, role);
      setMode(role);

      addToast({
        type: 'success',
        message: `Добро пожаловать, ${userData.firstName}!`,
      });

    } catch (error) {
      console.error('Registration error:', error);
      addToast({
        type: 'error',
        message: 'Ошибка при регистрации. Попробуйте еще раз.',
      });
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Логотип и заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 20px 40px rgba(220, 38, 38, 0.4)',
            }}
          >
            <span className="text-4xl font-black text-white tracking-wider">OFT</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Твой персональный тренер в кармане
          </h1>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Выберите вашу роль для начала работы
          </p>
        </motion.div>

        {/* Карточки выбора роли */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Карточка Тренера */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleRoleSelect('trainer')}
            className="relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300 group"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #26A5E4 0%, #0088cc 100%)',
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Я Тренер
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Создавайте персональные программы тренировок, управляйте клиентами и отслеживайте их прогресс
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Карточка Клиента */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleRoleSelect('client')}
            className="relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300 group"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Я Клиент
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Получайте персональные тренировки, отслеживайте прогресс и достигайте своих целей
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </div>

        {/* Индикатор подтверждения */}
        {isConfirming && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 text-center"
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mb-4"></div>
            <p className="text-lg text-gray-300 font-medium">
              Регистрируем вас в системе...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}