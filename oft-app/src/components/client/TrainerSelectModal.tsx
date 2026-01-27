/**
 * Модальное окно выбора персонального тренера
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrainerProfile } from '../../data/models/types';

const glass = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
};

interface TrainerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainers: TrainerProfile[];
  onSelect: (t: TrainerProfile) => void;
}

function TrainerSelectModal({ isOpen, onClose, trainers, onSelect }: TrainerSelectModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
          style={glass}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Выбрать тренера</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              @username и короткое био
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {trainers.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelect(t);
                  onClose();
                }}
                className="w-full p-4 rounded-2xl text-left transition-all"
                style={{
                  ...glass,
                  background: 'rgba(255, 255, 255, 0.06)',
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Фото */}
                  <div className="flex-shrink-0">
                    {t.photoUrl ? (
                      <img
                        src={t.photoUrl}
                        alt={t.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                        style={{
                          background: 'linear-gradient(135deg, #ff5252 0%, #ff6b6b 100%)',
                        }}
                      >
                        {t.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">@{t.username}</h3>
                      {t.age && (
                        <span className="text-sm px-2 py-0.5 rounded-full bg-white/10 text-white">
                          {t.age} лет
                        </span>
                      )}
                    </div>

                    {/* Специализации */}
                    {t.specializations && t.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {t.specializations.map((spec, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Био */}
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {t.bio}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(TrainerSelectModal);
