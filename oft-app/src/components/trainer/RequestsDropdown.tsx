/**
 * Выпадающий список заявок на тренировки (панель тренера)
 */

import { motion } from 'framer-motion';
import type { Client } from '../../data/models/types';
import type { CoachingRequest } from '../../data/models/types';

const glass = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
};

interface RequestsDropdownProps {
  pendingRequests: CoachingRequest[];
  clients: Client[];
  onAccept: (req: CoachingRequest) => void;
  onReject: (req: CoachingRequest) => void;
}

export default function RequestsDropdown({
  pendingRequests,
  clients,
  onAccept,
  onReject,
}: RequestsDropdownProps) {
  const getClientDisplay = (clientId: string) => {
    const c = clients.find((x) => x.id === clientId);
    if (c?.telegramUsername) return `@${c.telegramUsername}`;
    return c?.name ?? `Клиент`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="absolute right-0 top-full mt-2 w-[min(320px,90vw)] rounded-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
      style={glass}
    >
      <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <p className="text-sm font-semibold text-white">Заявки на тренировки</p>
      </div>
      <div className="p-2 divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {pendingRequests.length === 0 ? (
          <p className="p-4 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Нет новых заявок
          </p>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-3 space-y-2"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <p className="text-sm text-white">
                Пользователь <strong>{getClientDisplay(req.clientId)}</strong> хочет тренироваться у
                вас.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(req)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
                    color: 'white',
                    boxShadow: '0 0 16px rgba(255, 68, 68, 0.5)',
                  }}
                >
                  Принять
                </button>
                <button
                  type="button"
                  onClick={() => onReject(req)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
