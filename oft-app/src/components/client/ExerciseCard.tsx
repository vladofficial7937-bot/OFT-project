/**
 * Карточка упражнения
 * Использует новые типы из useAppStore
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Exercise, DayOfWeek, WorkoutPlanExercise } from '../../data/models/types';
import { MuscleGroup, Contraindication } from '../../data/models/types';
import { ROUTES } from '../../router/routes';
import Button from '../ui/Button';
import { useAppStore } from '../../store/useAppStore';

interface ExerciseCardProps {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: ExerciseCardProps) {
  const navigate = useNavigate();
  const activeClient = useAppStore((state) => state.activeClient);
  const addClientWorkoutExercise = useAppStore((state) => state.addClientWorkoutExercise);
  const addToast = useAppStore((state) => state.addToast);
  
  // Состояние для модального окна добавления в план
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Mon');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);

  // Дни недели для выбора
  const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
    { value: 'Mon', label: 'Понедельник' },
    { value: 'Tue', label: 'Вторник' },
    { value: 'Wed', label: 'Среда' },
    { value: 'Thu', label: 'Четверг' },
    { value: 'Fri', label: 'Пятница' },
    { value: 'Sat', label: 'Суббота' },
    { value: 'Sun', label: 'Воскресенье' },
  ];

  // Название группы мышц
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

  // Названия противопоказаний для отображения
  const getContraindicationLabel = (contra: Contraindication): string => {
    const labels: Record<Contraindication, string> = {
      [Contraindication.Back]: 'Спина',
      [Contraindication.Knees]: 'Колени',
      [Contraindication.Shoulders]: 'Плечи',
      [Contraindication.Wrists]: 'Запястья',
      [Contraindication.Neck]: 'Шея',
      [Contraindication.Heart]: 'Сердце',
    };
    return labels[contra] || contra;
  };

  // Проверка, есть ли конфликты с противопоказаниями клиента
  const getExerciseWarning = (): { hasWarning: boolean; conflicts: Contraindication[]; message: string } => {
    const clientContraindications = activeClient?.contraindications || [];
    const conflicts = exercise.avoidIf?.filter((c) => clientContraindications.includes(c)) || [];
    
    if (conflicts.length > 0) {
      const conflictLabels = conflicts.map((c) => getContraindicationLabel(c)).join(', ');
      return {
        hasWarning: true,
        conflicts,
        message: `Не рекомендуется при вашей травме (${conflictLabels})`,
      };
    }
    
    return { hasWarning: false, conflicts: [], message: '' };
  };

  const warning = getExerciseWarning();

  // Цвет для группы мышц
  const getMuscleGroupColor = (muscleGroup: MuscleGroup): string => {
    const colors: Record<MuscleGroup, string> = {
      [MuscleGroup.Chest]: '#ff4444',
      [MuscleGroup.Back]: '#3b82f6',
      [MuscleGroup.Legs]: '#22c55e',
      [MuscleGroup.Shoulders]: '#f59e0b',
      [MuscleGroup.Arms]: '#a855f7',
      [MuscleGroup.Core]: '#06b6d4',
    };
    return colors[muscleGroup] || 'var(--color-accent)';
  };

  const handleClick = () => {
    navigate(ROUTES.CLIENT.EXERCISE_DETAIL(exercise.id));
  };

  // Добавить упражнение в план клиента
  const handleAddToPlan = () => {
    if (!activeClient) {
      addToast({
        type: 'error',
        message: 'Необходимо авторизоваться',
      });
      return;
    }

    const workoutExercise: WorkoutPlanExercise = {
      exerciseId: exercise.id,
      sets,
      reps,
    };

    addClientWorkoutExercise(activeClient.id, selectedDay, workoutExercise);
    
    // Хаптическая отдача
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    addToast({
      type: 'success',
      message: `Упражнение добавлено в план на ${DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label}`,
    });

    setShowAddModal(false);
  };

  const muscleColor = getMuscleGroupColor(exercise.muscleGroup);

  return (
    <motion.div 
      className="card-hover group relative overflow-hidden h-full flex flex-col min-w-0"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Предупреждение оверлей */}
      {warning.hasWarning && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{
            background: 'rgba(255, 87, 34, 0.15)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-center shadow-lg max-w-[90%]">
            <div className="text-2xl mb-1">⚠️</div>
            <div className="text-xs font-semibold">{warning.message}</div>
          </div>
        </div>
      )}

      {/* Изображение упражнения (реальное фото по muscle group + id) или видео-оверлей */}
      <div
        className="aspect-video w-full mb-4 rounded-lg overflow-hidden relative bg-gradient-to-br from-[var(--color-card-hover)] to-[var(--color-background)]"
        style={{
          background: `linear-gradient(135deg, ${muscleColor}20 0%, var(--color-card-hover) 100%)`,
        }}
      >
        <img
          src={`https://picsum.photos/seed/${exercise.muscleGroup}-${exercise.id}/400/225`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {exercise.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: 'rgba(255,0,0,0.9)', boxShadow: '0 0 20px rgba(255,0,0,0.5)' }}>
              ▶️
            </div>
          </div>
        )}
        {/* Badge группы мышц */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${muscleColor} 0%, ${muscleColor}dd 100%)`,
            boxShadow: `0 2px 8px ${muscleColor}40`,
          }}
        >
          {getMuscleGroupName(exercise.muscleGroup)}
        </div>
        {/* Иконка предупреждения в углу */}
        {warning.hasWarning && (
          <div
            className="absolute top-3 right-3 px-2 py-1 rounded-full text-white text-lg"
            style={{
              background: 'rgba(255, 87, 34, 0.9)',
              boxShadow: '0 2px 8px rgba(255, 87, 34, 0.5)',
            }}
            title={warning.message}
          >
            ⚠️
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Название */}
        <div className="flex items-start gap-2 mb-3 min-w-0">
          <h3 className="font-bold text-lg sm:text-xl flex-1 min-w-0 group-hover:text-[var(--color-accent)] transition-colors duration-300 line-clamp-2 break-words">
            {exercise.name}
          </h3>
          {warning.hasWarning && (
            <span 
              className="text-xl flex-shrink-0 cursor-help"
              title={warning.message}
            >
              ⚠️
            </span>
          )}
        </div>
        
        {/* Предупреждение под названием */}
        {warning.hasWarning && (
          <div 
            className="mb-3 px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: 'rgba(255, 87, 34, 0.1)',
              color: '#ff5722',
              border: '1px solid rgba(255, 87, 34, 0.3)',
            }}
          >
            {warning.message}
          </div>
        )}

        {/* Описание */}
        <p
          className="text-sm mb-4 flex-1 line-clamp-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {exercise.description}
        </p>

        {/* Кнопки действий */}
        <div className="flex gap-2 mt-auto">
          <Button
            onClick={handleClick}
            variant="secondary"
            className="flex-1"
          >
            Подробнее →
          </Button>
          
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            className="flex-1"
          >
            ➕ В мой план
          </Button>
        </div>
      </div>

      {/* Индикатор hover */}
      <div
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0"
        style={{ color: muscleColor }}
      >
        <span className="text-2xl">→</span>
      </div>

      {/* Модальное окно добавления в план */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-[var(--color-card)] rounded-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-xl font-bold mb-4">Добавить в план</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {exercise.name}
            </p>
            
            {/* Выбор дня */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Выберите день
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Параметры упражнения */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Подходы
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sets}
                  onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border text-center font-bold"
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Повторения
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border text-center font-bold"
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>
            
            {/* Кнопки */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleAddToPlan}
                variant="primary"
                className="flex-1"
              >
                Добавить
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
