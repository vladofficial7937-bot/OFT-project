/**
 * Страница авторизации через Telegram
 * - Mini App: авто-вход по initDataUnsafe.user (при запуске из бота)
 * - Web (продакшен): Login Widget с вашим ботом (см. TELEGRAM_AUTH_SETUP.md)
 * - Dev: мок-кнопка или «Продолжить без авторизации»
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ROUTES } from '../../router/routes';
import Button from '../../components/ui/Button';
import TelegramIcon from '../../components/ui/TelegramIcon';
import { TELEGRAM_BOT_USERNAME, hasCustomBot } from '../../config/telegram';
import { isMiniApp } from '../../lib/telegramWebApp';

// Данные пользователя от Telegram Login Widget
interface TelegramWidgetUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function toStoreUser(
  id: string,
  firstName: string,
  lastName: string,
  username: string,
  photoUrl: string,
  authDate: number,
  hash: string
) {
  return { id, firstName, lastName, username, photoUrl, authDate, hash };
}

export default function TelegramAuth() {
  const navigate = useNavigate();
  const loginViaTelegram = useAppStore((s) => s.loginViaTelegram);
  const addToast = useAppStore((s) => s.addToast);
  const authLogin = useAuthStore((s) => s.login);

  const handleTelegramLogin = (
    tgUser: ReturnType<typeof toStoreUser>,
    opts?: { isNewUser: boolean; client: { id: string } }
  ) => {
    authLogin(
      { id: tgUser.id, firstName: tgUser.firstName, username: tgUser.username },
      'client'
    );
    const result = opts ?? loginViaTelegram(tgUser);
    if (result.isNewUser) {
      addToast({ type: 'success', message: 'Добро пожаловать в OFT! Заполните профиль.' });
      navigate(ROUTES.CLIENT.ONBOARDING);
    } else {
      addToast({ type: 'success', message: 'Успешный вход через Telegram!' });
      navigate(ROUTES.CLIENT.HOME);
    }
  };

  const handleTelegramLoginRef = useRef(handleTelegramLogin);
  handleTelegramLoginRef.current = handleTelegramLogin;

  // Dev Mode: имитация входа через Telegram
  const handleDevLogin = () => {
    const mockUser = toStoreUser(
      '7937',
      'Владислав',
      '',
      'vlad_oft',
      '',
      Math.floor(Date.now() / 1000),
      'dev_hash_' + Date.now()
    );
    try {
      handleTelegramLogin(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      addToast({ type: 'error', message: 'Ошибка при авторизации. Попробуйте еще раз.' });
    }
  };

  // Telegram Login Widget (продакшен, не Mini App): домен должен быть в /setdomain у @BotFather
  useEffect(() => {
    if (import.meta.env.DEV || isMiniApp()) return;

    const container = document.getElementById('telegram-widget');
    if (!container) return;

    (window as any).onTelegramAuth = (user: TelegramWidgetUser) => {
      const tgUser = toStoreUser(
        String(user.id),
        user.first_name,
        user.last_name ?? '',
        user.username ?? '',
        user.photo_url ?? '',
        user.auth_date,
        user.hash
      );
      try {
        handleTelegramLoginRef.current(tgUser);
      } catch (e) {
        console.error('Telegram Widget login error:', e);
        addToast({ type: 'error', message: 'Ошибка входа через Telegram.' });
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    container.innerHTML = '';
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
      delete (window as any).onTelegramAuth;
    };
  }, [addToast]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
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
          {/* Заголовок */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #26A5E4 0%, #0088cc 100%)',
                boxShadow: '0 8px 40px rgba(38, 165, 228, 0.5), 0 0 30px rgba(38, 165, 228, 0.3)',
              }}
            >
              <TelegramIcon size={48} color="white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">OFT</h1>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Вход в систему OFT через мессенджер
            </p>
          </div>

          {/* Dev Mode: Кнопка входа + подсказка по настройке */}
          {import.meta.env.DEV && (
            <div className="mb-6">
              <Button
                onClick={handleDevLogin}
                className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #26A5E4 0%, #0088cc 100%)',
                  boxShadow: '0 8px 24px -4px rgba(38, 165, 228, 0.5), 0 0 20px rgba(38, 165, 228, 0.2)',
                }}
              >
                <TelegramIcon size={20} color="white" />
                <span>Войти через Telegram (Dev Mode)</span>
              </Button>
              <p className="text-xs text-center mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                ⚠️ Режим разработки: используется мок-авторизация
              </p>
              <div
                className="p-4 rounded-xl text-left text-sm mb-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <p className="font-medium text-white mb-1">Настройка Telegram</p>
                <p className="mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Бот: <code className="px-1.5 py-0.5 rounded bg-white/10">{TELEGRAM_BOT_USERNAME}</code>
                  {!hasCustomBot && (
                    <span className="block mt-1" style={{ color: 'rgba(255, 107, 107, 0.9)' }}>
                      Задай <code className="px-1 rounded bg-white/10">VITE_TELEGRAM_BOT_USERNAME</code> в <code className="px-1 rounded bg-white/10">.env</code>
                    </span>
                  )}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Инструкция: <code className="px-1 rounded bg-white/10">oft-app/TELEGRAM_AUTH_SETUP.md</code>
                </p>
              </div>
            </div>
          )}

          {/* Telegram Login Widget: только веб (не dev, не Mini App) */}
          {!import.meta.env.DEV && !isMiniApp() && (
            <div className="mb-6">
              <div
                id="telegram-widget"
                className="flex justify-center"
                style={{ minHeight: '60px' }}
              />
              <p className="text-xs text-center mt-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Кнопка не отображается? Задай домен этого сайта через <strong>/setdomain</strong> у @BotFather для бота <code className="px-1 rounded bg-white/10">{TELEGRAM_BOT_USERNAME}</code>.
              </p>
            </div>
          )}

          {/* Информация о безопасности */}
          <div 
            className="mb-6 p-4 rounded-lg text-sm"
            style={{
              background: 'rgba(38, 165, 228, 0.1)',
              border: '1px solid rgba(38, 165, 228, 0.2)',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">🔒</span>
              <div>
                <p className="font-semibold mb-1">Безопасный вход</p>
                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Авторизация происходит через официальный виджет Telegram. 
                  Мы не получаем доступ к вашим личным сообщениям.
                </p>
              </div>
            </div>
          </div>

          {/* Кнопка вернуться */}
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            variant="secondary"
            className="w-full"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            ← Вернуться к выбору роли
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
