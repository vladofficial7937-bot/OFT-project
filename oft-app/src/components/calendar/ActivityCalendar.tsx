/**
 * Умный Календарь Активности - Компактный недельный формат (Week Strip)
 * Отображает текущую неделю с индикаторами тренировок
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { DayOfWeek, WorkoutPlanExercise, Exercise, WorkoutHistoryEntry } from '../../data/models/types';
import { Contraindication } from '../../data/models/types';

interface ActivityCalendarProps {
  clientId?: string;
  weeklyPlan?: Partial<Record<DayOfWeek, WorkoutPlanExercise[] | undefined>>;
  selfOrganizedDays?: DayOfWeek[];
  workoutHistory?: WorkoutHistoryEntry[];
  exercises: Exercise[];
  contraindications?: Contraindication[];
}

interface DayInfo {
  date: Date;
  dayOfWeek: DayOfWeek;
  dayNumber: number;
  dayName: string;
  isToday: boolean;
  hasWorkout: boolean;
  isCompleted: boolean;
  exercises?: WorkoutPlanExercise[];
}

// Названия дней недели (сокращённые)
const DAY_NAMES_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// Номер дня недели -> DayOfWeek
const DAY_NUMBER_TO_DAY_OF_WEEK: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ActivityCalendar({
  weeklyPlan = {},
  selfOrganizedDays: _selfOrganizedDays = [],
  workoutHistory = [],
  exercises: _exercises,
  contraindications: _contraindications = [],
}: ActivityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Используем ref для стабильных ссылок на объекты
  const weeklyPlanRef = useRef(weeklyPlan);
  const workoutHistoryRef = useRef(workoutHistory);
  
  // Создаем стабильные строковые представления для зависимостей
  const weeklyPlanStr = useMemo(() => JSON.stringify(weeklyPlan), [weeklyPlan]);
  const workoutHistoryStr = useMemo(() => 
    JSON.stringify(workoutHistory.map(h => ({ id: h.id, date: h.date }))), 
    [workoutHistory]
  );
  
  // Обновляем ref только если содержимое изменилось
  useEffect(() => {
    weeklyPlanRef.current = weeklyPlan;
  }, [weeklyPlanStr]);
  
  useEffect(() => {
    workoutHistoryRef.current = workoutHistory;
  }, [workoutHistoryStr]);

  // Получить день недели для конкретной даты
  const getDayOfWeekForDate = (date: Date): DayOfWeek => {
    const dayNumber = date.getDay();
    return DAY_NUMBER_TO_DAY_OF_WEEK[dayNumber];
  };

  // Проверить, завершена ли тренировка на конкретную дату
  const isWorkoutCompleted = (date: Date): boolean => {
    const history = workoutHistoryRef.current;
    if (!history || history.length === 0) return false;
    const dateStr = date.toISOString().split('T')[0];
    return history.some((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      const entryDateStr = entryDate.toISOString().split('T')[0];
      return entryDateStr === dateStr;
    });
  };

  // Генерация недели (7 дней, начиная с понедельника текущей недели)
  const weekDays: DayInfo[] = useMemo(() => {
    const days: DayInfo[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Находим понедельник текущей недели
    const currentDay = today.getDay(); // 0 = воскресенье, 1 = понедельник
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Смещение до понедельника
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // Генерируем 7 дней недели
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const dayOfWeek = getDayOfWeekForDate(date);
      const dayExercises = weeklyPlanRef.current[dayOfWeek];
      const hasWorkout = !!dayExercises && dayExercises.length > 0;
      const isCompleted = isWorkoutCompleted(date);
      const dateForComparison = new Date(date);
      dateForComparison.setHours(0, 0, 0, 0);
      const isToday = dateForComparison.getTime() === today.getTime();

      days.push({
        date,
        dayOfWeek,
        dayNumber: date.getDate(),
        dayName: DAY_NAMES_SHORT[date.getDay()],
        isToday,
        hasWorkout,
        isCompleted,
        exercises: dayExercises,
      });
    }

    return days;
    // Используем строковые представления для стабильных зависимостей
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeklyPlanStr, workoutHistoryStr]);

  const selectedDayInfo = useMemo(() => {
    return weekDays.find((d) => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      const sDate = new Date(selectedDate);
      sDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === sDate.getTime();
    });
  }, [selectedDate, weekDays]);

  return (
    <div className="card animate-fade-in min-w-0 overflow-visible">
      {/* Заголовок — компактный */}
      <h2 className="text-base sm:text-lg font-bold mb-2 break-words" style={{ color: '#ffffff' }}>
        Календарь активности
      </h2>

      {/* Недельная полоса — компактная */}
      <div
        className="grid gap-1.5"
        style={{ minHeight: '56px', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
      >
        {weekDays.map((day) => {
          const isSelected = selectedDayInfo &&
            new Date(day.date).getTime() === new Date(selectedDayInfo.date).getTime();
          const hasPlan = day.hasWorkout;
          const bgColor = hasPlan ? 'rgba(255, 0, 0, 0.2)' : 'rgba(34, 197, 94, 0.15)';
          const textColor = hasPlan ? '#ff6b6b' : '#4ade80';
          const borderColor = hasPlan
            ? 'rgba(255, 100, 100, 0.4)'
            : 'rgba(74, 222, 128, 0.3)';

          return (
            <motion.button
              key={day.date.getTime()}
              onClick={() => setSelectedDate(day.date)}
              className="flex flex-col items-center justify-center p-1.5 transition-all duration-200 relative min-w-0"
              style={{
                backgroundColor: isSelected ? (hasPlan ? 'rgba(255, 0, 0, 0.28)' : 'rgba(34, 197, 94, 0.22)') : bgColor,
                border: `1px solid ${isSelected ? (hasPlan ? 'rgba(255, 100, 100, 0.6)' : 'rgba(74, 222, 128, 0.5)') : borderColor}`,
                borderRadius: '12px',
                boxShadow: isSelected
                  ? hasPlan
                    ? '0 0 12px rgba(255, 0, 0, 0.35)'
                    : '0 0 12px rgba(34, 197, 94, 0.35)'
                  : 'none',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className="text-[10px] sm:text-xs font-medium leading-tight"
                style={{ color: textColor }}
              >
                {day.dayName}
              </div>
              <div
                className="text-sm font-bold leading-tight"
                style={{ color: textColor }}
              >
                {day.dayNumber}
              </div>
              {day.hasWorkout && (
                <div
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{
                    backgroundColor: day.isCompleted ? '#22c55e' : '#ff6b6b',
                  }}
                  title={day.isCompleted ? 'Тренировка завершена' : 'Тренировка назначена'}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
