/**
 * Компонент одного упражнения в чек-листе тренировки
 */

import { Link } from 'react-router-dom';
import type { Exercise, PlannedExercise, SetResult } from '../../data/models';
import SetInputForm from './SetInputForm';

interface ExerciseChecklistItemProps {
  plannedExercise: PlannedExercise;
  exercise: Exercise;
  index: number;
  isExpanded: boolean;
  completedData?: {
    sets: SetResult[];
    completed: boolean;
  };
  onExpand: () => void;
  onSave: (sets: SetResult[]) => void;
}

export default function ExerciseChecklistItem({
  plannedExercise,
  exercise,
  index,
  isExpanded,
  completedData,
  onExpand,
  onSave,
}: ExerciseChecklistItemProps) {
  const isCompleted = completedData?.completed || false;
  const isInProgress = completedData && !completedData.completed;

  // Парсинг целевых подходов (например "3x12" → { sets: 3, reps: 12 })
  const parseTarget = (setsReps: string) => {
    const match = setsReps.match(/(\d+)\s*x\s*(\d+)/);
    if (match) {
      return { sets: parseInt(match[1]), reps: parseInt(match[2]) };
    }
    return { sets: 3, reps: 10 }; // default
  };

  const target = parseTarget(plannedExercise.setsReps);

  return (
    <div
      className={`card mb-4 transition-all ${
        isCompleted
          ? 'border-green-500 bg-green-500/10'
          : isInProgress
          ? 'border-yellow-500 bg-yellow-500/10'
          : ''
      }`}
      style={{
        borderColor: isCompleted
          ? 'var(--color-success)'
          : isInProgress
          ? 'var(--color-warning)'
          : 'var(--color-border)',
        backgroundColor: isCompleted
          ? 'rgba(74, 222, 128, 0.1)'
          : isInProgress
          ? 'rgba(251, 191, 36, 0.1)'
          : undefined,
      }}
    >
      {/* ШАПКА УПРАЖНЕНИЯ */}
      <div className="flex items-start gap-4">
        {/* Номер и статус */}
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              isCompleted
                ? 'bg-green-500 text-white'
                : isInProgress
                ? 'bg-yellow-500 text-white'
                : ''
            }`}
            style={{
              backgroundColor: isCompleted
                ? 'var(--color-success)'
                : isInProgress
                ? 'var(--color-warning)'
                : 'var(--color-card)',
              border: isCompleted || isInProgress ? 'none' : '2px solid var(--color-border)',
              color: isCompleted || isInProgress ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            {isCompleted ? '✓' : index + 1}
          </div>
        </div>

        {/* Информация */}
        <div className="flex-1">
          <Link
            to={`/client/exercises/${exercise.id}`}
            className="text-lg font-semibold hover:opacity-70 transition-opacity block"
            style={{ color: 'var(--color-accent)' }}
          >
            {exercise.name}
          </Link>

          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Цель: {plannedExercise.setsReps}
          </p>

          {completedData && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-success)' }}>
              Выполнено: {completedData.sets.filter((s) => s.completed).length} подходов
            </p>
          )}
        </div>

        {/* Кнопка раскрытия */}
        <button onClick={onExpand} className="btn-secondary px-4 py-2">
          {isExpanded ? 'Свернуть' : 'Записать'}
        </button>
      </div>

      {/* ФОРМА ПОДХОДОВ (раскрывается) */}
      {isExpanded && (
        <SetInputForm
          targetSets={target.sets}
          targetReps={target.reps}
          initialSets={completedData?.sets || []}
          onSave={onSave}
          onCancel={onExpand}
        />
      )}
    </div>
  );
}
