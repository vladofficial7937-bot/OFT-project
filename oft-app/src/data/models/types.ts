/**
 * Типы и интерфейсы для OFT (Онлайн Фитнес Тренер)
 */

// ============================================
// Enums (as const для erasableSyntaxOnly)
// ============================================

/** Группы мышц */
export const MuscleGroup = {
  Chest: 'Chest',
  Back: 'Back',
  Legs: 'Legs',
  Shoulders: 'Shoulders',
  Arms: 'Arms',
  Core: 'Core',
} as const;
export type MuscleGroup = (typeof MuscleGroup)[keyof typeof MuscleGroup];

/** Цели клиента */
export const ClientGoal = {
  WeightLoss: 'weight_loss',
  MuscleGain: 'muscle_gain',
  Endurance: 'endurance',
  Strength: 'strength',
} as const;
export type ClientGoal = (typeof ClientGoal)[keyof typeof ClientGoal];

/** Доступное оборудование */
export const Equipment = {
  Gym: 'gym',
  Home: 'home',
} as const;
export type Equipment = (typeof Equipment)[keyof typeof Equipment];

/** Противопоказания (проблемы со здоровьем) */
export const Contraindication = {
  Back: 'back',
  Knees: 'knees',
  Shoulders: 'shoulders',
  Wrists: 'wrists',
  Neck: 'neck',
  Heart: 'heart',
} as const;
export type Contraindication = (typeof Contraindication)[keyof typeof Contraindication];

// ============================================
// Общие типы
// ============================================

/**
 * Уровень подготовки
 */
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================
// Основные интерфейсы
// ============================================

/** Уровень сложности упражнения (для умного генератора) */
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Упражнение
 */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  videoUrl?: string;
  description: string;
  avoidIf?: Contraindication[]; // Противопоказания - при каких проблемах избегать
  equipment?: string[]; // Необходимое оборудование (например: ["гантели", "скамья"])
  /** Уровень сложности для подбора в генераторе */
  difficulty?: ExerciseDifficulty;
  /** Высокая осевая нагрузка (присед, становая) — для новичков заменяем на альтернативы */
  highAxialLoad?: boolean;
}

/**
 * Упражнение в плане тренировки
 */
export interface WorkoutPlanExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  createdBy?: string; // ID пользователя, который добавил упражнение (клиент или тренер)
  createdAt?: string; // ISO дата создания
}

/**
 * План тренировок (старая структура, для обратной совместимости)
 */
export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  exercises: WorkoutPlanExercise[];
}

/**
 * Программа тренировок
 */
export interface WorkoutProgram {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  weeks: number; // Продолжительность программы в неделях
  workoutsPerWeek: number; // Количество тренировок в неделю
  exercises: string[]; // Массив ID упражнений
  color: string; // Цвет для UI (green, yellow, red)
}

/**
 * День недели
 */
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

/**
 * Недельный план тренировок
 * Ключи - дни недели, значения - массивы упражнений для каждого дня
 */
export interface WeeklyPlan {
  Mon?: WorkoutPlanExercise[];
  Tue?: WorkoutPlanExercise[];
  Wed?: WorkoutPlanExercise[];
  Thu?: WorkoutPlanExercise[];
  Fri?: WorkoutPlanExercise[];
  Sat?: WorkoutPlanExercise[];
  Sun?: WorkoutPlanExercise[];
}

/**
 * Клиент тренера
 */
export interface Client {
  id: string;
  name: string;
  age: number;
  goal: ClientGoal;
  equipment: Equipment;
  currentPlanId?: string; // Для обратной совместимости
  weeklyPlan?: WeeklyPlan; // Новая структура недельного плана
  photoUrl?: string;
  completedWorkouts?: WorkoutSession[]; // Упрощенная история (для обратной совместимости)
  workoutHistory?: WorkoutHistoryEntry[]; // Полная история тренировок с деталями
  telegramId?: string; // ID пользователя в Telegram
  telegramUsername?: string; // Username пользователя в Telegram
  isTelegramLinked?: boolean; // Флаг привязки Telegram аккаунта
  contraindications?: Contraindication[]; // Противопоказания клиента (проблемы со здоровьем)
  selfOrganizedDays?: DayOfWeek[]; // Дни недели, которые клиент составил сам
  isFirstLogin?: boolean; // Флаг первого входа (нужен ли онбординг)
  fitnessLevel?: FitnessLevel; // Уровень подготовки
  /** @deprecated используйте fitnessLevel */
  level?: FitnessLevel;
  createdAt?: string; // ISO date
  notes?: string; // Заметки тренера о клиенте
  workoutDaysPerWeek?: number; // Количество тренировочных дней в неделю
  workoutDurationMinutes?: number; // Продолжительность тренировки в минутах
  /** ID тренера (username) после принятия заявки */
  assignedTrainerId?: string;
}

/** Статус заявки на персональные тренировки */
export type CoachingRequestStatus = 'pending' | 'accepted' | 'rejected';

/** Заявка клиента к тренеру */
export interface CoachingRequest {
  id: string;
  clientId: string;
  trainerId: string;
  status: CoachingRequestStatus;
  createdAt: string;
}

/** Тренер в каталоге (для выбора клиентом) */
export interface TrainerProfile {
  id: string;
  username: string;
  bio?: string;
  age?: number;
  photoUrl?: string;
  specializations?: string[]; // Например: ['силовой тренинг', 'похудение', 'кроссфит']
}

/**
 * Тренер
 */
export interface Trainer {
  id: string;
  name: string;
  clients: string[]; // Array of Client IDs
}

// ============================================
// Дополнительные интерфейсы (для обратной совместимости)
// ============================================

/**
 * Группа мышц (интерфейс для расширенных данных)
 */
export interface MuscleGroupInfo {
  id: string;
  name: string; // Например: "Грудь", "Спина", "Ноги"
  nameEn: string; // Для внутренних операций (например: "chest", "back", "legs")
}

/**
 * Запланированное упражнение в рамках дня тренировки
 */
export interface PlannedExercise {
  exerciseId: string;
  setsReps: string;
  notes?: string;
}

/**
 * День тренировки в плане
 */
export interface WorkoutDay {
  dayNumber: number; // 1-7
  name: string; // Например: "День 1: Грудь + Трицепс"
  exercises: PlannedExercise[];
}

/**
 * Расширенный план тренировок для клиента
 */
export interface ExtendedWorkoutPlan {
  id: string;
  clientId: string;
  days: WorkoutDay[];
  createdAt: string; // ISO date
}

// ============================================
// Выполненные тренировки
// ============================================

/**
 * Результат одного подхода
 */
export interface SetResult {
  reps: number;
  weight?: number;
  completed: boolean;
}

/**
 * Выполненное упражнение
 */
export interface CompletedExercise {
  exerciseId: string;
  sets: SetResult[];
  completed: boolean;
}

/**
 * Сессия тренировки (выполненная тренировка) - упрощенная версия
 */
export interface WorkoutSession {
  id: string;
  date: string; // ISO date
  exercisesCount: number;
  totalSets: number;
  workoutName: string;
  completed?: boolean; // Флаг завершения тренировки
}

/**
 * Упражнение в истории тренировки (с названием для отображения)
 */
export interface WorkoutHistoryExercise {
  title: string;         // Название упражнения
  sets: string;          // Количество подходов (строка для гибкости)
  reps: string;          // Количество повторений (строка для гибкости)
  weight?: string;       // Вес (опционально)
}

/**
 * Настроение после тренировки
 */
export type WorkoutMood = 'strong' | 'good' | 'normal' | 'tired' | 'exhausted';

/**
 * Запись в истории тренировок клиента
 */
export interface WorkoutHistoryEntry {
  id: string;
  date: string;          // ISO date
  workoutName: string;   // Название тренировки (день недели или кастомное)
  dayOfWeek: DayOfWeek;  // День недели
  exercises: WorkoutHistoryExercise[];
  mood?: WorkoutMood;    // Настроение после тренировки
  duration?: number;     // Продолжительность в минутах
  notes?: string;        // Заметки клиента
}

// Все типы экспортируются при определении выше (export interface / export type / export const)
