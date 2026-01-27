/**
 * Компонент привязки/отвязки Telegram аккаунта
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import Spinner from '../ui/Spinner';
import TelegramIcon from '../ui/TelegramIcon';

interface TelegramConnectProps {
  clientId: string;
  onSuccess?: () => void;
}

export default function TelegramConnect({ clientId, onSuccess }: TelegramConnectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const linkTelegram = useAppStore((state) => state.linkTelegram);
  const unlinkTelegram = useAppStore((state) => state.unlinkTelegram);
  const addToast = useAppStore((state) => state.addToast);
  const client = useAppStore((state) => 
    state.clients.find((c) => c.id === clientId) || state.activeClient
  );

  const isLinked = client?.isTelegramLinked || !!client?.telegramId;

  const handleLink = async () => {
    if (isLinked) return;

    setIsLoading(true);

    // Имитация загрузки (2 секунды)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Генерируем username на основе имени клиента
    const username = client?.name.toLowerCase().replace(/\s+/g, '_') || `user_${Math.random().toString(36).substring(7)}`;

    // Привязываем Telegram
    linkTelegram(clientId, username);

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

  const handleUnlink = () => {
    if (!isLinked) return;

    if (window.confirm('Вы уверены, что хотите отвязать Telegram? Вы больше не будете получать уведомления.')) {
      unlinkTelegram(clientId);
      addToast({
        type: 'info',
        message: 'Telegram отвязан. Уведомления отключены.',
      });
    }
  };

  if (isLinked) {
    return (
      <div className="space-y-3">
        <div 
          className="p-4 rounded-lg flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(37, 164, 218, 0.2) 0%, rgba(37, 164, 218, 0.1) 100%)',
            border: '1px solid rgba(37, 164, 218, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Telegram подключен
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                @{client?.telegramUsername || 'user'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleUnlink}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Отключить
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <motion.button
        onClick={handleLink}
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
            <span>Привязать Telegram</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
