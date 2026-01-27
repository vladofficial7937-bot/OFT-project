/**
 * Страница прогресса клиента - мотивирующая и информативная
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useCoachingStore } from '../../store/useCoachingStore';
import { ROUTES } from '../../router/routes';
import Button from '../../components/ui/Button';
import type { WorkoutSession } from '../../data/models/types';

export default function Progress() {
  const navigate = useNavigate();
  const activeClient = useAppStore((s) => s.activeClient);
  const clients = useAppStore((s) => s.clients || []);
  const client = activeClient || clients[0];
  const getRequestForClient = useCoachingStore((s) => s.getRequestForClient);
  const request = client && client.id ? getRequestForClient(client.id) : null;
  const hasAccepted = request?.status === 'accepted';

  const completedWorkouts: WorkoutSession[] = client?.completedWorkouts || [];

  // Анимация счетчика
  const [animatedTotalWorkouts, setAnimatedTotalWorkouts] = useState(0);
  const [animatedActiveDays, setAnimatedActiveDays] = useState(0);
  const [animatedTotalMinutes, setAnimatedTotalMinutes] = useState(0);

  useEffect(() => {
    const totalWorkouts = completedWorkouts.length;
    const activeDays = new Set(completedWorkouts.map(w => new Date(w.date).toDateString())).size;
    const totalMinutes = completedWorkouts.reduce((sum, w) => sum + (w.exercisesCount * 10), 0);

    // Анимация счетчиков
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedTotalWorkouts(Math.floor(totalWorkouts * progress));
      setAnimatedActiveDays(Math.floor(activeDays * progress));
      setAnimatedTotalMinutes(Math.floor(totalMinutes * progress));
      
      if (step >= steps) {
        setAnimatedTotalWorkouts(totalWorkouts);
        setAnimatedActiveDays(activeDays);
        setAnimatedTotalMinutes(totalMinutes);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [completedWorkouts.length]);

  if (client && !hasAccepted) {
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
            Прогресс доступен после принятия заявки тренером.
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT.PROFILE)}>Перейти в профиль</Button>
        </div>
      </div>
    );
  }

  if (completedWorkouts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-6 px-4 sm:px-6">
        <div className="card max-w-md text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-float">📊</div>
          <h2 className="text-2xl font-bold mb-2">Начните отслеживать прогресс</h2>
          <p
            className="mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Здесь будет ваш прогресс. Выполните первую тренировку сегодня!
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT.TODAY)}>
            Перейти к тренировке
          </Button>
        </div>
      </div>
    );
  }

  // Вычисляем статистику
  const totalWorkouts = completedWorkouts.length;
  const uniqueDates = new Set(completedWorkouts.map(w => {
    try {
      return new Date(w.date).toDateString();
    } catch {
      return '';
    }
  }).filter(Boolean));
  const activeDays = uniqueDates.size;
  const totalSets = completedWorkouts.reduce((sum, w) => sum + (w.totalSets || 0), 0);

  // Система уровней (каждые 5 тренировок = новый уровень)
  const calculateLevel = (workouts: number): { level: number; progress: number; nextLevel: number } => {
    const level = Math.floor(workouts / 5) + 1;
    const workoutsInCurrentLevel = workouts % 5;
    const progress = (workoutsInCurrentLevel / 5) * 100;
    const nextLevel = level + 1;
    return { level, progress, nextLevel };
  };

  const { level, progress, nextLevel } = calculateLevel(totalWorkouts);

  // Календарь активности (последние 30 дней)
  const generateActivityHeatmap = () => {
    const days = 30;
    const today = new Date();
    const heatmap: { date: Date; count: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const workoutCount = completedWorkouts.filter(w => {
        try {
          const workoutDate = new Date(w.date);
          return workoutDate.toDateString() === dateStr;
        } catch {
          return false;
        }
      }).length;
      
      heatmap.push({ date, count: workoutCount });
    }
    
    return heatmap;
  };

  const activityHeatmap = generateActivityHeatmap();

  // Данные для графика (последние 7 дней)
  const getWeeklyData = () => {
    const days = 7;
    const today = new Date();
    const weeklyData: { day: string; sets: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayWorkouts = completedWorkouts.filter(w => {
        try {
          const workoutDate = new Date(w.date);
          return workoutDate.toDateString() === dateStr;
        } catch {
          return false;
        }
      });
      
      const totalSets = dayWorkouts.reduce((sum, w) => sum + (w.totalSets || 0), 0);
      const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
      
      weeklyData.push({ day: dayName, sets: totalSets });
    }
    
    return weeklyData;
  };

  const weeklyData = getWeeklyData();
  const maxSets = Math.max(...weeklyData.map(d => d.sets), 1);

  // Достижения
  const achievements = [
    {
      id: 'first-workout',
      name: 'Первая тренировка',
      icon: '🎯',
      unlocked: totalWorkouts >= 1,
      description: 'Выполните первую тренировку',
    },
    {
      id: 'week-streak',
      name: 'Неделя без пропусков',
      icon: '🔥',
      unlocked: activeDays >= 7,
      description: 'Тренируйтесь 7 дней подряд',
    },
    {
      id: 'base-master',
      name: 'Мастер базы',
      icon: '💪',
      unlocked: totalSets >= 100,
      description: 'Выполните 100 подходов',
    },
    {
      id: 'level-5',
      name: 'Ветеран',
      icon: '⭐',
      unlocked: level >= 5,
      description: 'Достигните 5 уровня',
    },
  ];

  // Сортируем тренировки в обратном хронологическом порядке
  const sortedWorkouts = [...completedWorkouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6 safe-area-bottom min-w-0">
      {/* ЗАГОЛОВОК */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Мой прогресс</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Продолжай в том же духе! 💪
        </p>
      </div>

      {/* КАРТОЧКИ СТАТИСТИКИ */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
        {/* Всего тренировок */}
        <div 
          className="card animate-fade-in" 
          style={{ 
            animationDelay: '0s',
            background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)',
            border: '1px solid rgba(255, 82, 82, 0.2)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="text-4xl p-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(255, 82, 82, 0.2)',
                color: '#FF5252',
              }}
            >
              🏋️
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Всего тренировок
              </p>
              <p className="text-3xl font-bold" style={{ color: '#FF5252' }}>
                {animatedTotalWorkouts}
              </p>
            </div>
          </div>
        </div>

        {/* Минут в зале */}
        <div 
          className="card animate-fade-in" 
          style={{ 
            animationDelay: '0.1s',
            background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)',
            border: '1px solid rgba(255, 82, 82, 0.2)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="text-4xl p-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(255, 82, 82, 0.2)',
                color: '#FF5252',
              }}
            >
              ⏱️
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Минут в зале
              </p>
              <p className="text-3xl font-bold" style={{ color: '#FF5252' }}>
                {animatedTotalMinutes}
              </p>
            </div>
          </div>
        </div>

        {/* Активных дней */}
        <div 
          className="card animate-fade-in" 
          style={{ 
            animationDelay: '0.2s',
            background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)',
            border: '1px solid rgba(255, 82, 82, 0.2)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="text-4xl p-3 rounded-xl"
              style={{
                backgroundColor: 'rgba(255, 82, 82, 0.2)',
                color: '#FF5252',
              }}
            >
              📅
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Активных дней
              </p>
              <p className="text-3xl font-bold" style={{ color: '#FF5252' }}>
                {animatedActiveDays}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* СИСТЕМА УРОВНЕЙ */}
      <div 
        className="card p-4 sm:p-6 animate-fade-in mb-6 min-w-0"
        style={{ 
          animationDelay: '0.3s',
          background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(255, 82, 82, 0.15) 100%)',
          border: '1px solid rgba(255, 82, 82, 0.3)',
        }}
      >
        <div className="flex items-center justify-between gap-4 mb-4 min-w-0">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 break-words">Уровень атлета</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Прогресс до уровня {nextLevel}
            </p>
          </div>
          <div 
            className="text-5xl"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 82, 82, 0.5))' }}
          >
            ⭐
          </div>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl font-bold" style={{ color: '#FF5252' }}>
            {level}
          </span>
          <div className="flex-1">
            <div 
              className="h-4 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 82, 82, 0.2)' }}
            >
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #FF5252 0%, #ff6b6b 100%)',
                  boxShadow: '0 0 10px rgba(255, 82, 82, 0.5)',
                }}
              />
            </div>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {totalWorkouts % 5} / 5 тренировок до следующего уровня
        </p>
      </div>

      {/* ГРАФИК НЕДЕЛЬНЫХ ПОДХОДОВ */}
      <div 
        className="card p-4 sm:p-6 animate-fade-in mb-6 min-w-0"
        style={{ 
          animationDelay: '0.4s',
          background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)',
          border: '1px solid rgba(255, 82, 82, 0.2)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Активность за неделю</h2>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyData.map((data, index) => {
            const height = (data.sets / maxSets) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full h-full flex items-end justify-center">
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${height}%`,
                      minHeight: data.sets > 0 ? '4px' : '0',
                      background: data.sets > 0
                        ? 'linear-gradient(180deg, #FF5252 0%, #ff6b6b 100%)'
                        : 'rgba(255, 82, 82, 0.1)',
                      boxShadow: data.sets > 0 ? '0 0 8px rgba(255, 82, 82, 0.4)' : 'none',
                    }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {data.day}
                </span>
                {data.sets > 0 && (
                  <span className="text-xs" style={{ color: '#FF5252' }}>
                    {data.sets}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* КАЛЕНДАРЬ АКТИВНОСТИ */}
      <div 
        className="card p-4 sm:p-6 animate-fade-in mb-6 min-w-0"
        style={{ 
          animationDelay: '0.5s',
          background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)',
          border: '1px solid rgba(255, 82, 82, 0.2)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Календарь активности</h2>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {activityHeatmap.map((item, index) => {
            const intensity = Math.min(item.count, 4) / 4; // Максимум 4 тренировки в день = полная интенсивность
            return (
              <div
                key={index}
                className="aspect-square rounded"
                style={{
                  backgroundColor: item.count > 0
                    ? `rgba(255, 82, 82, ${0.2 + intensity * 0.6})`
                    : 'rgba(255, 82, 82, 0.05)',
                  border: item.count > 0 
                    ? `1px solid rgba(255, 82, 82, ${0.3 + intensity * 0.4})`
                    : '1px solid rgba(255, 82, 82, 0.1)',
                }}
                title={`${item.date.toLocaleDateString('ru-RU')}: ${item.count} тренировка(ок)`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-4 mt-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(255, 82, 82, 0.2)' }} />
            <span>Меньше</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(255, 82, 82, 0.8)' }} />
            <span>Больше</span>
          </div>
        </div>
      </div>

      {/* ДОСТИЖЕНИЯ */}
      <div 
        className="card p-4 sm:p-6 animate-fade-in mb-6 min-w-0"
        style={{ 
          animationDelay: '0.6s',
          background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)',
          border: '1px solid rgba(255, 82, 82, 0.2)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Достижения</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))' }}>
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className="flex flex-col items-center p-4 rounded-lg text-center animate-fade-in"
              style={{
                animationDelay: `${0.7 + index * 0.1}s`,
                backgroundColor: achievement.unlocked 
                  ? 'rgba(255, 82, 82, 0.2)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${achievement.unlocked ? 'rgba(255, 82, 82, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                opacity: achievement.unlocked ? 1 : 0.5,
              }}
            >
              <div 
                className="text-4xl mb-2"
                style={{ 
                  filter: achievement.unlocked 
                    ? 'drop-shadow(0 0 10px rgba(255, 82, 82, 0.5))' 
                    : 'grayscale(100%)',
                }}
              >
                {achievement.icon}
              </div>
              <h3 className="font-bold text-sm mb-1">{achievement.name}</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <span className="mt-2 text-xs" style={{ color: '#4ade80' }}>
                  ✓ Разблокировано
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ИСТОРИЯ ТРЕНИРОВОК */}
      <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <h2 className="text-2xl font-bold mb-4">История тренировок</h2>
        
        <div className="space-y-3">
          {sortedWorkouts.slice(0, 10).map((workout, index) => (
            <div
              key={workout.id}
              className="card-hover p-4 animate-fade-in"
              style={{ 
                animationDelay: `${0.9 + index * 0.05}s`,
                background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)',
                border: '1px solid rgba(255, 82, 82, 0.2)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    {workout.workoutName}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatDate(workout.date)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'rgba(255, 82, 82, 0.2)',
                        color: '#FF5252',
                      }}
                    >
                      {workout.exercisesCount} упражнений
                    </span>
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: 'rgba(255, 82, 82, 0.2)',
                        color: '#FF5252',
                      }}
                    >
                      {workout.totalSets} подходов
                    </span>
                  </div>
                </div>
                
                {/* Иконка */}
                <div 
                  className="text-3xl p-3 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(255, 82, 82, 0.2)',
                  }}
                >
                  💪
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
