/**
 * Компонент элемента истории тренировок
 */

import { useState } from 'react';
import type { WorkoutSession, CompletedExercise, Exercise } from '../../data/models';
import { formatWorkoutDate } from '../../utils/dateHelpers';

/** Сессия с деталями упражнений (для отображения в истории) */
export interface WorkoutSessionWithDetails extends WorkoutSession {
  exercises?: CompletedExercise[];
  planDayNumber?: number;
}

interface WorkoutHistoryItemProps {
  session: WorkoutSessionWithDetails;
  exercises: Exercise[];
  workoutName?: string;
}

export default function WorkoutHistoryItem({
  session,
  exercises,
  workoutName,
}: WorkoutHistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sessionExercises = session.exercises ?? [];
  const completedCount = sessionExercises.filter((ex: CompletedExercise) => ex.completed).length;
  const totalCount = sessionExercises.length;
  const isFullyCompleted = session.completed ?? false;

  return (
    <div
      className={`card mb-3 border-l-4 animate-fade-in ${
        isFullyCompleted ? 'border-l-green-500' : 'border-l-yellow-500'
      }`}
      style={{
        borderLeftColor: isFullyCompleted
          ? 'var(--color-success)'
          : 'var(--color-warning)',
      }}
    >
      {/* ШАПКА */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">
              {isFullyCompleted ? '✅' : '⚠️'}
            </span>
            <h4 className="font-semibold">{workoutName ?? (session.planDayNumber != null ? `День ${session.planDayNumber}` : session.workoutName)}</h4>
          </div>

          <p
            className="text-sm mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {formatWorkoutDate(session.date)}
          </p>

          <p className="text-sm">
            <span
              style={{
                color: isFullyCompleted
                  ? 'var(--color-success)'
                  : 'var(--color-warning)',
              }}
            >
              {completedCount} из {totalCount} упражнений
            </span>
          </p>
        </div>

        <button
          className="text-sm hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-accent)' }}
        >
          {isExpanded ? 'Свернуть ▲' : 'Детали ▼'}
        </button>
      </div>

      {/* ДЕТАЛИ (раскрывается) */}
      {isExpanded && (
        <div
          className="mt-4 pt-4 space-y-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          {sessionExercises.map((completedEx: CompletedExercise, index: number) => {
            const exercise = exercises.find((e) => e.id === completedEx.exerciseId);
            if (!exercise) return null;

            return (
              <div
                key={index}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <h5 className="font-semibold mb-2 flex items-center gap-2">
                  {completedEx.completed ? (
                    <span style={{ color: 'var(--color-success)' }}>✓</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)' }}>○</span>
                  )}
                  {exercise.name}
                </h5>

                {completedEx.sets.length > 0 && (
                  <div
                    className="space-y-1 text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {completedEx.sets.map((set, setIndex: number) => (
                      <div key={setIndex} className="flex items-center gap-2">
                        <span className="w-20">Подход {setIndex + 1}:</span>
                        <span
                          style={{
                            color: set.completed
                              ? 'var(--color-text-primary)'
                              : 'var(--color-text-secondary)',
                          }}
                        >
                          {set.reps} повторений
                          {set.weight && ` × ${set.weight} кг`}
                          {set.completed && (
                            <span style={{ color: 'var(--color-success)' }}> ✓</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {completedEx.sets.length === 0 && (
                  <p
                    className="text-sm italic"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Подходы не записаны
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
