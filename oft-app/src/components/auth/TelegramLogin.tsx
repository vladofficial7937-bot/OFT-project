/**
 * Компонент привязки Telegram аккаунта
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import Spinner from '../ui/Spinner';
import TelegramIcon from '../ui/TelegramIcon';

interface TelegramLoginProps {
  clientId: string;
  onSuccess?: () => void;
}

export default function TelegramLogin({ clientId, onSuccess }: TelegramLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const bindTelegram = useAppStore((state) => state.bindTelegram);
  const addToast = useAppStore((state) => state.addToast);
  const client = useAppStore((state) => 
    state.clients.find((c) => c.id === clientId) || state.activeClient
  );

  const hasTelegram = !!client?.telegramId;

  const handleBindTelegram = async () => {
    if (hasTelegram) return;

    setIsLoading(true);

    // Имитация загрузки (2 секунды)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Генерируем случайные данные для демо
    const mockTelegramId = `${Math.floor(Math.random() * 1000000000)}`;
    const mockUsername = client?.name.toLowerCase().replace(/\s+/g, '_') || `user_${mockTelegramId.slice(0, 6)}`;

    // Привязываем Telegram
    bindTelegram(clientId, mockTelegramId, mockUsername);

    // Показываем уведомление
    addToast({
      type: 'success',
      message: 'Telegram успешно привязан! Теперь вы будете получать уведомления.',
    });

    setIsLoading(false);

    if (onSuccess) {
      onSuccess();
    }
  };

  if (hasTelegram) {
    return (
      <div 
        className="p-4 rounded-lg flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 164, 218, 0.2) 0%, rgba(37, 164, 218, 0.1) 100%)',
          border: '1px solid rgba(37, 164, 218, 0.3)',
        }}
      >
        <div className="text-2xl">✅</div>
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Аккаунт привязан
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Telegram: @{client?.telegramUsername || 'unknown'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Привяжите Telegram, чтобы получать напоминания о тренировках и отчеты от вашего тренера.
      </p>
      
      <motion.button
        onClick={handleBindTelegram}
        disabled={isLoading}
        className="w-full px-6 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #26A5E4 0%, #0088cc 100%)',
          boxShadow: '0 8px 24px -4px rgba(38, 165, 228, 0.5), 0 0 20px rgba(38, 165, 228, 0.2)',
        }}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        animate={!isLoading ? {
          boxShadow: [
            '0 8px 24px -4px rgba(38, 165, 228, 0.5), 0 0 20px rgba(38, 165, 228, 0.2)',
            '0 8px 32px -4px rgba(38, 165, 228, 0.7), 0 0 30px rgba(38, 165, 228, 0.3)',
            '0 8px 24px -4px rgba(38, 165, 228, 0.5), 0 0 20px rgba(38, 165, 228, 0.2)',
          ],
        } : {}}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" />
            <span>Подключение...</span>
          </>
        ) : (
          <>
            <TelegramIcon size={20} color="white" />
            <span>Привязать Telegram для уведомлений</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
