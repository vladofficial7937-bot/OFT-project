/**
 * Каталог упражнений с фильтрацией и поиском
 * Два режима: Базовый (6 категорий) и Расширенный (10 категорий)
 */

import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../router/routes';
import { MuscleGroup, ClientGoal } from '../../data/models/types';
import type { Exercise } from '../../data/models/types';
import ExerciseCard from '../../components/client/ExerciseCard';

type FilterMode = 'basic' | 'extended';

// Базовый режим: 6 категорий
const BASIC_MUSCLES: Array<{
  value: MuscleGroup;
  label: string;
  icon: string;
  color: string;
}> = [
  { value: MuscleGroup.Chest, label: 'Грудь', icon: '🫁', color: '#ff4444' },
  { value: MuscleGroup.Back, label: 'Спина', icon: '🔙', color: '#3b82f6' },
  { value: MuscleGroup.Legs, label: 'Ноги', icon: '🦵', color: '#22c55e' },
  { value: MuscleGroup.Shoulders, label: 'Плечи', icon: '💪', color: '#f59e0b' },
  { value: MuscleGroup.Arms, label: 'Руки', icon: '🤳', color: '#a855f7' },
  { value: MuscleGroup.Core, label: 'Пресс', icon: '🎯', color: '#06b6d4' },
];

// Расширенный режим: 10 категорий с маппингом на базовые группы + ключевые слова
const EXTENDED_MUSCLES: Array<{
  id: string;
  label: string;
  icon: string;
  color: string;
  basicGroup: MuscleGroup;
  keywords: string[];
}> = [
  { id: 'chest-major', label: 'Большая грудная', icon: '🫁', color: '#ff4444', basicGroup: MuscleGroup.Chest, keywords: ['груд', 'жим лежа', 'отжимания', 'разводка'] },
  { id: 'lats', label: 'Широчайшие', icon: '🔙', color: '#3b82f6', basicGroup: MuscleGroup.Back, keywords: ['широчайш', 'подтягиван', 'тяга'] },
  { id: 'quads', label: 'Квадрицепс', icon: '🦵', color: '#22c55e', basicGroup: MuscleGroup.Legs, keywords: ['квадрицепс', 'приседан', 'разгибан', 'выпад'] },
  { id: 'hamstrings', label: 'Бицепс бедра', icon: '🦵', color: '#16a34a', basicGroup: MuscleGroup.Legs, keywords: ['бицепс бедра', 'бедра', 'румын', 'становая'] },
  { id: 'front-delta', label: 'Передняя дельта', icon: '💪', color: '#f59e0b', basicGroup: MuscleGroup.Shoulders, keywords: ['передн', 'армейский', 'жим стоя'] },
  { id: 'side-delta', label: 'Средняя дельта', icon: '💪', color: '#eab308', basicGroup: MuscleGroup.Shoulders, keywords: ['средн', 'махи', 'в стороны'] },
  { id: 'traps', label: 'Трапеции', icon: '📐', color: '#8b5cf6', basicGroup: MuscleGroup.Back, keywords: ['трапец', 'шраг'] },
  { id: 'triceps', label: 'Трицепс', icon: '🤳', color: '#a855f7', basicGroup: MuscleGroup.Arms, keywords: ['трицепс', 'брусья'] },
  { id: 'biceps', label: 'Бицепс', icon: '🤳', color: '#c084fc', basicGroup: MuscleGroup.Arms, keywords: ['бицепс', 'сгибания'] },
  { id: 'obliques', label: 'Косые мышцы', icon: '🎯', color: '#06b6d4', basicGroup: MuscleGroup.Core, keywords: ['косые', 'скручиван', 'боковые'] },
];

// Оборудование — видно в обоих режимах
const EQUIPMENT_CONFIG: Array<{
  value: string;
  label: string;
  icon: string;
}> = [
  { value: 'турник', label: 'Турник', icon: '🏋️' },
  { value: 'штанга', label: 'Штанга', icon: '⚖️' },
  { value: 'гантели', label: 'Гантели', icon: '💪' },
  { value: 'резинки', label: 'Резинки', icon: '🔗' },
  { value: 'гиря', label: 'Гиря', icon: '⚡' },
  { value: 'брусья', label: 'Брусья', icon: '📊' },
  { value: 'блочный тренажер', label: 'Блочный тренажер', icon: '🏋️‍♂️' },
  { value: 'скамья', label: 'Скамья', icon: '🪑' },
];

export default function ExerciseCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const exercises = useAppStore((state) => state.exercises || []);
  const activeClient = useAppStore((state) => state.activeClient);

  // Режим фильтрации: Базовый (6 категорий) или Расширенный (10 категорий)
  const [filterMode, setFilterMode] = useState<FilterMode>('basic');

  // Состояние поиска
  const [searchQuery, setSearchQuery] = useState('');

  // Получаем параметр muscle из URL
  const muscleParam = searchParams.get('muscle');

  // Активные фильтры мышц: в Basic — MuscleGroup[], в Extended — id расширенных категорий
  const [activeMuscleFilters, setActiveMuscleFilters] = useState<string[]>(() => {
    if (muscleParam && Object.values(MuscleGroup).includes(muscleParam as MuscleGroup)) {
      return [muscleParam];
    }
    return [];
  });

  // Активные фильтры по оборудованию (видны в обоих режимах)
  const [activeEquipmentFilters, setActiveEquipmentFilters] = useState<string[]>([]);

  const switchFilterMode = (mode: FilterMode) => {
    if (mode === filterMode) return;
    setFilterMode(mode);
    setActiveMuscleFilters([]);
    setSearchParams({});
  };

  const toggleMuscleFilterBasic = (muscleGroup: MuscleGroup) => {
    const key = muscleGroup;
    setActiveMuscleFilters((prev) => {
      const next = prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key];
      if (next.length === 0) setSearchParams({});
      else if (next.length === 1) setSearchParams({ muscle: next[0] });
      else setSearchParams({});
      return next;
    });
  };

  const toggleMuscleFilterExtended = (extendedId: string) => {
    setActiveMuscleFilters((prev) => {
      if (prev.includes(extendedId)) return prev.filter((f) => f !== extendedId);
      return [...prev, extendedId];
    });
    setSearchParams({});
  };

  const toggleEquipmentFilter = (equipment: string) => {
    setActiveEquipmentFilters((prev) =>
      prev.includes(equipment) ? prev.filter((e) => e !== equipment) : [...prev, equipment]
    );
  };

  const clearFilters = () => {
    setActiveMuscleFilters([]);
    setActiveEquipmentFilters([]);
    setSearchQuery('');
    setSearchParams({});
  };

  // Фильтрация и умная сортировка упражнений
  const filteredExercises: Exercise[] = useMemo(() => {
    const hasExerciseConflict = (exercise: Exercise): boolean => {
      const clientContraindications = activeClient?.contraindications || [];
      if (!exercise.avoidIf || exercise.avoidIf.length === 0) return false;
      return exercise.avoidIf.some((c) => clientContraindications.includes(c));
    };

    const matchesClientGoal = (exercise: Exercise): boolean => {
      if (!activeClient?.goal) return true;
      const goal = activeClient.goal;
      if (goal === ClientGoal.WeightLoss) {
        return exercise.muscleGroup === MuscleGroup.Legs || exercise.muscleGroup === MuscleGroup.Core;
      }
      if (goal === ClientGoal.MuscleGain) return true;
      if (goal === ClientGoal.Endurance) {
        return exercise.muscleGroup === MuscleGroup.Legs || exercise.muscleGroup === MuscleGroup.Core;
      }
      return true;
    };

    const matchesExtended = (ex: Exercise, extendedId: string): boolean => {
      const config = EXTENDED_MUSCLES.find((c) => c.id === extendedId);
      if (!config) return false;
      if (ex.muscleGroup !== config.basicGroup) return false;
      const text = `${ex.name} ${ex.description}`.toLowerCase();
      if (config.keywords.length === 0) return true;
      return config.keywords.some((k) => text.includes(k.toLowerCase()));
    };

    let result = exercises;

    // Фильтрация по группам мышц (Базовый или Расширенный)
    if (activeMuscleFilters.length > 0) {
      if (filterMode === 'basic') {
        result = result.filter((ex) =>
          activeMuscleFilters.some((f) => ex.muscleGroup === (f as MuscleGroup))
        );
      } else {
        result = result.filter((ex) =>
          activeMuscleFilters.some((id) => matchesExtended(ex, id))
        );
      }
    }

    // Фильтрация по оборудованию (в обоих режимах)
    if (activeEquipmentFilters.length > 0) {
      result = result.filter((ex) => {
        const exerciseEquipment = ex.equipment || [];
        return activeEquipmentFilters.some((filterEq) =>
          exerciseEquipment.some((eq) => eq.toLowerCase() === filterEq.toLowerCase())
        );
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.description.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const aHasConflict = hasExerciseConflict(a);
      const bHasConflict = hasExerciseConflict(b);
      const aMatchesGoal = matchesClientGoal(a);
      const bMatchesGoal = matchesClientGoal(b);
      if (aHasConflict && !bHasConflict) return 1;
      if (!aHasConflict && bHasConflict) return -1;
      if (aMatchesGoal && !bMatchesGoal) return -1;
      if (!aMatchesGoal && bMatchesGoal) return 1;
      return a.name.localeCompare(b.name, 'ru');
    });

    return result;
  }, [exercises, activeMuscleFilters, activeEquipmentFilters, searchQuery, activeClient, filterMode]);

  const getMuscleLabel = (id: string): string => {
    if (filterMode === 'basic') {
      const c = BASIC_MUSCLES.find((x) => x.value === id);
      return c?.label ?? id;
    }
    const c = EXTENDED_MUSCLES.find((x) => x.id === id);
    return c?.label ?? id;
  };

  const getTitle = () => {
    if (activeMuscleFilters.length === 0 && !searchQuery) return 'Каталог упражнений';
    if (activeMuscleFilters.length === 1 && !searchQuery) {
      return `Упражнения: ${getMuscleLabel(activeMuscleFilters[0])}`;
    }
    if (activeMuscleFilters.length > 1) return 'Упражнения по фильтрам';
    if (searchQuery) return `Поиск: "${searchQuery}"`;
    return 'Каталог упражнений';
  };

  const hasActiveFilters =
    activeMuscleFilters.length > 0 || activeEquipmentFilters.length > 0 || searchQuery.trim().length > 0;

  const countBasic = (mg: MuscleGroup) =>
    exercises.filter((ex) => ex.muscleGroup === mg).length;

  const countExtended = (extendedId: string) => {
    const config = EXTENDED_MUSCLES.find((c) => c.id === extendedId);
    if (!config) return 0;
    return exercises.filter((ex) => {
      if (ex.muscleGroup !== config.basicGroup) return false;
      const text = `${ex.name} ${ex.description}`.toLowerCase();
      return config.keywords.length === 0 || config.keywords.some((k) => text.includes(k.toLowerCase()));
    }).length;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
      {/* Заголовок */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 break-words">{getTitle()}</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {filteredExercises.length}{' '}
          {filteredExercises.length === 1
            ? 'упражнение найдено'
            : filteredExercises.length < 5
            ? 'упражнения найдено'
            : 'упражнений найдено'}
        </p>
      </div>

      {/* Поиск + переключатель режима фильтрации (Glassmorphism) */}
      <div className="mb-4 animate-fade-in flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.05s' }}>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск по названию упражнения..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-card-hover)] transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Режим фильтрации: Базовый / Расширенный (Tabs) */}
        <div
          className="flex shrink-0 rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
        >
          <button
            type="button"
            onClick={() => switchFilterMode('basic')}
            className="px-4 py-2.5 text-sm font-medium transition-colors"
            style={
              filterMode === 'basic'
                ? { backgroundColor: 'var(--color-accent)', color: '#fff' }
                : { color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }
            }
          >
            Базовый
          </button>
          <button
            type="button"
            onClick={() => switchFilterMode('extended')}
            className="px-4 py-2.5 text-sm font-medium transition-colors border-l"
            style={{
              borderColor: 'var(--color-border)',
              ...(filterMode === 'extended'
                ? { backgroundColor: 'var(--color-accent)', color: '#fff' }
                : { color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }),
            }}
          >
            Расширенный
          </button>
        </div>
      </div>

      {/* Фильтры по группам мышц (6 в Базовом / 10 в Расширенном) */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-wrap gap-2">
          {filterMode === 'basic'
            ? BASIC_MUSCLES.map((group) => {
                const isActive = activeMuscleFilters.includes(group.value);
                const exerciseCount = countBasic(group.value);
                return (
                  <button
                    key={group.value}
                    onClick={() => toggleMuscleFilterBasic(group.value)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                      isActive ? 'scale-105 shadow-lg' : 'hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: isActive ? group.color : 'var(--color-card)',
                      color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                      border: `2px solid ${isActive ? group.color : 'var(--color-border)'}`,
                      boxShadow: isActive ? `0 4px 12px ${group.color}40` : 'none',
                    }}
                  >
                    <span>{group.icon}</span>
                    <span>{group.label}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-background-secondary)',
                      }}
                    >
                      {exerciseCount}
                    </span>
                  </button>
                );
              })
            : EXTENDED_MUSCLES.map((group) => {
                const isActive = activeMuscleFilters.includes(group.id);
                const exerciseCount = countExtended(group.id);
                return (
                  <button
                    key={group.id}
                    onClick={() => toggleMuscleFilterExtended(group.id)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                      isActive ? 'scale-105 shadow-lg' : 'hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: isActive ? group.color : 'var(--color-card)',
                      color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                      border: `2px solid ${isActive ? group.color : 'var(--color-border)'}`,
                      boxShadow: isActive ? `0 4px 12px ${group.color}40` : 'none',
                    }}
                  >
                    <span>{group.icon}</span>
                    <span>{group.label}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-background-secondary)',
                      }}
                    >
                      {exerciseCount}
                    </span>
                  </button>
                );
              })}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: 'var(--color-error)', color: '#FFFFFF' }}
            >
              ✕ Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Фильтры по оборудованию */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <div className="mb-2">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Оборудование
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_CONFIG.map((equipment) => {
            const isActive = activeEquipmentFilters.includes(equipment.value);
            const exerciseCount = exercises.filter((ex) => {
              const exerciseEquipment = ex.equipment || [];
              return exerciseEquipment.some((eq) => eq.toLowerCase() === equipment.value.toLowerCase());
            }).length;

            return (
              <button
                key={equipment.value}
                onClick={() => toggleEquipmentFilter(equipment.value)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  isActive ? 'scale-105 shadow-lg' : 'hover:scale-102'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-card)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                  border: `2px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  boxShadow: isActive ? '0 4px 12px rgba(255, 82, 82, 0.4)' : 'none',
                }}
              >
                <span className="text-lg">{equipment.icon}</span>
                <span>{equipment.label}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-background-secondary)',
                  }}
                >
                  {exerciseCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Список упражнений */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {filteredExercises.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-7xl mb-6 animate-float">🔍</div>
            <h3 className="text-2xl font-bold mb-3">Упражнения не найдены</h3>
            <p className="mb-6 text-base" style={{ color: 'var(--color-text-secondary)' }}>
              {searchQuery
                ? `По запросу "${searchQuery}" ничего не найдено`
                : activeMuscleFilters.length > 0
                ? 'По выбранным фильтрам упражнения не найдены'
                : 'В каталоге пока нет упражнений'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-secondary">
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}
          >
            {filteredExercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(ROUTES.CLIENT.EXERCISE_DETAIL(exercise.id))}
              >
                <ExerciseCard exercise={exercise} />
              </div>
            ))}
          </div>
        )}

        {filteredExercises.length > 0 && (
          <p
            className="mt-6 text-center text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Нажмите на карточку упражнения, чтобы открыть подробности
          </p>
        )}
      </div>
    </div>
  );
}
