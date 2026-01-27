/**
 * Страница программ тренировок
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { ROUTES } from '../../router/routes';
import Button from '../../components/ui/Button';
import type { WorkoutProgram } from '../../data/models/types';

export default function Programs() {
  const navigate = useNavigate();
  const workoutPrograms = useAppStore((state) => state.workoutPrograms || []);
  const exercises = useAppStore((state) => state.exercises || []);
  const activeClient = useAppStore((state) => state.activeClient);
  const applyWorkoutProgram = useAppStore((state) => state.applyWorkoutProgram);
  const addToast = useAppStore((state) => state.addToast);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);

  // Получить название упражнения по ID
  const getExerciseName = (exerciseId: string): string => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    return exercise?.name || exerciseId;
  };

  // Получить цвет для программы
  const getProgramColor = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'rgba(34, 197, 94, 0.15)',
          border: 'rgba(34, 197, 94, 0.3)',
          accent: '#22c55e',
          gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
        };
      case 'yellow':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.3)',
          accent: '#eab308',
          gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.1) 100%)',
        };
      case 'red':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.3)',
          accent: '#ef4444',
          gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          accent: '#ff5252',
          gradient: 'linear-gradient(135deg, rgba(255, 82, 82, 0.2) 0%, rgba(255, 82, 82, 0.1) 100%)',
        };
    }
  };

  // Получить иконку для уровня сложности
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🔥';
      case 'advanced':
        return '💪';
      default:
        return '📋';
    }
  };

  // Обработчик применения программы
  const handleApplyProgram = (program: WorkoutProgram) => {
    if (!activeClient) {
      addToast({
        type: 'error',
        message: 'Клиент не найден',
      });
      return;
    }

    try {
      applyWorkoutProgram(activeClient.id, program.id);
      addToast({
        type: 'success',
        message: `Программа "${program.title}" успешно применена!`,
      });
      setSelectedProgram(null);
      navigate(ROUTES.CLIENT.MY_PLAN);
    } catch (error) {
      console.error('Error applying program:', error);
      addToast({
        type: 'error',
        message: 'Ошибка при применении программы',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
      {/* Заголовок */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 break-words">Программы тренировок</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Выберите готовую программу тренировок, подходящую вашему уровню подготовки
        </p>
      </div>

      {/* Список программ */}
      <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
        {workoutPrograms.map((program, index) => {
          const colors = getProgramColor(program.color);
          return (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card cursor-pointer hover:scale-[1.02] transition-all duration-300"
              style={{
                background: colors.gradient,
                border: `2px solid ${colors.border}`,
                boxShadow: `0 8px 24px -4px ${colors.accent}40`,
              }}
              onClick={() => setSelectedProgram(program)}
            >
              {/* Заголовок карточки */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold" style={{ color: colors.accent }}>
                    {program.title}
                  </h2>
                  <span className="text-3xl">{getDifficultyIcon(program.difficulty)}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {program.description}
                </p>
              </div>

              {/* Статистика программы */}
              <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Недель
                  </div>
                  <div className="text-xl font-bold" style={{ color: colors.accent }}>
                    {program.weeks}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Тренировок/неделю
                  </div>
                  <div className="text-xl font-bold" style={{ color: colors.accent }}>
                    {program.workoutsPerWeek}
                  </div>
                </div>
              </div>

              {/* Кнопка просмотра */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProgram(program);
                }}
                className="w-full"
                style={{
                  background: colors.accent,
                  color: 'white',
                }}
              >
                Подробнее
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Модальное окно с деталями программы */}
      <AnimatePresence>
        {selectedProgram && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedProgram(null)}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full z-50 max-h-[90vh] overflow-y-auto"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Заголовок модального окна */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold mb-2 break-words" style={{ color: getProgramColor(selectedProgram.color).accent }}>
                      {selectedProgram.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getDifficultyIcon(selectedProgram.difficulty)}</span>
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {selectedProgram.difficulty === 'beginner' && 'Начинающий'}
                        {selectedProgram.difficulty === 'intermediate' && 'Средний'}
                        {selectedProgram.difficulty === 'advanced' && 'Профессионал'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProgram(null)}
                    className="text-2xl hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Описание */}
                <div className="mb-6">
                  <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedProgram.description}
                  </p>
                </div>

                {/* Статистика */}
                <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))' }}>
                  <div
                    className="p-4 rounded-lg text-center"
                    style={{
                      backgroundColor: getProgramColor(selectedProgram.color).bg,
                      border: `1px solid ${getProgramColor(selectedProgram.color).border}`,
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Недель
                    </div>
                    <div className="text-2xl font-bold" style={{ color: getProgramColor(selectedProgram.color).accent }}>
                      {selectedProgram.weeks}
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-lg text-center"
                    style={{
                      backgroundColor: getProgramColor(selectedProgram.color).bg,
                      border: `1px solid ${getProgramColor(selectedProgram.color).border}`,
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Тренировок/неделю
                    </div>
                    <div className="text-2xl font-bold" style={{ color: getProgramColor(selectedProgram.color).accent }}>
                      {selectedProgram.workoutsPerWeek}
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-lg text-center"
                    style={{
                      backgroundColor: getProgramColor(selectedProgram.color).bg,
                      border: `1px solid ${getProgramColor(selectedProgram.color).border}`,
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Упражнений
                    </div>
                    <div className="text-2xl font-bold" style={{ color: getProgramColor(selectedProgram.color).accent }}>
                      {selectedProgram.exercises.length}
                    </div>
                  </div>
                </div>

                {/* Список упражнений */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">Упражнения в программе:</h3>
                  <div className="space-y-2">
                    {selectedProgram.exercises.map((exerciseId, index) => (
                      <div
                        key={exerciseId}
                        className="p-3 rounded-lg flex items-center gap-3"
                        style={{
                          backgroundColor: 'var(--color-background-secondary)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <span className="text-sm font-semibold" style={{ color: getProgramColor(selectedProgram.color).accent }}>
                          {index + 1}.
                        </span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {getExerciseName(exerciseId)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Кнопка применения */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApplyProgram(selectedProgram)}
                    className="flex-1"
                    style={{
                      background: getProgramColor(selectedProgram.color).accent,
                      color: 'white',
                    }}
                  >
                    Начать эту программу
                  </Button>
                  <Button
                    onClick={() => setSelectedProgram(null)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
