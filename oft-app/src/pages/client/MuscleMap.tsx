/**
 * Карта мышц - интерактивный выбор группы мышц для упражнений
 * Использует новые типы и useAppStore
 * При использовании в Каталоге: onMuscleClick переключает на таб «Список» с фильтром по группе.
 */

import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../router/routes';
import { MuscleGroup } from '../../data/models/types';

export interface MuscleMapProps {
  /** При наличии — вызывается вместо перехода по маршруту (режим вкладки Каталог) */
  onMuscleClick?: (muscleGroup: MuscleGroup) => void;
}

// Массив групп мышц с иконками и названиями
const muscleGroups = [
  {
    id: MuscleGroup.Chest,
    name: 'Грудь',
    icon: '🫀',
    color: '#ff4444',
  },
  {
    id: MuscleGroup.Back,
    name: 'Спина',
    icon: '🦴',
    color: '#3b82f6',
  },
  {
    id: MuscleGroup.Legs,
    name: 'Ноги',
    icon: '🦵',
    color: '#22c55e',
  },
  {
    id: MuscleGroup.Shoulders,
    name: 'Плечи',
    icon: '💪',
    color: '#f59e0b',
  },
  {
    id: MuscleGroup.Arms,
    name: 'Руки',
    icon: '💪',
    color: '#a855f7',
  },
  {
    id: MuscleGroup.Core,
    name: 'Кор',
    icon: '⭕',
    color: '#06b6d4',
  },
] as const;

export default function MuscleMap({ onMuscleClick }: MuscleMapProps) {
  const navigate = useNavigate();
  const exercises = useAppStore((state) => state.exercises || []);

  // Подсчёт упражнений по группе мышц
  const getExerciseCount = (muscleGroup: MuscleGroup): number => {
    return exercises.filter((ex) => ex.muscleGroup === muscleGroup).length;
  };

  // Обработчик клика на группу мышц
  const handleMuscleClick = (muscleGroup: MuscleGroup) => {
    if (onMuscleClick) {
      onMuscleClick(muscleGroup);
      return;
    }
    navigate(`${ROUTES.CLIENT.CATALOG}?tab=list&muscle=${muscleGroup}`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
      {/* Заголовок */}
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-2xl sm:text-5xl font-bold mb-4 break-words" style={{ color: 'var(--color-text-primary)' }}>
          🗺️ Карта мышц
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Выберите группу мышц, чтобы увидеть доступные упражнения
        </p>
      </div>

      {/* Сетка групп мышц */}
      <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
        {muscleGroups.map((group, index) => {
          const exerciseCount = getExerciseCount(group.id);

          return (
            <button
              key={group.id}
              onClick={() => handleMuscleClick(group.id)}
              className="card-hover group relative overflow-hidden animate-fade-in p-8 text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
              aria-label={`Выбрать группу мышц: ${group.name}`}
            >
              {/* Градиентный фон при hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${group.color} 0%, transparent 100%)`,
                }}
              />

              {/* Акцентная линия сверху при hover */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${group.color}, transparent)`,
                }}
              />

              {/* Контент */}
              <div className="relative z-10">
                {/* Иконка */}
                <div
                  className="text-7xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    filter: `drop-shadow(0 0 20px ${group.color}40)`,
                  }}
                >
                  {group.icon}
                </div>

                {/* Название */}
                <h3 className="font-bold text-xl mb-3 transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                  {group.name}
                </h3>

                {/* Количество упражнений */}
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="text-2xl font-bold transition-all duration-300 group-hover:scale-110"
                    style={{ color: group.color }}
                  >
                    {exerciseCount}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {exerciseCount === 0
                      ? 'упражнений'
                      : exerciseCount === 1
                      ? 'упражнение'
                      : exerciseCount < 5
                      ? 'упражнения'
                      : 'упражнений'}
                  </span>
                </div>

                {/* Индикатор клика */}
                <div
                  className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0"
                  style={{ color: group.color }}
                >
                  <span className="text-sm font-semibold">Выбрать →</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Подсказка */}
      <div className="card mt-8 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <p className="text-sm flex items-center justify-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="text-xl">💡</span>
          <span>Совет: Начинайте тренировку с разминки и заканчивайте растяжкой</span>
        </p>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
        <div className="card text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
            {muscleGroups.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Групп мышц
          </div>
        </div>
        <div className="card text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
            {exercises.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Всего упражнений
          </div>
        </div>
        <div className="card text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
            {muscleGroups.length > 0 ? Math.round(exercises.length / muscleGroups.length) : 0}
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            В среднем на группу
          </div>
        </div>
      </div>
    </div>
  );
}
