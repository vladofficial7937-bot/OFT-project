/**
 * История тренировок клиента
 * Отображает все завершенные тренировки в обратном хронологическом порядке
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useCoachingStore } from '../../store/useCoachingStore';
import { ROUTES } from '../../router/routes';
import Button from '../../components/ui/Button';
import type { WorkoutHistoryEntry, WorkoutMood } from '../../data/models/types';

// Конфигурация настроений
const MOOD_CONFIG: Record<WorkoutMood, { emoji: string; label: string; color: string }> = {
  strong: { emoji: '💪', label: 'Сильный', color: '#22c55e' },
  good: { emoji: '😊', label: 'Хорошо', color: '#84cc16' },
  normal: { emoji: '😐', label: 'Нормально', color: '#eab308' },
  tired: { emoji: '😓', label: 'Устал', color: '#f97316' },
  exhausted: { emoji: '😵', label: 'Измотан', color: '#ef4444' },
};

// Компонент аккордеона для одной тренировки
function WorkoutAccordionItem({ entry, isExpanded, onToggle }: {
  entry: WorkoutHistoryEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const date = new Date(entry.date);
  const formattedDate = date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
  const formattedTime = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const moodInfo = entry.mood ? MOOD_CONFIG[entry.mood] : null;

  return (
    <div
      className="card overflow-hidden transition-all duration-300"
      style={{
        border: isExpanded ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
      }}
    >
      {/* Заголовок (всегда видимый) */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--color-card-hover)] transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Дата */}
          <div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.15) 0%, rgba(255, 107, 107, 0.1) 100%)',
            }}
          >
            <span className="text-lg">📅</span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {date.getDate()}
            </span>
          </div>

          {/* Информация */}
          <div>
            <h3 className="font-bold text-base">{entry.workoutName}</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {formattedDate} в {formattedTime} • {entry.exercises.length} упр.
              {entry.duration && ` • ${entry.duration} мин`}
            </p>
          </div>
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-3">
          {/* Настроение */}
          {moodInfo && (
            <span
              className="text-2xl"
              title={moodInfo.label}
            >
              {moodInfo.emoji}
            </span>
          )}

          {/* Стрелка */}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-xl"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ▼
          </motion.span>
        </div>
      </button>

      {/* Развернутое содержимое */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 pt-0 space-y-3"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              {/* Список упражнений */}
              <div className="space-y-2 mt-3">
                {entry.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-background-secondary)' }}
                  >
                    <span className="font-medium">{exercise.title}</span>
                    <span
                      className="text-sm px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(255, 82, 82, 0.15)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      {exercise.sets} × {exercise.reps}
                      {exercise.weight && ` @ ${exercise.weight}кг`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Заметки */}
              {entry.notes && (
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-background-secondary)' }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    📝 Заметки:
                  </p>
                  <p className="text-sm">{entry.notes}</p>
                </div>
              )}

              {/* Статистика */}
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span>
                  📊 Всего подходов: {entry.exercises.reduce((sum, ex) => sum + parseInt(ex.sets), 0)}
                </span>
                {moodInfo && (
                  <span style={{ color: moodInfo.color }}>
                    {moodInfo.emoji} {moodInfo.label}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WorkoutHistory() {
  const navigate = useNavigate();
  
  const activeClient = useAppStore((s) => s.activeClient);
  const clients = useAppStore((s) => s.clients || []);
  const getClientWorkoutHistory = useAppStore((s) => s.getClientWorkoutHistory);
  const getRequestForClient = useCoachingStore((s) => s.getRequestForClient);
  
  const client = activeClient || clients[0];
  const request = client && client.id ? getRequestForClient(client.id) : null;
  const hasAccepted = request?.status === 'accepted';
  
  // Состояние развернутых карточек
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // Фильтр по месяцу
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  
  // Мемоизируем историю тренировок чтобы избежать лишних перерендеров
  const history = useMemo(() => {
    if (!client || !client.id) return [];
    try {
      return getClientWorkoutHistory(client.id) || [];
    } catch (e) {
      console.error('Error getting workout history:', e);
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id]);
  
  // Получаем уникальные месяцы для фильтра
  const availableMonths = useMemo(() => {
    const months = new Map<string, { label: string; count: number }>();
    
    history.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      
      if (months.has(monthKey)) {
        months.get(monthKey)!.count++;
      } else {
        months.set(monthKey, { label: monthLabel, count: 1 });
      }
    });
    
    return Array.from(months.entries()).map(([key, value]) => ({
      key,
      ...value,
    }));
  }, [history]);
  
  // Фильтруем историю по выбранному месяцу
  const filteredHistory = useMemo(() => {
    if (!selectedMonth) return history;
    
    return history.filter((entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  }, [history, selectedMonth]);
  
  // Переключение развернутого состояния
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  // Развернуть/свернуть все
  const toggleAll = () => {
    if (expandedIds.size === filteredHistory.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredHistory.map((h) => h.id)));
    }
  };

  if (client && !hasAccepted) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 min-w-0 flex items-center justify-center min-h-[50vh]">
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
            История тренировок доступна после принятия заявки тренером.
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT.PROFILE)}>Перейти в профиль</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
      {/* Заголовок */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 break-words">
            <span>🕐</span>
            История тренировок
          </h1>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.CLIENT.HOME)}
          >
            ← Назад
          </Button>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {history.length > 0
            ? `Всего ${history.length} ${history.length === 1 ? 'тренировка' : history.length < 5 ? 'тренировки' : 'тренировок'}`
            : 'Ваша история тренировок'}
        </p>
      </div>

      {/* Фильтры */}
      {availableMonths.length > 1 && (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedMonth === null ? 'scale-105' : ''
              }`}
              style={{
                backgroundColor: selectedMonth === null ? 'var(--color-accent)' : 'var(--color-card)',
                color: selectedMonth === null ? '#FFFFFF' : 'var(--color-text-primary)',
              }}
            >
              Все ({history.length})
            </button>
            {availableMonths.map((month) => (
              <button
                key={month.key}
                onClick={() => setSelectedMonth(month.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  selectedMonth === month.key ? 'scale-105' : ''
                }`}
                style={{
                  backgroundColor: selectedMonth === month.key ? 'var(--color-accent)' : 'var(--color-card)',
                  color: selectedMonth === month.key ? '#FFFFFF' : 'var(--color-text-primary)',
                }}
              >
                {month.label} ({month.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Кнопка развернуть/свернуть все */}
      {filteredHistory.length > 1 && (
        <div className="mb-4 flex justify-end animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={toggleAll}
            className="text-sm font-medium"
            style={{ color: 'var(--color-accent)' }}
          >
            {expandedIds.size === filteredHistory.length ? '▲ Свернуть все' : '▼ Развернуть все'}
          </button>
        </div>
      )}

      {/* Список тренировок или пустое состояние */}
      {filteredHistory.length === 0 ? (
        <div className="card text-center py-16 animate-fade-in">
          <div className="text-7xl mb-6 animate-float">📖</div>
          <h3 className="text-2xl font-bold mb-3">Твоя история ещё пишется</h3>
          <p className="mb-6 text-base" style={{ color: 'var(--color-text-secondary)' }}>
            {selectedMonth
              ? 'В этом месяце тренировок не было. Выберите другой период или начните тренировку!'
              : 'Здесь появятся все твои завершённые тренировки. Начни первую прямо сейчас!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {selectedMonth && (
              <Button variant="secondary" onClick={() => setSelectedMonth(null)}>
                Показать все
              </Button>
            )}
            <Button variant="primary" onClick={() => navigate(ROUTES.CLIENT.TODAY)}>
              🚀 Начать тренировку
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <WorkoutAccordionItem
                entry={entry}
                isExpanded={expandedIds.has(entry.id)}
                onToggle={() => toggleExpanded(entry.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Статистика внизу */}
      {history.length > 0 && (
        <div
          className="card mt-8 text-center animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
            <div>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                {history.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Тренировок
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                {history.reduce((sum, h) => sum + h.exercises.length, 0)}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Упражнений
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                {history.reduce((sum, h) => 
                  sum + h.exercises.reduce((s, e) => s + parseInt(e.sets), 0), 0
                )}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Подходов
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
