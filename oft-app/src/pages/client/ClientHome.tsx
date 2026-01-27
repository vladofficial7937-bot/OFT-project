/**
 * Главная страница клиента
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useCoachingStore } from '../../store/useCoachingStore';
import { ROUTES } from '../../router/routes';
import { supabase } from '../../lib/supabaseClient';
import Button from '../../components/ui/Button';
import AIChatModal from '../../components/ai/AIChatModal';
import ActivityCalendar from '../../components/calendar/ActivityCalendar';
import TrainerSelectModal from '../../components/client/TrainerSelectModal';

export default function ClientHome() {
  const navigate = useNavigate();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainers, setTrainers] = useState<{ id: string; first_name?: string; username: string; bio?: string }[]>([]);
  
  // Живое время
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Загрузка тренеров из Supabase
  useEffect(() => {
    const loadTrainers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, username, bio')
          .eq('role', 'trainer');
        
        if (error) throw error;
        setTrainers(data || []);
      } catch (error) {
        console.error('Error loading trainers:', error);
      }
    };
    
    loadTrainers();
  }, []);
  
  const activeClient = useAppStore((state) => state.activeClient);
  const clients = useAppStore((state) => state.clients || []);
  const exercises = useAppStore((state) => state.exercises || []);
  const getTodayWorkout = useAppStore((state) => state.getTodayWorkout);
  const getClientWorkoutHistory = useAppStore((state) => state.getClientWorkoutHistory);
  const addToast = useAppStore((state) => state.addToast);
  const createRequest = useCoachingStore((state) => state.createRequest);
  const completedWorkouts = activeClient?.completedWorkouts || [];

  // Получаем клиента
  const client = activeClient || clients[0];
  const clientId = client?.id;

  // Мемоизируем историю тренировок чтобы избежать лишних перерендеров
  // Используем только clientId как зависимость, функции из store стабильны
  const workoutHistory = useMemo(() => {
    if (!clientId) return [];
    try {
      const history = getClientWorkoutHistory(clientId);
      return Array.isArray(history) ? history : [];
    } catch (e) {
      console.error('Error getting workout history:', e);
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Получаем тренировку на сегодня
  const todayExercises = useMemo(() => {
    if (!clientId) return null;
    try {
      return getTodayWorkout(clientId);
    } catch (e) {
      console.error('Error getting today workout:', e);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);
  
  const totalExercises = todayExercises?.length || 0;

  // Подсчитываем статистику
  const completedSessions = completedWorkouts.filter((w) => w.completed).length;

  // Получить название дня недели на русском
  const getDayName = (): string => {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[new Date().getDay()];
  };

  // Приветствие по времени суток
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return { text: 'Доброе утро', icon: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Добрый день', icon: '👋' };
    if (hour >= 18 && hour < 24) return { text: 'Добрый вечер', icon: '🌙' };
    return { text: 'Доброй ночи', icon: '🌃' };
  };

  // Форматирование даты
  const getCurrentDate = () => {
    return currentTime.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Форматирование времени (часы и минуты)
  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const greeting = getGreeting();

  // Цитаты для дня отдыха — меняются при загрузке и раз в 2–3 минуты
  const REST_DAY_QUOTES = [
    'Отдых — это не отсутствие работы, это часть тренировочного процесса.',
    'Мышцы растут не во время тренировки, а во время восстановления.',
    'Сегодня восстановление, завтра — новый рекорд!',
    'Хороший отдых — половина успеха.',
  ];
  const pickRandomQuote = () =>
    REST_DAY_QUOTES[Math.floor(Math.random() * REST_DAY_QUOTES.length)];
  const [restDayQuote, setRestDayQuote] = useState(pickRandomQuote);

  useEffect(() => {
    const interval = setInterval(() => setRestDayQuote(pickRandomQuote), 2.5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Если клиента нет, показываем сообщение
  if (!client) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
        <div className="card text-center animate-fade-in">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold mb-2">Клиент не найден</h2>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Пожалуйста, войдите в систему или создайте профиль
          </p>
          <Button onClick={() => navigate(ROUTES.HOME)}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6 safe-area-bottom min-w-0">
      {/* Приветствие с живым временем — flex align center для TMA */}
      <div className="card animate-fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words" style={{ color: '#ffffff' }}>
              {greeting.text}! {greeting.icon}
            </h1>
            <p style={{ color: '#e5e5e5' }}>
              {getCurrentDate()}
            </p>
            {client && (
              <p className="mt-2 text-lg font-medium" style={{ color: '#FF0000' }}>
                {client.name}
              </p>
            )}
          </div>
          
          {/* Виджет живого времени + кнопка AI на одном уровне */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div
                className="px-4 py-2 rounded-xl text-center"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <div
                  className="text-2xl font-mono font-bold tracking-wider"
                  style={{ color: '#ffffff' }}
                >
                  {getFormattedTime()}
                </div>
              </div>
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="px-4 py-2 rounded-xl font-semibold text-xs transition-all hover:scale-105 shadow-lg flex items-center gap-2 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ff5252 100%)',
                  color: 'white',
                  boxShadow: '0 8px 24px -4px rgba(139, 92, 246, 0.4)',
                }}
              >
                <span className="text-base">⚡</span>
                <span>Спросить AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Карточка выбора тренера, если не назначен */}
      {client && !client.assignedTrainerId && (
        <div className="card animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
              Выберите персонального тренера
            </h2>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Получите индивидуальный план тренировок и отслеживание прогресса
            </p>
            <Button
              onClick={() => setShowTrainerModal(true)}
              variant="primary"
              className="w-full"
            >
              Выбрать тренера
            </Button>
          </div>
        </div>
      )}

      {/* Умный Календарь Активности */}
      {client && client.id && (
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <ActivityCalendar
            weeklyPlan={client.weeklyPlan || {}}
            selfOrganizedDays={client.selfOrganizedDays || []}
            workoutHistory={workoutHistory}
            exercises={exercises}
            contraindications={client.contraindications || []}
          />
        </div>
      )}

      {/* План на день — белый текст, красные акценты */}
      {totalExercises > 0 ? (
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
                Тренировка на сегодня
              </h2>
              <p className="text-lg mb-3" style={{ color: '#e5e5e5' }}>
                {getDayName()} • {totalExercises} упражнений
              </p>
              <div className="flex flex-wrap gap-2">
                {todayExercises?.slice(0, 3).map((ex, index) => {
                  const exercise = exercises.find((e) => e.id === ex.exerciseId);
                  return (
                    <span
                      key={ex.exerciseId}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(255, 0, 0, 0.2)',
                        color: '#FF0000',
                      }}
                    >
                      {exercise?.name || `Упражнение ${index + 1}`}
                    </span>
                  );
                })}
                {totalExercises > 3 && (
                  <span
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'rgba(255, 0, 0, 0.2)',
                      color: '#FF0000',
                    }}
                  >
                    +{totalExercises - 3} ещё
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate(ROUTES.CLIENT.TODAY)}
            variant="primary"
            className="w-full"
          >
            ▶️ Начать тренировку
          </Button>
        </div>
      ) : (
        <div className="card text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-6xl mb-4 animate-float">🧘‍♂️</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>
            Сегодня день отдыха
          </h3>
          <p className="mb-4 text-sm" style={{ color: '#e5e5e5' }}>
            {restDayQuote}
          </p>
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#ffffff' }}>💡 Рекомендация</p>
            <p className="text-xs" style={{ color: '#e5e5e5' }}>
              Выполните легкую растяжку, прогуляйтесь на свежем воздухе или сделайте расслабляющие упражнения для восстановления.
            </p>
          </div>
        </div>
      )}

      {/* Быстрые действия */}
      <>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
        <button
          className="card-hover p-4 sm:p-6 text-left animate-fade-in min-w-0"
          onClick={() => navigate(ROUTES.CLIENT.CATALOG + '?tab=map')}
          aria-label="Открыть карту мышц"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden="true">🗺️</span>
            <div>
              <h3 className="text-xl font-bold">Карта мышц</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Выбери группу мышц
              </p>
            </div>
          </div>
        </button>

        <button
          className="card-hover p-4 sm:p-6 text-left animate-fade-in min-w-0"
          onClick={() => navigate(ROUTES.CLIENT.CATALOG + '?tab=list')}
          aria-label="Открыть каталог упражнений"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden="true">💪</span>
            <div>
              <h3 className="text-xl font-bold">Все упражнения</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Полный каталог
              </p>
            </div>
          </div>
        </button>

        <button
          className="card-hover p-4 sm:p-6 text-left animate-fade-in min-w-0"
          onClick={() => navigate(ROUTES.CLIENT.MY_PLAN)}
          aria-label="Открыть мой план"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden="true">📋</span>
            <div>
              <h3 className="text-xl font-bold">Мой план</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Составить недельный план
              </p>
            </div>
          </div>
        </button>

        <button
          className="card-hover p-4 sm:p-6 text-left animate-fade-in min-w-0"
          onClick={() => navigate(ROUTES.CLIENT.GENERATOR)}
          aria-label="Умный генератор тренировок"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden="true">✨</span>
            <div>
              <h3 className="text-xl font-bold">Умный генератор</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Подбор по анкете и целям
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Прогресс — белый текст, красные акценты */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>
            Мой прогресс
          </h3>
          <button
            className="text-sm font-medium"
            style={{ color: '#FF0000' }}
            onClick={() => navigate(ROUTES.CLIENT.PROGRESS)}
          >
            Подробнее →
          </button>
        </div>

        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
            <div className="text-3xl font-bold" style={{ color: '#FF0000' }}>
              {completedSessions}
            </div>
            <div className="text-sm mt-1" style={{ color: '#e5e5e5' }}>
              Тренировок завершено
            </div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
            <div className="text-3xl font-bold" style={{ color: '#FF0000' }}>
              {completedWorkouts.length}
            </div>
            <div className="text-sm mt-1" style={{ color: '#e5e5e5' }}>
              Всего тренировок
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(ROUTES.CLIENT.HISTORY)}
          className="w-full p-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <span className="text-lg">🕐</span>
          <span className="font-medium" style={{ color: '#FF0000' }}>
            Посмотреть всю историю тренировок
          </span>
        </button>
      </div>
      </>

      {/* Модальное окно выбора тренера */}
      <TrainerSelectModal
        isOpen={showTrainerModal}
        onClose={() => setShowTrainerModal(false)}
        trainers={trainers}
        onSelect={(t) => {
          if (!client) return;
          createRequest(client.id, t.id);
          addToast({ type: 'success', message: `Заявка отправлена @${t.username}` });
          setShowTrainerModal(false);
        }}
      />

      {/* ИИ-чат модальное окно */}
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}
