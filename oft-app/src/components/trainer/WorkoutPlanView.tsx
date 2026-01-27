/**
 * Отображение плана тренировок клиента
 */

import { useState } from 'react';
import type { WorkoutPlan, WorkoutDay, PlannedExercise, Exercise } from '../../data/models';

interface WorkoutPlanViewProps {
  plan: WorkoutPlan & { days?: WorkoutDay[]; createdAt?: string };
  exercises: Exercise[];
}

export default function WorkoutPlanView({
  plan,
  exercises,
}: WorkoutPlanViewProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Информация о плане */}
      <div
        className="card p-4"
        style={{
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          borderColor: 'rgba(255, 68, 68, 0.3)',
        }}
      >
        <h3 className="font-semibold mb-2">Информация о плане</h3>
        <p
          className="text-sm mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Создан: {plan.createdAt ? formatDate(plan.createdAt) : '—'}
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Дней в неделю: {plan.days?.length ?? 0}
        </p>
      </div>

      {/* Дни тренировки */}
      <div className="space-y-3">
        {(plan.days ?? []).map((day: WorkoutDay, index: number) => (
          <div
            key={day.dayNumber}
            className="card animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Заголовок дня */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                setExpandedDay(expandedDay === day.dayNumber ? null : day.dayNumber)
              }
            >
              <div className="flex-1">
                <h4 className="font-semibold">{day.name}</h4>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {day.exercises.length} упражнений
                </p>
              </div>

              <button style={{ color: 'var(--color-accent)' }}>
                {expandedDay === day.dayNumber ? '▲' : '▼'}
              </button>
            </div>

            {/* Список упражнений */}
            {expandedDay === day.dayNumber && (
              <div
                className="mt-4 pt-4 space-y-2"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                {day.exercises.map((plannedEx: PlannedExercise, exIndex: number) => {
                  const exercise = exercises.find((e) => e.id === plannedEx.exerciseId);
                  if (!exercise) return null;

                  return (
                    <div
                      key={exIndex}
                      className="flex items-start gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <span
                        className="font-semibold flex-shrink-0"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {exIndex + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold">{exercise.name}</p>
                        <p
                          className="text-sm"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {plannedEx.setsReps}
                        </p>
                        {plannedEx.notes && (
                          <p
                            className="text-xs italic mt-1"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {plannedEx.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-3">
        <button
          className="btn-secondary flex-1 opacity-50 cursor-not-allowed"
          disabled
          title="Скоро появится возможность редактирования"
        >
          Редактировать план
        </button>
        <button
          className="btn-secondary flex-1 opacity-50 cursor-not-allowed"
          disabled
          title="Скоро: ИИ-генерация плана"
        >
          Создать новый план
        </button>
      </div>
    </div>
  );
}
