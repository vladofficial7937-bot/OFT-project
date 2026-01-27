/**
 * Тренировка на сегодня - выполнение плана тренировок
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useCoachingStore } from '../../store/useCoachingStore';
import Button from '../../components/ui/Button';
import type { WorkoutPlanExercise, WorkoutMood } from '../../data/models/types';
import { ROUTES } from '../../router/routes';

// Конфигурация настроений
const MOOD_OPTIONS: Array<{ value: WorkoutMood; emoji: string; label: string }> = [
  { value: 'strong', emoji: '💪', label: 'Сильный' },
  { value: 'good', emoji: '😊', label: 'Хорошо' },
  { value: 'normal', emoji: '😐', label: 'Нормально' },
  { value: 'tired', emoji: '😓', label: 'Устал' },
  { value: 'exhausted', emoji: '😵', label: 'Измотан' },
];

export default function TodayWorkout() {
  const navigate = useNavigate();
  
  const activeClient = useAppStore((state) => state.activeClient);
  const clients = useAppStore((state) => state.clients || []);
  const exercises = useAppStore((state) => state.exercises || []);
  const getTodayWorkout = useAppStore((state) => state.getTodayWorkout);
  const completeWorkoutWithHistory = useAppStore((state) => state.completeWorkoutWithHistory);
  const addToast = useAppStore((state) => state.addToast);

  const client = activeClient || clients[0];
  const getRequestForClient = useCoachingStore((s) => s.getRequestForClient);
  const request = client && client.id ? getRequestForClient(client.id) : null;
  const hasAccepted = request?.status === 'accepted';
  
  // Мемоизируем todayExercises чтобы избежать лишних перерендеров
  const todayExercises = useMemo(() => {
    if (!client || !client.id || !hasAccepted) return null;
    try {
      return getTodayWorkout(client.id);
    } catch (e) {
      console.error('Error getting today workout:', e);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id, hasAccepted]);

  // Локальное состояние для отслеживания выполненных упражнений
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [showCongratulations, setShowCongratulations] = useState(false);
  
  // Состояние для модалки выбора настроения
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<WorkoutMood | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState('');
  
  // Время начала тренировки
  const [startTime] = useState(() => Date.now());

  // Инициализация состояния completedSteps
  useEffect(() => {
    if (todayExercises) {
      const initial: Record<string, boolean> = {};
      todayExercises.forEach((ex) => {
        initial[ex.exerciseId] = false;
      });
      setCompletedSteps(initial);
    }
  }, [todayExercises]);

  // Переключение статуса выполнения упражнения
  const toggleExercise = (exerciseId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  // Подсчет выполненных упражнений
  const totalExercises = todayExercises?.length || 0;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const allCompleted = totalExercises > 0 && completedCount === totalExercises;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  // Получить название упражнения по ID
  const getExerciseName = (exerciseId: string): string => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    return exercise?.name || 'Неизвестное упражнение';
  };

  // Получить описание упражнения
  const getExerciseDescription = (exerciseId: string): string => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    return exercise?.description || '';
  };

  // Получить название дня недели
  const getDayName = (): string => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[new Date().getDay()];
  };

  // Открытие модалки выбора настроения перед завершением
  const handleOpenMoodModal = () => {
    if (!client || !todayExercises || todayExercises.length === 0) {
      alert('Ошибка: тренировка не найдена');
      return;
    }

    // Подтверждение, если не все упражнения выполнены
    if (!allCompleted) {
      const confirmed = confirm(
        `Вы выполнили только ${completedCount} из ${totalExercises} упражнений. Все равно завершить тренировку?`
      );
      if (!confirmed) {
        return;
      }
    }

    // Показываем модалку выбора настроения
    setShowMoodModal(true);
  };

  // Завершение тренировки с сохранением в историю
  const handleCompleteWorkout = () => {
    if (!client) return;

    // Рассчитываем продолжительность тренировки в минутах
    const duration = Math.round((Date.now() - startTime) / 60000);

    // Сохраняем тренировку с полной историей
    completeWorkoutWithHistory(
      client.id,
      selectedMood || undefined,
      workoutNotes.trim() || undefined,
      duration > 0 ? duration : undefined
    );

    // Закрываем модалку
    setShowMoodModal(false);

    // Показываем уведомление
    addToast({
      type: 'success',
      message: '🎉 Тренировка успешно завершена! Отличная работа!',
    });

    // Показываем поздравление
    setShowCongratulations(true);

    // Через 3 секунды перенаправляем на страницу истории
    setTimeout(() => {
      navigate(ROUTES.CLIENT.HISTORY);
    }, 3000);
  };

  if (!client) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-6 px-4 sm:px-6">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold mb-2">Клиент не выбран</h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Выберите клиента в настройках
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT.HOME)}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  if (!hasAccepted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-6 px-4 sm:px-6">
        <div
          className="card max-w-md text-center rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="text-6xl mb-4">👨‍🏫</div>
          <h2 className="text-xl font-bold mb-2 text-white">Сначала выберите тренера</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            План тренировок и выполнение доступны после принятия заявки тренером.
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT.PROFILE)}>
            Перейти в профиль
          </Button>
        </div>
      </div>
    );
  }

  if (!todayExercises || todayExercises.length === 0) {
    const restDayTips = [
      { icon: '🧘‍♀️', title: 'Растяжка', text: 'Сделай легкую растяжку на 15-20 минут для улучшения гибкости' },
      { icon: '🥗', title: 'Питание', text: 'Сосредоточься на восстановительном питании: белок и витамины' },
      { icon: '😴', title: 'Сон', text: 'Отдохни хорошо — сон критически важен для роста мышц' },
      { icon: '🚶', title: 'Прогулка', text: 'Неспешная прогулка поможет активному восстановлению' },
    ];
    const randomTip = restDayTips[Math.floor(Math.random() * restDayTips.length)];

    return (
      <div className="min-h-[60vh] flex items-center justify-center py-6 px-4 sm:px-6">
        <div className="card max-w-md text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-float">🧘‍♂️</div>
          <h2 className="text-2xl font-bold mb-2">Время восстановиться</h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Отдых — важная часть тренировочного процесса. Мышцы растут во время восстановления!
          </p>
          
          {/* Совет */}
          <div 
            className="mb-6 p-4 rounded-lg text-left"
            style={{
              background: 'rgba(255, 82, 82, 0.1)',
              border: '1px solid rgba(255, 82, 82, 0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{randomTip.icon}</span>
              <div>
                <h3 className="font-semibold mb-1">{randomTip.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {randomTip.text}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={() => navigate(ROUTES.CLIENT.HOME)}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 pb-32 safe-area-bottom min-w-0">
      {/* Заголовок */}
      <div className="card mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Тренировка на {getDayName().toLowerCase()}</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--color-text-secondary)' }}>Прогресс</span>
            <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>
              {completedCount} / {totalExercises}
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Список упражнений в стиле To-do list */}
      <div className="space-y-3 animate-fade-in">
        {todayExercises.map((plannedEx: WorkoutPlanExercise, index: number) => {
          const exerciseName = getExerciseName(plannedEx.exerciseId);
          const isCompleted = completedSteps[plannedEx.exerciseId] || false;
          
          return (
            <div
              key={plannedEx.exerciseId}
              className="card-hover p-4 animate-fade-in"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                opacity: isCompleted ? 0.7 : 1,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Чекбокс */}
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleExercise(plannedEx.exerciseId)}
                  className="mt-1 w-5 h-5 rounded cursor-pointer"
                  style={{
                    accentColor: 'var(--color-accent)',
                  }}
                />
                
                {/* Информация об упражнении */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <button
                        onClick={() => navigate(ROUTES.CLIENT.EXERCISE_DETAIL(plannedEx.exerciseId))}
                        className={`font-bold text-lg mb-1 transition-all text-left hover:opacity-80 ${
                          isCompleted ? 'line-through opacity-60' : ''
                        }`}
                        style={{
                          color: isCompleted ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                        }}
                      >
                        {exerciseName}
                      </button>
                      <p
                        className={`text-sm mb-2 transition-all ${
                          isCompleted ? 'opacity-50' : ''
                        }`}
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {plannedEx.sets} подход(а) × {plannedEx.reps} повторений
                      </p>
                    </div>
                  </div>
                  
                  {/* Описание упражнения (опционально) */}
                  {getExerciseDescription(plannedEx.exerciseId) && (
                    <p
                      className={`text-xs mt-2 transition-all ${
                        isCompleted ? 'opacity-40' : ''
                      }`}
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {getExerciseDescription(plannedEx.exerciseId)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модалка выбора настроения */}
      <AnimatePresence>
        {showMoodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              onClick={() => setShowMoodModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card relative z-10 max-w-md w-full p-6"
            >
              <h2 className="text-2xl font-bold mb-4 text-center">Как прошла тренировка?</h2>
              
              {/* Выбор настроения */}
              <div className="mb-6">
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  Как вы себя чувствуете?
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                        selectedMood === mood.value ? 'scale-110' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: selectedMood === mood.value
                          ? 'rgba(255, 82, 82, 0.2)'
                          : 'var(--color-background-secondary)',
                        border: selectedMood === mood.value
                          ? '2px solid var(--color-accent)'
                          : '2px solid transparent',
                      }}
                    >
                      <span className="text-3xl mb-1">{mood.emoji}</span>
                      <span className="text-xs">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Заметки */}
              <div className="mb-6">
                <label className="text-sm mb-2 block" style={{ color: 'var(--color-text-secondary)' }}>
                  Заметки (опционально)
                </label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="Что получилось хорошо? Над чем поработать?"
                  className="w-full px-4 py-3 rounded-lg resize-none h-24"
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>

              {/* Кнопки */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowMoodModal(false)}
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleCompleteWorkout}
                >
                  ✅ Сохранить
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка поздравления */}
      <AnimatePresence>
        {showCongratulations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card relative z-10 max-w-md text-center p-8"
            >
              <div className="text-7xl mb-4 animate-float">🎉</div>
              <h2 className="text-xl sm:text-3xl font-bold mb-4 break-words">Отлично! Тренировка завершена!</h2>
              <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                {allCompleted
                  ? 'Вы выполнили все упражнения! Продолжайте в том же духе! 💪'
                  : 'Вы завершили тренировку. Старайтесь выполнять все упражнения!'}
              </p>
              {selectedMood && (
                <p className="text-2xl mb-4">
                  {MOOD_OPTIONS.find((m) => m.value === selectedMood)?.emoji}
                </p>
              )}
              <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Перенаправление в историю тренировок...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка завершения тренировки (зафиксирована внизу) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-40 safe-area-bottom">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 min-w-0">
          <Button
            onClick={handleOpenMoodModal}
            variant="primary"
            className="w-full text-lg py-4 shadow-2xl"
            style={{
              background: allCompleted
                ? 'linear-gradient(135deg, var(--color-success) 0%, #22c55e 100%)'
                : 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
              boxShadow: '0 8px 24px -4px rgba(255, 68, 68, 0.4)',
            }}
          >
            {allCompleted ? '✅ Завершить тренировку' : '💾 Завершить тренировку'}
          </Button>
        </div>
      </div>
    </div>
  );
}
