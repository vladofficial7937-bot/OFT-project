/**
 * Вспомогательные функции для работы с датами
 */

import type { WorkoutSession } from '../data/models';

/**
 * Проверяет, находится ли дата в текущей неделе
 */
export function isThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  return date >= weekStart;
}

/**
 * Вычисляет текущую серию (streak) тренировок подряд
 */
export function calculateStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;

  // Получить уникальные даты тренировок
  const uniqueDates = Array.from(
    new Set(sessions.map((s) => new Date(s.date).toDateString()))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // Проверяем есть ли тренировка сегодня или вчера
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  // Считаем серию
  let checkDate = new Date();
  for (const dateStr of uniqueDates) {
    const sessionDate = new Date(dateStr);
    const diffDays = Math.floor(
      (checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) {
      streak++;
      checkDate = sessionDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Форматирует дату тренировки для отображения
 */
export function formatWorkoutDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
