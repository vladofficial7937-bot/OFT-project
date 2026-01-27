/**
 * Дашборд тренера - аналитика и управление клиентами
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import Button from '../../components/ui/Button';
import type { Client } from '../../data/models/types';
import { ClientGoal, Equipment } from '../../data/models/types';
import { ROUTES } from '../../router/routes';
import { fetchChatIdByUsername, saveClient, insertProfile, fetchClientByUsername } from '../../lib/supabaseProfiles';
import { sendTelegramMessage } from '../../config/telegram';

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const allClients = useAppStore((state) => state.clients || []);
  const addClient = useAppStore((state) => state.addClient);
  const updateClient = useAppStore((state) => state.updateClient);
  const addToast = useAppStore((state) => state.addToast);
  const currentUser = useAuthStore((state) => state.user);
  const { hapticTap, hapticNotification, webApp } = useTelegramWebApp();

  // Фильтруем клиентов по тренеру
  const clients = allClients.filter(client => client.assignedTrainerId === currentUser?.id);

  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showTelegramAdd, setShowTelegramAdd] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');

  // Статистика тренера
  const stats = useMemo(() => {
    const totalClients = clients.length;

    // Тренировки за последние 7 дней (из истории всех клиентов)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const workoutsLastWeek = clients.reduce((sum, client) => {
      const history = client.workoutHistory || client.completedWorkouts || [];
      const recentWorkouts = history.filter((w) => {
        const workoutDate = new Date(w.date);
        return workoutDate >= weekAgo;
      });
      return sum + recentWorkouts.length;
    }, 0);

    // Процент успеваемости (выполненные / назначенные)
    // Считаем назначенные тренировки на неделю
    const totalAssignedWorkouts = clients.reduce((sum, client) => {
      const weeklyPlan = client.weeklyPlan || {};
      const daysWithPlan = Object.values(weeklyPlan).filter(day => day && day.length > 0).length;
      return sum + daysWithPlan;
    }, 0);

    const completionRate = totalAssignedWorkouts > 0
      ? Math.round((workoutsLastWeek / totalAssignedWorkouts) * 100)
      : 0;

    return {
      totalClients,
      workoutsLastWeek,
      completionRate,
    };
  }, [clients]);

  // Функция для определения статуса клиента
  const getClientStatus = (client: Client): { label: string; color: string; bg: string } => {
    const completedWorkouts = client.completedWorkouts || [];
    const weeklyPlan = client.weeklyPlan || {};

    // Проверяем, есть ли план на текущую неделю
    const hasCurrentWeekPlan = Object.values(weeklyPlan).some(day => day && day.length > 0);

    if (!hasCurrentWeekPlan) {
      return {
        label: 'Нужно внимание',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.2)',
      };
    }

    if (completedWorkouts.length === 0) {
      return {
        label: 'Нужно внимание',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.2)',
      };
    }

    // Находим последнюю тренировку
    const lastWorkout = completedWorkouts
      .map(w => ({ date: new Date(w.date), workout: w }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    if (!lastWorkout) {
      return {
        label: 'Нужно внимание',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.2)',
      };
    }

    const daysSinceLastWorkout = Math.floor(
      (new Date().getTime() - lastWorkout.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastWorkout <= 3) {
      return {
        label: 'Активен',
        color: '#4ade80',
        bg: 'rgba(74, 222, 128, 0.2)',
      };
    } else if (daysSinceLastWorkout <= 5) {
      return {
        label: 'Засыпает',
        color: '#eab308',
        bg: 'rgba(234, 179, 8, 0.2)',
      };
    } else {
      return {
        label: 'Нужно внимание',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.2)',
      };
    }
  };

  const handleAddClient = () => {
    navigate(ROUTES.TRAINER.ADD_CLIENT);
  };

  const handleTelegramAdd = async (username?: string) => {
    hapticTap(); // Тактильная отдача при клике

    if (!username) {
      // Проверка на Telegram
      if (window.location.hostname !== 'localhost' && !window.Telegram?.WebApp?.initData) {
        alert("Запустите приложение внутри Telegram");
        hapticNotification('error');
        return;
      }
      // Показать модальное окно
      setShowTelegramAdd(true);
      webApp?.expand(); // Развернуть Mini App для лучшего UX
      return;
    }

    const processedUsername = username.trim().replace('@', '');

    try {
      const existingClient = await fetchClientByUsername(processedUsername);

      if (existingClient) {
        // Обновить существующего клиента
        updateClient(existingClient.id, { assignedTrainerId: currentUser?.id });
        existingClient.assignedTrainerId = currentUser?.id;
        await saveClient(existingClient);
        addToast({ type: 'success', message: 'Клиент назначен!' });
        hapticNotification('success');
      } else {
        // Создать нового клиента
        const tempClientId = `temp-${Date.now()}`;
        const tempClient: Client = {
          id: tempClientId,
          name: `Пользователь ${processedUsername}`,
          age: 25,
          goal: ClientGoal.MuscleGain,
          equipment: Equipment.Gym,
          telegramUsername: processedUsername,
          assignedTrainerId: currentUser?.id,
          isFirstLogin: true,
          createdAt: new Date().toISOString(),
        };
        addClient(tempClient);
        await saveClient(tempClient);
        addToast({ type: 'success', message: 'Клиент добавлен!' });
        hapticNotification('success');
      }

      // Отправить сообщение, если найден chatId
      const chatId = await fetchChatIdByUsername(processedUsername);
      if (chatId) {
        const message = `Привет! Тренер ${currentUser?.firstName || 'Ваш тренер'} назначил вас своим клиентом в фитнес-сервисе OFT.`;
        await sendTelegramMessage(chatId, message);

        // Сохранить в profiles
        await insertProfile({
          id: chatId,
          role: 'client',
          username: processedUsername,
          first_name: existingClient?.name || `Пользователь ${processedUsername}`,
        });
      }

      // Закрыть модальное окно
      setShowTelegramAdd(false);
      setTelegramUsername('');
    } catch (err: any) {
      console.error("Ошибка Supabase:", err.message);
      alert("Ошибка: " + err.message);
      hapticNotification('error');
    }
  };
  const getGoalLabel = (goal: ClientGoal): string => {
    const labels: Record<ClientGoal, string> = {
      [ClientGoal.WeightLoss]: 'Похудение',
      [ClientGoal.MuscleGain]: 'Набор массы',
      [ClientGoal.Endurance]: 'Выносливость',
      [ClientGoal.Strength]: 'Сила',
    };
    return labels[goal] ?? goal;
  };

  // Если нет клиентов
  if (clients.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-3xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">У вас пока нет клиентов</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Добавьте первого клиента, чтобы начать работу
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => handleTelegramAdd()} className="w-full">
            📱 Добавить из Telegram
          </Button>
          <Button onClick={handleAddClient} className="w-full">
            ➕ Создать первого клиента
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0"
      >
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Дашборд тренера
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Аналитика и управление клиентами
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowAIAnalysis(!showAIAnalysis)}
              className="w-full sm:w-auto"
              style={{
                background: showAIAnalysis
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : undefined,
                border: showAIAnalysis ? '1px solid rgba(99, 102, 241, 0.5)' : undefined,
              }}
            >
              ✨ Анализ клиентов ИИ
            </Button>
            <Button onClick={() => handleTelegramAdd()} className="w-full sm:w-auto">
              📱 Добавить из Telegram
            </Button>
            <Button onClick={handleAddClient} className="w-full sm:w-auto">
              ➕ Добавить клиента
            </Button>
          </div>
        </div>

        {/* ИИ-анализ клиентов */}
        {showAIAnalysis && (
          <div
            className="mb-8 p-6 rounded-2xl animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2" style={{ color: '#a78bfa' }}>
                  Анализ клиентов от ИИ
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Всего подопечных: {clients.length}. ИИ-анализ в разработке.
                </p>
              </div>
              <button
                onClick={() => setShowAIAnalysis(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Всего клиентов
                </p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-xl">💪</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Тренировок за неделю
                </p>
                <p className="text-2xl font-bold">{stats.workoutsLastWeek}</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Успеваемость
                </p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Список клиентов */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Клиенты</h2>

          {clients.map((client) => {
            const status = getClientStatus(client);

            // Количество тренировок в истории
            const historyCount = client.workoutHistory?.length || client.completedWorkouts?.length || 0;

            return (
              <motion.div
                key={client.id}
                className="card-hover relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{client.name}</h3>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        <span>🎯 {getGoalLabel(client.goal)}</span>
                        <span>🏋️ {client.equipment === Equipment.Gym ? 'Зал' : 'Дом'}</span>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Кнопка Назначить тренировку */}
                    <Button
                      onClick={() => navigate(ROUTES.TRAINER.ASSIGN_WORKOUT(client.id))}
                      variant="secondary"
                    >
                      📝 План
                    </Button>

                    {/* Кнопка Подробнее */}
                    <Button
                      onClick={() => navigate(ROUTES.TRAINER.CLIENT_PROFILE(client.id))}
                      variant="secondary"
                      className="flex-1"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <span>📋</span>
                        <span>Подробнее</span>
                        {historyCount > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded-full text-xs font-bold ml-1"
                            style={{
                              backgroundColor: 'rgba(255, 82, 82, 0.2)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            {historyCount}
                          </span>
                        )}
                      </span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Модальное окно для добавления из Telegram */}
      {showTelegramAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md w-full"
          >
            <div
              className="p-6 rounded-2xl"
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📱</span>
                Добавить из Telegram
              </h3>

              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Введите username клиента в Telegram (без @). Клиент будет назначен вам.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value.replace('@', ''))}
                    placeholder="username"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background-secondary)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      hapticTap();
                      setShowTelegramAdd(false);
                      setTelegramUsername('');
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={() => {
                      hapticTap();
                      handleTelegramAdd(telegramUsername);
                    }}
                    className="flex-1"
                    disabled={!telegramUsername.trim()}
                  >
                    Назначить клиента
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
