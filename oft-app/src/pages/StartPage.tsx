/**
 * Стартовая страница - современный лендинг
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTES } from '../router/routes';

export default function StartPage() {
  const navigate = useNavigate();
  const setMode = useAppStore((s) => s.setMode);
  const selectClient = useAppStore((s) => s.selectClient);
  const clients = useAppStore((s) => s.clients || []);
  const authLogin = useAuthStore((s) => s.login);
  const [showClientSelection, setShowClientSelection] = useState(false);

  const handleSelectMode = (mode: 'trainer' | 'client') => {
    setMode(mode);
    if (mode === 'trainer') {
      authLogin({ id: 'web-trainer', firstName: 'Тренер', username: '' }, 'trainer');
      navigate(ROUTES.TRAINER.DASHBOARD);
    } else {
      navigate(ROUTES.AUTH.TELEGRAM);
    }
  };

  // Обработчик выбора клиента
  const handleSelectClient = (clientId: string) => {
    selectClient(clientId);
    navigate(ROUTES.CLIENT.HOME);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero-секция с градиентным фоном */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 25%, #0a0a1a 50%, #1a0a0a 75%, #0a0a0a 100%)',
        }}
      >
        {/* Дополнительные градиенты для глубины */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255, 68, 68, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(255, 107, 107, 0.1) 0%, transparent 50%)',
          }}
        />
        
        {/* Плавающие частицы */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              background: `radial-gradient(circle, rgba(255, 68, 68, ${0.08 - i * 0.01}) 0%, transparent 70%)`,
              left: `${10 + i * 20}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10"
        style={{ paddingBottom: 'calc(4rem + var(--safe-area-inset-bottom))' }}
      >
        {/* Hero-секция */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl mb-6 animate-logo-gradient animate-logo-glow"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(110deg, #ff4444 0%, #ff6b6b 35%, #ff8a80 50%, #ff6b6b 65%, #ff4444 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            OFT
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Твой персональный тренер в кармане
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Управляй тренировками, отслеживай прогресс и достигай целей вместе с OFT
          </motion.p>
        </motion.div>

        {/* Блок выбора роли */}
        <AnimatePresence mode="wait">
          {!showClientSelection ? (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl w-full grid md:grid-cols-2 gap-6 mb-8"
            >
              {/* Карточка "Я Тренер" */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                onClick={() => handleSelectMode('trainer')}
                className="relative p-8 rounded-2xl text-left overflow-hidden group"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Градиентный overlay при hover */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%)',
                    opacity: 0,
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="text-6xl mb-4 inline-block"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(255, 68, 68, 0.5))',
                    }}
                  >
                    📱
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Я Тренер</h3>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Создавай программы тренировок, управляй клиентами и отслеживай их прогресс
                  </p>
                </div>
              </motion.button>

              {/* Карточка "Я Клиент" */}
              <motion.button
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                onClick={() => handleSelectMode('client')}
                className="relative p-8 rounded-2xl text-left overflow-hidden group"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Градиентный overlay при hover */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%)',
                    opacity: 0,
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="text-6xl mb-4 inline-block"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(255, 68, 68, 0.5))',
                    }}
                  >
                    🏋️
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Я Клиент</h3>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Выполняй тренировки, отслеживай прогресс и достигай своих фитнес-целей
                  </p>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            /* Выбор профиля клиента */
            <motion.div
              key="client-selection"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="max-w-md w-full"
            >
              <div
                className="p-8 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              >
                <h3 className="text-2xl font-bold mb-2 text-center">Выберите профиль</h3>
                <p 
                  className="text-sm text-center mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  У вас несколько профилей клиента
                </p>
                
                <div className="space-y-3">
                  {clients.map((client, index) => (
                    <motion.button
                      key={client.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handleSelectClient(client.id)}
                      className="w-full p-4 rounded-xl text-left flex items-center gap-4 group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {/* Аватар */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
                          boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)',
                        }}
                      >
                        {client.photoUrl ? (
                          <img 
                            src={client.photoUrl} 
                            alt={client.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{client.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      
                      {/* Информация о клиенте */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{client.name}</p>
                        {client.age && (
                          <p 
                            className="text-xs truncate"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {client.age} лет
                          </p>
                        )}
                      </div>
                      
                      {/* Стрелка */}
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        className="text-xl"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        →
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
                
                {/* Кнопка "Назад" */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowClientSelection(false)}
                  className="w-full mt-6 p-3 rounded-xl text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  ← Назад
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
