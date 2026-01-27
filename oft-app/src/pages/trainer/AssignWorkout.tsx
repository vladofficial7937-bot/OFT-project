/**
 * Конструктор тренировки - назначение недельного плана клиенту
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/ui/Button';
import type { Exercise, WorkoutPlanExercise, DayOfWeek } from '../../data/models/types';
import { MuscleGroup, Contraindication } from '../../data/models/types';
import { ROUTES } from '../../router/routes';

// Тип для пресета упражнений
interface WorkoutPreset {
  id: string;
  name: string;
  exercises: WorkoutPlanExercise[];
  createdAt: string;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'Mon', label: 'Понедельник', short: 'Пн' },
  { value: 'Tue', label: 'Вторник', short: 'Вт' },
  { value: 'Wed', label: 'Среда', short: 'Ср' },
  { value: 'Thu', label: 'Четверг', short: 'Чт' },
  { value: 'Fri', label: 'Пятница', short: 'Пт' },
  { value: 'Sat', label: 'Суббота', short: 'Сб' },
  { value: 'Sun', label: 'Воскресенье', short: 'Вс' },
];

// Конфигурация групп мышц
const MUSCLE_GROUPS_CONFIG: Array<{
  value: MuscleGroup;
  label: string;
  color: string;
}> = [
  { value: MuscleGroup.Chest, label: 'Грудь', color: '#ff4444' },
  { value: MuscleGroup.Back, label: 'Спина', color: '#3b82f6' },
  { value: MuscleGroup.Legs, label: 'Ноги', color: '#22c55e' },
  { value: MuscleGroup.Shoulders, label: 'Плечи', color: '#f59e0b' },
  { value: MuscleGroup.Arms, label: 'Руки', color: '#a855f7' },
  { value: MuscleGroup.Core, label: 'Кор', color: '#06b6d4' },
];

// Названия противопоказаний для отображения
const CONTRAINDICATION_LABELS: Record<Contraindication, string> = {
  [Contraindication.Back]: 'спине',
  [Contraindication.Knees]: 'коленях',
  [Contraindication.Shoulders]: 'плечах',
  [Contraindication.Wrists]: 'запястьях',
  [Contraindication.Neck]: 'шее',
  [Contraindication.Heart]: 'сердце',
};

export default function AssignWorkout() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const clients = useAppStore((state) => state.clients || []);
  const currentUser = useAuthStore((state) => state.user);
  const exercises = useAppStore((state) => state.exercises || []);
  const updateWeeklyPlan = useAppStore((state) => state.updateWeeklyPlan);
  const addToast = useAppStore((state) => state.addToast);

  // Находим клиента
  const client = clients.find((c) => c.id === clientId);
  
  // Проверяем, что клиент принадлежит этому тренеру
  useEffect(() => {
    if (client && client.assignedTrainerId !== currentUser?.id) {
      navigate(ROUTES.TRAINER.DASHBOARD, { replace: true });
    }
  }, [client, currentUser, navigate]);

  // Состояние текущего выбранного дня
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Mon');
  
  // Состояние выбранных упражнений для текущего дня
  const [selectedExercises, setSelectedExercises] = useState<WorkoutPlanExercise[]>([]);
  
  // Состояние для меню копирования
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  
  // Состояние поиска упражнений
  const [exerciseSearch, setExerciseSearch] = useState('');
  
  // Состояние фильтра по группе мышц
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | null>(null);
  
  // Состояние для системы пресетов
  const [workoutPresets, setWorkoutPresets] = useState<WorkoutPreset[]>([]);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  
  // Состояние для умного поиска
  const [searchSuggestions, setSearchSuggestions] = useState<Exercise[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Состояние для массового выбора
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Загружаем упражнения для выбранного дня
  useEffect(() => {
    if (client?.weeklyPlan?.[selectedDay]) {
      setSelectedExercises(client.weeklyPlan[selectedDay] || []);
    } else {
      setSelectedExercises([]);
    }
  }, [client, selectedDay]);

  // Загружаем пресеты из localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem(`workoutPresets_${currentUser?.id}`);
    if (savedPresets) {
      try {
        setWorkoutPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Ошибка загрузки пресетов:', error);
      }
    }
  }, [currentUser?.id]);

  // Закрываем меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPresetMenu && !(event.target as Element).closest('.preset-menu')) {
        setShowPresetMenu(false);
      }
      if (showCopyMenu && !(event.target as Element).closest('.copy-menu')) {
        setShowCopyMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPresetMenu, showCopyMenu]);

  // Добавить упражнение в план
  const handleAddExercise = (exerciseId: string) => {
    // Проверяем, не добавлено ли уже это упражнение
    if (selectedExercises.some((ex) => ex.exerciseId === exerciseId)) {
      return;
    }

    // Проверяем предупреждения перед добавлением
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      const warning = getExerciseWarning(exercise);
      if (warning.hasWarning) {
        const conflictLabels = warning.conflicts.map((c) => CONTRAINDICATION_LABELS[c]).join(', ');
        addToast({
          type: 'warning',
          message: `Внимание! У клиента есть ограничения: ${conflictLabels}`,
          duration: 5000,
        });
      }
    }

    // Добавляем с дефолтными значениями
    const newExercise: WorkoutPlanExercise = {
      exerciseId,
      sets: 3,
      reps: 10,
    };

    setSelectedExercises([...selectedExercises, newExercise]);

    // Хаптическая отдача (имитация через Telegram WebApp)
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  // Удалить упражнение из плана
  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.exerciseId !== exerciseId));
  };

  // Обновить подходы/повторения для упражнения
  const handleUpdateExercise = (exerciseId: string, field: 'sets' | 'reps', value: number) => {
    setSelectedExercises(
      selectedExercises.map((ex) =>
        ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
      )
    );
  };

  // Сохранить план для текущего дня
  const handleSavePlan = () => {
    if (!clientId || !client) {
      alert('Ошибка: клиент не найден');
      return;
    }

    // Сохраняем план для выбранного дня
    updateWeeklyPlan(clientId, selectedDay, selectedExercises);

    // Показываем уведомление
    const addToast = useAppStore.getState().addToast;
    addToast({
      type: 'success',
      message: `План тренировок на ${DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label} успешно сохранен!`,
    });

    // Отправляем Telegram уведомление клиенту (если привязан)
    const sendTelegramNotification = useAppStore.getState().sendTelegramNotification;
    sendTelegramNotification(clientId, 'Тренер прислал вам новый план тренировок!');
  };

  // Сохранить текущий план как пресет
  const handleSavePreset = () => {
    if (selectedExercises.length === 0) {
      addToast({
        type: 'error',
        message: 'Нельзя сохранить пустой план как пресет',
      });
      return;
    }

    if (!presetName.trim()) {
      addToast({
        type: 'error',
        message: 'Введите название пресета',
      });
      return;
    }

    const newPreset: WorkoutPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      exercises: [...selectedExercises],
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...workoutPresets, newPreset];
    setWorkoutPresets(updatedPresets);
    localStorage.setItem(`workoutPresets_${currentUser?.id}`, JSON.stringify(updatedPresets));

    setPresetName('');
    setShowPresetModal(false);
    setShowPresetMenu(false);

    addToast({
      type: 'success',
      message: `Пресет "${newPreset.name}" сохранен!`,
    });
  };

  // Применить пресет к текущему дню
  const handleApplyPreset = (preset: WorkoutPreset) => {
    // Проверяем конфликты с противопоказаниями
    const conflicts: string[] = [];
    preset.exercises.forEach((presetEx) => {
      const exercise = exercises.find((e) => e.id === presetEx.exerciseId);
      if (exercise) {
        const warning = getExerciseWarning(exercise);
        if (warning.hasWarning) {
          conflicts.push(exercise.name);
        }
      }
    });

    if (conflicts.length > 0) {
      const conflictNames = conflicts.join(', ');
      addToast({
        type: 'warning',
        message: `Внимание! Пресет содержит упражнения с противопоказаниями: ${conflictNames}`,
        duration: 5000,
      });
    }

    setSelectedExercises([...preset.exercises]);
    setShowPresetMenu(false);

    addToast({
      type: 'info',
      message: `Пресет "${preset.name}" применен к ${selectedDayInfo?.label.toLowerCase()}`,
    });
  };

  // Удалить пресет
  const handleDeletePreset = (presetId: string) => {
    const updatedPresets = workoutPresets.filter(p => p.id !== presetId);
    setWorkoutPresets(updatedPresets);
    localStorage.setItem(`workoutPresets_${currentUser?.id}`, JSON.stringify(updatedPresets));

    addToast({
      type: 'info',
      message: 'Пресет удален',
    });
  };

  // Обновить предложения поиска
  const updateSearchSuggestions = (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = exercises
      .filter(ex => 
        !selectedExercises.some(se => se.exerciseId === ex.id) &&
        (ex.name.toLowerCase().includes(query.toLowerCase()) ||
         getMuscleGroupName(ex.muscleGroup).toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 8); // Ограничиваем до 8 предложений

    setSearchSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Выбрать упражнение из предложений
  const handleSelectSuggestion = (exercise: Exercise) => {
    handleAddExercise(exercise.id);
    setExerciseSearch('');
    setShowSuggestions(false);
  };

  // Переключить выбор упражнения для массового добавления
  const toggleBulkSelection = (exerciseId: string) => {
    const newSelection = new Set(selectedForBulk);
    if (newSelection.has(exerciseId)) {
      newSelection.delete(exerciseId);
    } else {
      newSelection.add(exerciseId);
    }
    setSelectedForBulk(newSelection);
  };

  // Добавить все выбранные упражнения
  const handleBulkAddExercises = () => {
    if (selectedForBulk.size === 0) {
      addToast({
        type: 'warning',
        message: 'Выберите хотя бы одно упражнение',
      });
      return;
    }

    let addedCount = 0;
    let warningsCount = 0;

    selectedForBulk.forEach(exerciseId => {
      if (!selectedExercises.some(ex => ex.exerciseId === exerciseId)) {
        const exercise = exercises.find(e => e.id === exerciseId);
        if (exercise) {
          const warning = getExerciseWarning(exercise);
          if (warning.hasWarning) {
            warningsCount++;
            addToast({
              type: 'warning',
              message: `Внимание! ${exercise.name} имеет противопоказания`,
              duration: 3000,
            });
          }
          handleAddExercise(exerciseId);
          addedCount++;
        }
      }
    });

    setSelectedForBulk(new Set());
    setBulkMode(false);

    addToast({
      type: 'success',
      message: `Добавлено ${addedCount} упражнений${warningsCount > 0 ? ` (${warningsCount} с предупреждениями)` : ''}`,
    });
  };

  // Копировать план на другой день
  const handleCopyToDay = (targetDay: DayOfWeek) => {
    if (selectedExercises.length === 0) {
      alert('Нет упражнений для копирования');
      return;
    }

    if (!clientId) {
      return;
    }

    // Копируем упражнения на целевой день
    updateWeeklyPlan(clientId, targetDay, [...selectedExercises]);
    setShowCopyMenu(false);
    alert(`План скопирован на ${DAYS_OF_WEEK.find(d => d.value === targetDay)?.label}`);
  };

  // Получить название упражнения по ID
  const getExerciseName = (exerciseId: string): string => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    return exercise?.name || 'Неизвестное упражнение';
  };

  // Получить группу мышц упражнения
  const getExerciseMuscleGroup = (exerciseId: string): MuscleGroup | null => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    return exercise?.muscleGroup || null;
  };

  // Получить название группы мышц
  const getMuscleGroupName = (muscleGroup: MuscleGroup): string => {
    const names: Record<MuscleGroup, string> = {
      [MuscleGroup.Chest]: 'Грудь',
      [MuscleGroup.Back]: 'Спина',
      [MuscleGroup.Legs]: 'Ноги',
      [MuscleGroup.Shoulders]: 'Плечи',
      [MuscleGroup.Arms]: 'Руки',
      [MuscleGroup.Core]: 'Кор',
    };
    return names[muscleGroup] || muscleGroup;
  };

  // Функция для проверки предупреждений об упражнении
  const getExerciseWarning = (exercise: Exercise): { hasWarning: boolean; message: string; conflicts: Contraindication[] } => {
    const clientContraindications = client?.contraindications || [];
    const conflicts = exercise.avoidIf?.filter((c) => clientContraindications.includes(c)) || [];
    
    if (conflicts.length > 0) {
      const conflictLabels = conflicts.map((c) => CONTRAINDICATION_LABELS[c]).join(', ');
      return {
        hasWarning: true,
        message: `Не рекомендуется при проблемах с ${conflictLabels}`,
        conflicts,
      };
    }
    
    return { hasWarning: false, message: '', conflicts: [] };
  };

  // Фильтр: показываем только упражнения, которых еще нет в плане
  // с учетом поиска и фильтра по группе мышц
  const availableExercises = useMemo(() => {
    let result = exercises.filter(
      (ex) => !selectedExercises.some((se) => se.exerciseId === ex.id)
    );
    
    // Фильтр по группе мышц
    if (muscleFilter) {
      result = result.filter((ex) => ex.muscleGroup === muscleFilter);
    }
    
    // Поиск по названию
    if (exerciseSearch.trim()) {
      const query = exerciseSearch.toLowerCase().trim();
      result = result.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          getMuscleGroupName(ex.muscleGroup).toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [exercises, selectedExercises, exerciseSearch, muscleFilter]);

  // Расчет суммарного объема тренировки (сеты × повторения)
  const totalVolume = useMemo(() => {
    return selectedExercises.reduce((total, ex) => {
      return total + (ex.sets * ex.reps);
    }, 0);
  }, [selectedExercises]);

  // Общее количество подходов
  const totalSets = useMemo(() => {
    return selectedExercises.reduce((total, ex) => total + ex.sets, 0);
  }, [selectedExercises]);

  // Общее количество повторений
  if (!client) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Клиент не найден</h2>
          <Button onClick={() => navigate(ROUTES.TRAINER.DASHBOARD)} className="mt-4">
            Вернуться к списку клиентов
          </Button>
        </div>
      </div>
    );
  }

  const selectedDayInfo = DAYS_OF_WEEK.find(d => d.value === selectedDay);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
      {/* Заголовок */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 break-words">
              Недельный план тренировок
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Клиент: <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{client.name}</span>
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.TRAINER.DASHBOARD)}
          >
            ← Назад к списку
          </Button>
        </div>
      </div>

      {/* Табы дней недели */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 bg-[var(--color-background-secondary)] p-2 rounded-xl">
          {DAYS_OF_WEEK.map((day) => {
            const isActive = selectedDay === day.value;
            const hasPlan = client.weeklyPlan?.[day.value] && (client.weeklyPlan[day.value]?.length || 0) > 0;
            
            return (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-[#FF5252] text-white shadow-lg scale-105'
                    : 'bg-transparent hover:bg-[var(--color-card)]'
                }`}
                style={{
                  color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                }}
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.short}</span>
                {hasPlan && (
                  <span className={`ml-2 text-xs ${isActive ? 'text-white/80' : 'text-[var(--color-accent)]'}`}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        {/* Левая колонка: Доступные упражнения */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">
              Доступные упражнения
            </h2>
            
            {/* Поиск упражнений */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Быстрый поиск упражнения..."
                  value={exerciseSearch}
                  onChange={(e) => {
                    setExerciseSearch(e.target.value);
                    updateSearchSuggestions(e.target.value);
                  }}
                  onFocus={() => {
                    if (exerciseSearch.length >= 2 && searchSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Задержка чтобы успеть кликнуть на предложение
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm"
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">🔍</span>
                {exerciseSearch && (
                  <button
                    onClick={() => {
                      setExerciseSearch('');
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:bg-[var(--color-card-hover)] p-1 rounded transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Предложения поиска */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((exercise) => {
                    const muscleGroup = getMuscleGroupName(exercise.muscleGroup);
                    const groupConfig = MUSCLE_GROUPS_CONFIG.find(g => g.value === exercise.muscleGroup);
                    
                    return (
                      <button
                        key={exercise.id}
                        onClick={() => handleSelectSuggestion(exercise)}
                        className="w-full text-left px-4 py-3 hover:bg-[var(--color-card-hover)] transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-[var(--color-border)] last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{exercise.name}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${groupConfig?.color}20`,
                              color: groupConfig?.color,
                            }}
                          >
                            {muscleGroup}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Быстрые фильтры по группам мышц */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => setMuscleFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  muscleFilter === null ? 'scale-105' : ''
                }`}
                style={{
                  backgroundColor: muscleFilter === null ? 'var(--color-accent)' : 'var(--color-background-secondary)',
                  color: muscleFilter === null ? '#FFFFFF' : 'var(--color-text-secondary)',
                }}
              >
                Все
              </button>
              {MUSCLE_GROUPS_CONFIG.map((group) => (
                <button
                  key={group.value}
                  onClick={() => setMuscleFilter(muscleFilter === group.value ? null : group.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    muscleFilter === group.value ? 'scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: muscleFilter === group.value ? group.color : 'var(--color-background-secondary)',
                    color: muscleFilter === group.value ? '#FFFFFF' : 'var(--color-text-secondary)',
                  }}
                >
                  {group.label}
                </button>
              ))}
            </div>
            
            {/* Кнопки управления */}
            <div className="mb-4 flex flex-wrap gap-2">
              {/* Пресеты */}
              <div className="relative preset-menu">
                <Button
                  variant="secondary"
                  onClick={() => setShowPresetMenu(!showPresetMenu)}
                  className="text-sm"
                >
                  📚 Пресеты {workoutPresets.length > 0 && `(${workoutPresets.length})`}
                </Button>
                
                {showPresetMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl z-10 min-w-[250px] max-h-60 overflow-y-auto">
                    {workoutPresets.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        Нет сохраненных пресетов
                      </div>
                    ) : (
                      <>
                        {workoutPresets.map((preset) => (
                          <div key={preset.id} className="border-b border-[var(--color-border)] last:border-b-0">
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-[var(--color-card-hover)]">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{preset.name}</div>
                                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                  {preset.exercises.length} упражн.
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleApplyPreset(preset)}
                                  className="px-2 py-1 text-xs bg-[var(--color-accent)] text-white rounded hover:opacity-80 transition-opacity"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => handleDeletePreset(preset.id)}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:opacity-80 transition-opacity"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-[var(--color-border)]">
                          <button
                            onClick={() => {
                              setShowPresetModal(true);
                              setShowPresetMenu(false);
                            }}
                            className="w-full px-4 py-2 text-sm hover:bg-[var(--color-card-hover)] transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            ➕ Сохранить текущий план
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Массовый режим */}
              <Button
                variant={bulkMode ? "primary" : "secondary"}
                onClick={() => {
                  setBulkMode(!bulkMode);
                  setSelectedForBulk(new Set());
                }}
                className="text-sm"
              >
                {bulkMode ? '✅ Завершить выбор' : '☑️ Массовый выбор'}
              </Button>
              
              {bulkMode && selectedForBulk.size > 0 && (
                <Button
                  variant="primary"
                  onClick={handleBulkAddExercises}
                  className="text-sm"
                >
                  ➕ Добавить {selectedForBulk.size} упражн.
                </Button>
              )}
            </div>
            
            {/* Список упражнений */}
            {availableExercises.length === 0 ? (
              <div className="text-center py-8">
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  {exerciseSearch || muscleFilter
                    ? 'Упражнения не найдены по заданным фильтрам'
                    : 'Все упражнения добавлены в план'}
                </p>
                {(exerciseSearch || muscleFilter) && (
                  <button
                    onClick={() => {
                      setExerciseSearch('');
                      setMuscleFilter(null);
                    }}
                    className="mt-2 text-sm font-medium"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {availableExercises.map((exercise) => {
                  const muscleGroup = getMuscleGroupName(exercise.muscleGroup);
                  const groupConfig = MUSCLE_GROUPS_CONFIG.find(g => g.value === exercise.muscleGroup);
                  const warning = getExerciseWarning(exercise);
                  const isSelectedForBulk = selectedForBulk.has(exercise.id);
                  
                  return (
                    <div
                      key={exercise.id}
                      className={`card-hover p-4 flex items-center justify-between animate-fade-in ${
                        warning.hasWarning ? 'border-l-4' : ''
                      } ${bulkMode && isSelectedForBulk ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
                      style={{
                        borderLeftColor: warning.hasWarning ? '#ffc107' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {bulkMode && (
                          <input
                            type="checkbox"
                            checked={isSelectedForBulk}
                            onChange={() => toggleBulkSelection(exercise.id)}
                            className="w-5 h-5 rounded border-2 focus:ring-2 focus:ring-[var(--color-accent)]"
                            style={{
                              accentColor: 'var(--color-accent)',
                            }}
                          />
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{exercise.name}</h3>
                            {warning.hasWarning && (
                              <span 
                                className="text-lg cursor-help"
                                title={warning.message}
                              >
                                ⚠️
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${groupConfig?.color}20`,
                                color: groupConfig?.color,
                              }}
                            >
                              {muscleGroup}
                            </span>
                            {warning.hasWarning && (
                              <span 
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: 'rgba(255, 193, 7, 0.2)',
                                  color: '#ffc107',
                                }}
                              >
                                {warning.message}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!bulkMode && (
                        <Button
                          onClick={() => handleAddExercise(exercise.id)}
                          variant="secondary"
                          className="ml-4"
                        >
                          ➕ Добавить
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка: Выбранные упражнения */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {selectedDayInfo?.label}
                {selectedExercises.length > 0 && (
                  <span className="ml-2 text-lg" style={{ color: 'var(--color-accent)' }}>
                    ({selectedExercises.length})
                  </span>
                )}
              </h2>
              
              {/* Кнопка копирования */}
              {selectedExercises.length > 0 && (
                <div className="relative copy-menu">
                  <Button
                    variant="secondary"
                    onClick={() => setShowCopyMenu(!showCopyMenu)}
                    className="text-sm"
                  >
                    📋 Копировать на другой день
                  </Button>
                  
                  {showCopyMenu && (
                    <div className="absolute right-0 mt-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl z-10 min-w-[200px]">
                      {DAYS_OF_WEEK.filter(d => d.value !== selectedDay).map((day) => (
                        <button
                          key={day.value}
                          onClick={() => handleCopyToDay(day.value)}
                          className="w-full text-left px-4 py-2 hover:bg-[var(--color-card-hover)] transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Статистика суммарного объема */}
            {selectedExercises.length > 0 && (
              <div
                className="mb-4 p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 82, 82, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%)',
                  border: '1px solid rgba(255, 82, 82, 0.2)',
                }}
              >
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  📊 Суммарный объем тренировки
                </div>
                <div className="grid gap-3 text-center" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      {selectedExercises.length}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      упражн.
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      {totalSets}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      подходов
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      {totalVolume}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      повторений
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedExercises.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Добавьте упражнения из списка слева для {selectedDayInfo?.label.toLowerCase()}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {selectedExercises.map((selectedEx, index) => {
                  const exerciseName = getExerciseName(selectedEx.exerciseId);
                  const muscleGroup = getExerciseMuscleGroup(selectedEx.exerciseId);
                  const exercise = exercises.find((e) => e.id === selectedEx.exerciseId);
                  const warning = exercise ? getExerciseWarning(exercise) : { hasWarning: false, message: '', conflicts: [] };
                  
                  return (
                    <div
                      key={selectedEx.exerciseId}
                      className="card p-4 animate-fade-in"
                      style={{ 
                        backgroundColor: 'var(--color-background-secondary)',
                        animationDelay: `${index * 0.05}s`,
                        borderLeft: warning.hasWarning ? '4px solid #ffc107' : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{exerciseName}</h3>
                            {warning.hasWarning && (
                              <span 
                                className="text-base cursor-help"
                                title={warning.message}
                              >
                                ⚠️
                              </span>
                            )}
                          </div>
                          {muscleGroup && (
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                              {getMuscleGroupName(muscleGroup)}
                            </p>
                          )}
                          {warning.hasWarning && (
                            <p className="text-xs mt-1" style={{ color: '#ffc107' }}>
                              {warning.message}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveExercise(selectedEx.exerciseId)}
                          className="p-2 rounded-lg hover:bg-[var(--color-card-hover)] transition-colors ml-2"
                          aria-label="Удалить упражнение"
                          style={{ color: 'var(--color-error)' }}
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Инпуты для подходов и повторений */}
                      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                            Подходы
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={selectedEx.sets}
                            onChange={(e) => handleUpdateExercise(selectedEx.exerciseId, 'sets', parseInt(e.target.value) || 1)}
                            className="input-field w-full text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                            Повторения
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={selectedEx.reps}
                            onChange={(e) => handleUpdateExercise(selectedEx.exerciseId, 'reps', parseInt(e.target.value) || 1)}
                            className="input-field w-full text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Кнопка сохранения */}
          <div className="sticky bottom-0">
            <Button
              onClick={handleSavePlan}
              variant="primary"
              className="w-full text-lg py-4"
            >
              💾 Сохранить план на {selectedDayInfo?.label}
            </Button>
          </div>
        </div>
      </div>

      {/* Модальное окно сохранения пресета */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-card)] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Сохранить пресет</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Название пресета
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Например: 'Грудь + Трицепс'"
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                autoFocus
              />
            </div>
            
            <div className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Будет сохранено {selectedExercises.length} упражнений из текущего плана
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowPresetModal(false);
                  setPresetName('');
                }}
                variant="secondary"
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSavePreset}
                variant="primary"
                className="flex-1"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
