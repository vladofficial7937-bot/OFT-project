/**
 * Краткая статистика прогресса клиента
 */

import { useState } from 'react';
import type { CompletedExercise } from '../../data/models';
import type { WorkoutSessionWithDetails } from '../client/WorkoutHistoryItem';

interface ClientProgressSummaryProps {
  sessions: WorkoutSessionWithDetails[];
}

export default function ClientProgressSummary({
  sessions,
}: ClientProgressSummaryProps) {
  const [showAll, setShowAll] = useState(false);

  if (sessions.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-4xl mb-3">📊</p>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Клиент ещё не выполнил ни одной тренировки
        </p>
      </div>
    );
  }

  const totalWorkouts = sessions.length;
  const completedWorkouts = sessions.filter((s) => s.completed).length;
  const completionRate = Math.round((completedWorkouts / totalWorkouts) * 100);

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastSession = sortedSessions[0];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const visibleSessions = showAll ? sortedSessions : sortedSessions.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Статистика */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 90px), 1fr))' }}>
        <div className="card text-center">
          <p
            className="text-xl sm:text-3xl font-bold mb-1 break-words"
            style={{ color: 'var(--color-accent)' }}
          >
            {totalWorkouts}
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Всего
          </p>
        </div>

        <div className="card text-center">
          <p
            className="text-xl sm:text-3xl font-bold mb-1 break-words"
            style={{ color: 'var(--color-accent)' }}
          >
            {formatDate(lastSession.date)}
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Последняя
          </p>
        </div>

        <div className="card text-center">
          <p
            className="text-xl sm:text-3xl font-bold mb-1 break-words"
            style={{ color: 'var(--color-accent)' }}
          >
            {completionRate}%
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Завершено
          </p>
        </div>
      </div>

      {/* История */}
      <div className="card">
        <h3 className="font-semibold mb-3">Последние тренировки</h3>

        <div className="space-y-2">
          {visibleSessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2"
              style={{
                borderBottom:
                  index < visibleSessions.length - 1
                    ? '1px solid var(--color-border)'
                    : 'none',
              }}
            >
              <div>
                <p className="text-sm font-semibold">
                  {session.completed ? '✅' : '⚠️'}{' '}
                  {session.planDayNumber != null ? `День ${session.planDayNumber}` : session.workoutName}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {formatDate(session.date)}
                </p>
              </div>

              <p
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {(session.exercises ?? []).filter((e: CompletedExercise) => e.completed).length} /{' '}
                {(session.exercises ?? []).length}
              </p>
            </div>
          ))}
        </div>

        {sortedSessions.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-secondary w-full mt-3 text-sm"
          >
            {showAll
              ? 'Показать меньше'
              : `Показать ещё ${sortedSessions.length - 5}`}
          </button>
        )}
      </div>
    </div>
  );
}
