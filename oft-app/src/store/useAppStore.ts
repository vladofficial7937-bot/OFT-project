/**
 * Глобальный стейт приложения OFT используя Zustand
 * Использует типы из ../data/models/types
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client, Exercise, WorkoutPlan, WeeklyPlan, DayOfWeek, WorkoutPlanExercise, WorkoutSession, WorkoutHistoryEntry, WorkoutMood, WorkoutProgram } from '../data/models/types';
import type { FitnessLevel } from '../data/models/types';
import { MuscleGroup, Contraindication, ClientGoal, Equipment } from '../data/models/types';

// ============================================
// Типы
// ============================================

type UserMode = 'trainer' | 'client' | null;

/** Оборудование для генератора: зал / дом / только турники */
export type GeneratorEquipment = 'gym' | 'home' | 'pullup_only';

/** Входные данные для умного генератора тренировок */
export interface GenerateWorkoutPreferences {
  muscleGroups: MuscleGroup[];
  durationMinutes: number;
  equipment: GeneratorEquipment;
}

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface AppState {
  // Состояние
  userMode: UserMode;
  clients: Client[];
  exercises: Exercise[];
  activeClient: Client | null;
  workoutPlans: WorkoutPlan[]; // Планы тренировок
  workoutPrograms: WorkoutProgram[]; // Программы тренировок
  toasts: ToastData[]; // Toast уведомления
  isAuthPending: boolean; // Состояние ожидания авторизации через Telegram
  isAuthenticated: boolean; // Флаг авторизации пользователя
}

interface AppActions {
  // Действия
  setMode: (mode: UserMode) => void;
  addClient: (client: Client) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void; // Обновить данные клиента
  selectClient: (clientId: string) => void;
  deleteClient: (id: string) => void;
  updateClientPlan: (clientId: string, plan: WorkoutPlan) => void; // Старый метод для обратной совместимости
  updateWeeklyPlan: (clientId: string, dayOfWeek: DayOfWeek, exercises: WorkoutPlanExercise[], selfOrganized?: boolean) => void;
  addClientWorkoutExercise: (clientId: string, dayOfWeek: DayOfWeek, exercise: WorkoutPlanExercise) => void; // Добавить упражнение в план клиента
  removeClientWorkoutExercise: (clientId: string, dayOfWeek: DayOfWeek, exerciseId: string) => void; // Удалить упражнение из плана клиента
  updateClientContraindications: (clientId: string, contraindications: Contraindication[]) => void; // Обновить противопоказания клиента
  getClientSelfOrganizedDays: (clientId: string) => DayOfWeek[]; // Получить дни, составленные клиентом самостоятельно
  getTodayWorkout: (clientId: string) => WorkoutPlanExercise[] | null;
  completeWorkout: (clientId: string, workoutData: WorkoutSession) => void;
  completeWorkoutWithHistory: (clientId: string, mood?: WorkoutMood, notes?: string, duration?: number) => void; // Расширенная версия
  getClientWorkoutHistory: (clientId: string) => WorkoutHistoryEntry[]; // Получить историю тренировок клиента
  getAllClientsActivity: () => Array<{ clientName: string; clientId: string; workout: WorkoutSession }>;
  loadInitialData: () => void;
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllData: () => void; // Очистка всех данных
  bindTelegram: (clientId: string, telegramId: string, telegramUsername: string) => void; // Привязка Telegram аккаунта
  linkTelegram: (clientId: string, username: string) => void; // Привязка Telegram аккаунта (упрощенная версия)
  unlinkTelegram: (clientId: string) => void; // Отвязка Telegram аккаунта
  sendTelegramNotification: (clientId: string, message: string) => void; // Имитация отправки уведомления в Telegram
  setAuthPending: (pending: boolean) => void; // Установить состояние ожидания авторизации
  setAuthenticated: (user: { id: string; name: string; telegramId?: string }) => void; // Завершить авторизацию
  loginViaTelegram: (tgUser: { id: string; firstName: string; lastName?: string; username?: string; photoUrl?: string; authDate: number; hash: string }) => { isNewUser: boolean; client: Client }; // Авторизация через Telegram Widget
  loginWithoutAuth: () => { isNewUser: boolean; client: Client }; // Вход без авторизации (демо-режим)
  logout: () => void; // Выход из системы
  applyWorkoutProgram: (clientId: string, programId: string) => void; // Применить программу тренировок к клиенту
  generateWorkout: (preferences: GenerateWorkoutPreferences) => WorkoutPlanExercise[]; // Умный генератор по анкете клиента
  pickAlternativeForSlot: (preferences: GenerateWorkoutPreferences, excludeExerciseId: string, forMuscleGroup: MuscleGroup) => WorkoutPlanExercise | null; // Замена одного упражнения в сгенерированной тренировке
}

type AppStore = AppState & AppActions;

// ============================================
// Начальные данные - заглушки для упражнений
// ============================================

/**
 * Начальный набор упражнений - минимум 2 на каждую группу мышц
 */
const initialExercises: Exercise[] = [
  // Грудь
  {
    id: 'ex-chest-1',
    name: 'Жим лежа',
    muscleGroup: MuscleGroup.Chest,
    description: 'Базовое упражнение для развития мышц груди. Выполняется лежа на скамье со штангой или гантелями.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Shoulders, Contraindication.Wrists],
    equipment: ['штанга', 'скамья'],
    difficulty: 'intermediate',
  },
  {
    id: 'ex-chest-2',
    name: 'Отжимания',
    muscleGroup: MuscleGroup.Chest,
    description: 'Классическое упражнение с собственным весом для грудных мышц, трицепсов и передних дельт.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Wrists, Contraindication.Shoulders],
    equipment: [],
    difficulty: 'beginner',
  },
  // Спина
  {
    id: 'ex-back-1',
    name: 'Подтягивания',
    muscleGroup: MuscleGroup.Back,
    description: 'Базовое упражнение для широчайших, бицепсов и задних дельт. Выполняется на турнике.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Shoulders],
    equipment: ['турник'],
    difficulty: 'intermediate',
  },
  {
    id: 'ex-back-2',
    name: 'Тяга блока',
    muscleGroup: MuscleGroup.Back,
    description: 'Изолирующее упражнение для широчайших. Выполняется на блочном тренажере.',
    videoUrl: undefined,
    equipment: ['блочный тренажер'],
    difficulty: 'beginner',
  },
  {
    id: 'ex-back-3',
    name: 'Становая тяга',
    muscleGroup: MuscleGroup.Back,
    description: 'Базовое упражнение с высокой осевой нагрузкой. Развивает спину, ягодицы и бицепсы бедра.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Back, Contraindication.Knees],
    equipment: ['штанга'],
    difficulty: 'advanced',
    highAxialLoad: true,
  },
  // Ноги
  {
    id: 'ex-legs-1',
    name: 'Приседания со штангой',
    muscleGroup: MuscleGroup.Legs,
    description: 'Король упражнений для ног и ягодиц. Высокая осевая нагрузка.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Knees, Contraindication.Back],
    equipment: ['штанга'],
    difficulty: 'advanced',
    highAxialLoad: true,
  },
  {
    id: 'ex-legs-2',
    name: 'Выпады',
    muscleGroup: MuscleGroup.Legs,
    description: 'Унилатеральное упражнение для квадрицепсов, ягодиц и бицепсов бедра.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Knees],
    equipment: ['гантели'],
    difficulty: 'beginner',
  },
  {
    id: 'ex-legs-3',
    name: 'Жим ногами',
    muscleGroup: MuscleGroup.Legs,
    description: 'Альтернатива приседаниям с меньшей осевой нагрузкой. Безопаснее для новичков и при проблемах со спиной.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Knees],
    equipment: ['тренажер'],
    difficulty: 'beginner',
  },
  // Плечи
  {
    id: 'ex-shoulders-1',
    name: 'Жим стоя (Армейский жим)',
    muscleGroup: MuscleGroup.Shoulders,
    description: 'Базовое упражнение для дельт. Нагрузка на плечи, спину и шею.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Shoulders, Contraindication.Back, Contraindication.Neck],
    equipment: ['штанга', 'гантели'],
    difficulty: 'advanced',
  },
  {
    id: 'ex-shoulders-2',
    name: 'Махи гантелями в стороны',
    muscleGroup: MuscleGroup.Shoulders,
    description: 'Изолирующее упражнение для средних пучков дельт.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Shoulders],
    equipment: ['гантели'],
    difficulty: 'beginner',
  },
  {
    id: 'ex-shoulders-3',
    name: 'Подъём рук перед собой',
    muscleGroup: MuscleGroup.Shoulders,
    description: 'Упражнение для передних дельт с гантелями или резинкой. Подходит для дома.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Shoulders],
    equipment: ['гантели', 'резинки'],
    difficulty: 'beginner',
  },
  // Руки
  {
    id: 'ex-arms-1',
    name: 'Сгибания рук со штангой',
    muscleGroup: MuscleGroup.Arms,
    description: 'Базовое упражнение для бицепсов.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Wrists],
    equipment: ['штанга'],
    difficulty: 'intermediate',
  },
  {
    id: 'ex-arms-2',
    name: 'Отжимания на брусьях',
    muscleGroup: MuscleGroup.Arms,
    description: 'Для трицепсов, передних дельт и грудных. Можно с дополнительным весом.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Shoulders, Contraindication.Wrists],
    equipment: ['брусья'],
    difficulty: 'intermediate',
  },
  {
    id: 'ex-arms-3',
    name: 'Сгибания рук с гантелями',
    muscleGroup: MuscleGroup.Arms,
    description: 'Изолирующая работа на бицепс. Подходит для дома.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Wrists],
    equipment: ['гантели'],
    difficulty: 'beginner',
  },
  // Кор
  {
    id: 'ex-core-1',
    name: 'Планка',
    muscleGroup: MuscleGroup.Core,
    description: 'Статическое упражнение для кора. Без инвентаря.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Wrists, Contraindication.Back],
    equipment: [],
    difficulty: 'beginner',
  },
  {
    id: 'ex-core-2',
    name: 'Скручивания',
    muscleGroup: MuscleGroup.Core,
    description: 'Классическое упражнение для пресса. Без инвентаря.',
    videoUrl: undefined,
    avoidIf: [Contraindication.Neck, Contraindication.Back],
    equipment: [],
    difficulty: 'beginner',
  },
];

// ============================================
// Начальные программы тренировок
// ============================================

const initialWorkoutPrograms: WorkoutProgram[] = [
  {
    id: 'program-beginner',
    title: 'Начинающий',
    difficulty: 'beginner',
    description: 'Идеальная программа для тех, кто только начинает свой путь в фитнесе. Фокус на базовых упражнениях, правильной технике и постепенном прогрессе. Низкая интенсивность, акцент на формировании привычки тренироваться.',
    weeks: 8,
    workoutsPerWeek: 2,
    exercises: ['ex-chest-2', 'ex-back-1', 'ex-legs-2', 'ex-core-1', 'ex-core-2'], // Отжимания, Подтягивания, Выпады, Планка, Скручивания
    color: 'green',
  },
  {
    id: 'program-intermediate',
    title: 'Средний',
    difficulty: 'intermediate',
    description: 'Программа для тех, кто уже имеет опыт тренировок и готов к более интенсивным нагрузкам. Умеренный объем тренировок с акцентом на развитие силы и выносливости. Баланс между базовыми и изолирующими упражнениями.',
    weeks: 12,
    workoutsPerWeek: 3,
    exercises: ['ex-chest-1', 'ex-chest-2', 'ex-back-1', 'ex-back-2', 'ex-legs-1', 'ex-legs-2', 'ex-shoulders-2', 'ex-arms-1', 'ex-core-1'],
    color: 'yellow',
  },
  {
    id: 'program-advanced',
    title: 'Профессионал',
    difficulty: 'advanced',
    description: 'Интенсивная программа для опытных спортсменов. Высокая нагрузка, сплит-тренировки по группам мышц, продвинутые техники. Требует хорошей физической подготовки и знания техники выполнения упражнений.',
    weeks: 16,
    workoutsPerWeek: 4,
    exercises: ['ex-chest-1', 'ex-chest-2', 'ex-back-1', 'ex-back-2', 'ex-legs-1', 'ex-legs-2', 'ex-shoulders-1', 'ex-shoulders-2', 'ex-arms-1', 'ex-arms-2', 'ex-core-1', 'ex-core-2'],
    color: 'red',
  },
];

const getDefaultExercises = (): Exercise[] => initialExercises;

// ============================================
// Store
// ============================================

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ============================================
      // Начальное состояние
      // ============================================
      userMode: null,
      clients: [],
      exercises: [],
      activeClient: null,
      workoutPlans: [],
      workoutPrograms: initialWorkoutPrograms,
      toasts: [],
      isAuthPending: false,
      isAuthenticated: false,

      // ============================================
      // Действия
      // ============================================

      /**
       * Установить режим пользователя
       */
      setMode: (mode) => {
        set((state) => ({
          ...state,
          userMode: mode,
          // Сбрасываем активного клиента при смене режима
          activeClient: mode !== 'trainer' ? null : state.activeClient,
        }));
      },

      /**
       * Добавить нового клиента
       */
      addClient: (client) => {
        set((state) => {
          const clients = state.clients || [];
          // Убеждаемся, что completedWorkouts инициализирован
          const clientWithDefaults = {
            ...client,
            completedWorkouts: client.completedWorkouts || [],
          };
          // Проверяем, нет ли уже клиента с таким ID
          const existingIndex = clients.findIndex((c) => c.id === client.id);
          if (existingIndex === -1) {
            return { ...state, clients: [...clients, clientWithDefaults] };
          } else {
            // Если клиент существует, обновляем его
            const updatedClients = [...clients];
            updatedClients[existingIndex] = clientWithDefaults;
            return { ...state, clients: updatedClients };
          }
        });
      },

      /**
       * Обновить данные клиента
       */
      updateClient: (clientId, updates) => {
        set((state) => {
          const clients = state.clients || [];
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          
          if (clientIndex === -1) {
            return state;
          }
          
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...updatedClients[clientIndex],
            ...updates,
          };
          
          return {
            ...state,
            clients: updatedClients,
            activeClient: state.activeClient?.id === clientId
              ? updatedClients[clientIndex]
              : state.activeClient,
          };
        });
      },

      /**
       * Выбрать клиента по ID
       */
      selectClient: (clientId) => {
        set((state) => {
          const clients = state.clients || [];
          const client = clients.find((c) => c.id === clientId);
          return { ...state, activeClient: client || null };
        });
      },

      /**
       * Удалить клиента
       */
      deleteClient: (id) => {
        set((state) => {
          const clients = state.clients || [];
          const updatedClients = clients.filter((c) => c.id !== id);
          
          // Удаляем связанные планы тренировок
          const workoutPlans = state.workoutPlans || [];
          const updatedPlans = workoutPlans.filter((p) => {
            // Находим клиента и проверяем, был ли у него план
            const client = clients.find((c) => c.id === id);
            return !client || client.currentPlanId !== p.id;
          });
          
          // Сбрасываем активного клиента, если он был удален
          const updatedActiveClient = state.activeClient?.id === id ? null : state.activeClient;
          
          return {
            ...state,
            clients: updatedClients,
            workoutPlans: updatedPlans,
            activeClient: updatedActiveClient,
          };
        });
      },

      /**
       * Обновить или создать план тренировок для клиента
       */
      updateClientPlan: (clientId, plan) => {
        set((state) => {
          const clients = state.clients || [];
          const workoutPlans = state.workoutPlans || [];
          
          // Находим клиента
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          if (clientIndex === -1) {
            return state; // Клиент не найден
          }
          
          const client = clients[clientIndex];
          
          // Определяем ID плана
          let planId: string;
          if (client.currentPlanId) {
            // Используем существующий ID
            planId = client.currentPlanId;
          } else {
            // Создаем новый ID
            planId = plan.id || `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
          
          // Проверяем, есть ли уже план с таким ID
          const existingPlanIndex = workoutPlans.findIndex((p) => p.id === planId);
          
          let updatedPlans: WorkoutPlan[];
          if (existingPlanIndex !== -1) {
            // Обновляем существующий план
            updatedPlans = [...workoutPlans];
            updatedPlans[existingPlanIndex] = { ...plan, id: planId };
          } else {
            // Создаем новый план
            updatedPlans = [...workoutPlans, { ...plan, id: planId }];
          }
          
          // Обновляем клиента с currentPlanId
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...updatedClients[clientIndex],
            currentPlanId: planId,
          };
          
          return {
            ...state,
            clients: updatedClients,
            workoutPlans: updatedPlans,
          };
        });
      },

      /**
       * Обновить недельный план тренировок для конкретного дня
       * @param selfOrganized - если true, помечает день как составленный клиентом самостоятельно
       */
      updateWeeklyPlan: (clientId, dayOfWeek, exercises, selfOrganized) => {
        set((state) => {
          const clients = state.clients || [];
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          
          if (clientIndex === -1) {
            return state; // Клиент не найден
          }
          
          const client = clients[clientIndex];
          
          const weeklyPlan: WeeklyPlan = client.weeklyPlan || {};
          
          // Обновляем план для конкретного дня
          const updatedWeeklyPlan = {
            ...weeklyPlan,
            [dayOfWeek]: exercises,
          };
          
          // Обновляем список дней, составленных клиентом
          let selfOrganizedDays = client.selfOrganizedDays || [];
          if (selfOrganized === true) {
            // Добавляем день в список, если его там нет
            if (!selfOrganizedDays.includes(dayOfWeek)) {
              selfOrganizedDays = [...selfOrganizedDays, dayOfWeek];
            }
          } else if (selfOrganized === false) {
            // Убираем день из списка (тренер переопределил)
            selfOrganizedDays = selfOrganizedDays.filter((d) => d !== dayOfWeek);
          }
          // Если selfOrganized не передан (undefined), оставляем как есть
          
          // Обновляем клиента
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...client,
            weeklyPlan: updatedWeeklyPlan,
            selfOrganizedDays,
          };
          
          return {
            ...state,
            clients: updatedClients,
          };
        });
      },

      /**
       * Добавить упражнение в план клиента (для самостоятельного планирования)
       */
      addClientWorkoutExercise: (clientId, dayOfWeek, exercise) => {
        set((state) => {
          const clients = state.clients || [];
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          
          if (clientIndex === -1) {
            return state;
          }
          
          const client = clients[clientIndex];
          const weeklyPlan: WeeklyPlan = client.weeklyPlan || {};
          const dayExercises = weeklyPlan[dayOfWeek] || [];
          
          // Проверяем, не добавлено ли уже это упражнение
          if (dayExercises.some((ex) => ex.exerciseId === exercise.exerciseId)) {
            return state;
          }
          
          // Добавляем упражнение с метаданными
          const exerciseWithMeta = {
            ...exercise,
            createdBy: clientId, // Клиент сам добавляет
            createdAt: new Date().toISOString(),
          };
          
          const updatedWeeklyPlan = {
            ...weeklyPlan,
            [dayOfWeek]: [...dayExercises, exerciseWithMeta],
          };
          
          // Обновляем список дней, составленных клиентом
          let selfOrganizedDays = client.selfOrganizedDays || [];
          if (!selfOrganizedDays.includes(dayOfWeek)) {
            selfOrganizedDays = [...selfOrganizedDays, dayOfWeek];
          }
          
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...client,
            weeklyPlan: updatedWeeklyPlan,
            selfOrganizedDays,
          };
          
          return {
            ...state,
            clients: updatedClients,
          };
        });
      },

      /**
       * Удалить упражнение из плана клиента (только если оно создано клиентом)
       */
      removeClientWorkoutExercise: (clientId, dayOfWeek, exerciseId) => {
        set((state) => {
          const clients = state.clients || [];
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          
          if (clientIndex === -1) {
            return state;
          }
          
          const client = clients[clientIndex];
          const weeklyPlan: WeeklyPlan = client.weeklyPlan || {};
          const dayExercises = weeklyPlan[dayOfWeek] || [];
          
          // Фильтруем упражнения, оставляя только те, которые не являются целевым
          // ИЛИ те, которые созданы не клиентом (их нельзя удалять)
          const updatedDayExercises = dayExercises.filter((ex) => 
            ex.exerciseId !== exerciseId || ex.createdBy !== clientId
          );
          
          const updatedWeeklyPlan = {
            ...weeklyPlan,
            [dayOfWeek]: updatedDayExercises,
          };
          
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...client,
            weeklyPlan: updatedWeeklyPlan,
          };
          
          return {
            ...state,
            clients: updatedClients,
          };
        });
      },

      /**
       * Обновить противопоказания клиента
       */
      updateClientContraindications: (clientId, contraindications) => {
        set((state) => {
          const clients = state.clients || [];
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          
          if (clientIndex === -1) {
            return state;
          }
          
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...updatedClients[clientIndex],
            contraindications,
          };
          
          return {
            ...state,
            clients: updatedClients,
            activeClient: state.activeClient?.id === clientId
              ? updatedClients[clientIndex]
              : state.activeClient,
          };
        });
      },

      /**
       * Получить дни, составленные клиентом самостоятельно
       */
      getClientSelfOrganizedDays: (clientId) => {
        const state = get();
        const client = state.clients.find((c) => c.id === clientId);
        return client?.selfOrganizedDays || [];
      },

      /**
       * Получить тренировку на сегодня для клиента
       */
      getTodayWorkout: (clientId) => {
        const state = get();
        const clients = state.clients || [];
        const client = clients.find((c) => c.id === clientId);
        
        if (!client || !client.weeklyPlan) {
          return null;
        }
        
        // Определяем текущий день недели
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = воскресенье, 1 = понедельник, ...
        
        // Преобразуем в наш формат (Mon-Sun)
        const dayMap: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay: DayOfWeek = dayMap[dayOfWeek];
        
        // Возвращаем упражнения на сегодня или null
        return client.weeklyPlan[currentDay] || null;
      },

      /**
       * Завершить тренировку и сохранить в историю клиента
       */
      completeWorkout: (clientId, workoutData) => {
        set((state) => {
          const clients = state.clients || [];
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          
          if (clientIndex === -1) {
            return state; // Клиент не найден
          }
          
          const client = clients[clientIndex];
          const completedWorkouts = client.completedWorkouts || [];
          
          // Создаем упрощенную запись тренировки
          const workoutSession: WorkoutSession = {
            id: workoutData.id || `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: workoutData.date || new Date().toISOString(),
            exercisesCount: workoutData.exercisesCount || 0,
            totalSets: workoutData.totalSets || 0,
            workoutName: workoutData.workoutName || 'Тренировка',
            completed: true, // Тренировка завершена
          };
          
          // Добавляем новую тренировку в историю
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...client,
            completedWorkouts: [...completedWorkouts, workoutSession],
          };
          
          return {
            ...state,
            clients: updatedClients,
            activeClient: state.activeClient?.id === clientId 
              ? updatedClients[clientIndex] 
              : state.activeClient,
          };
        });
      },

      /**
       * Расширенная версия завершения тренировки с полной историей
       * Копирует данные из weeklyPlan на сегодня и сохраняет с деталями
       */
      completeWorkoutWithHistory: (clientId, mood, notes, duration) => {
        const state = get();
        const clients = state.clients || [];
        const exercises = state.exercises || [];
        const client = clients.find((c) => c.id === clientId);
        
        if (!client || !client.weeklyPlan) {
          return;
        }
        
        // Определяем текущий день недели
        const today = new Date();
        const dayOfWeek = today.getDay();
        const dayMap: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay: DayOfWeek = dayMap[dayOfWeek];
        
        // Получаем план на сегодня
        const todayPlan = client.weeklyPlan[currentDay];
        if (!todayPlan || todayPlan.length === 0) {
          return;
        }
        
        // Названия дней недели на русском
        const dayNames: Record<DayOfWeek, string> = {
          Mon: 'Понедельник',
          Tue: 'Вторник',
          Wed: 'Среда',
          Thu: 'Четверг',
          Fri: 'Пятница',
          Sat: 'Суббота',
          Sun: 'Воскресенье',
        };
        
        // Преобразуем упражнения из плана в формат истории
        const historyExercises = todayPlan.map((planEx) => {
          const exercise = exercises.find((e) => e.id === planEx.exerciseId);
          return {
            title: exercise?.name || 'Неизвестное упражнение',
            sets: String(planEx.sets),
            reps: String(planEx.reps),
          };
        });
        
        // Создаем запись истории
        const historyEntry: WorkoutHistoryEntry = {
          id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: today.toISOString(),
          workoutName: `Тренировка: ${dayNames[currentDay]}`,
          dayOfWeek: currentDay,
          exercises: historyExercises,
          mood,
          duration,
          notes,
        };
        
        // Также создаем упрощенную запись для обратной совместимости
        const workoutSession: WorkoutSession = {
          id: historyEntry.id,
          date: historyEntry.date,
          exercisesCount: historyExercises.length,
          totalSets: todayPlan.reduce((sum, ex) => sum + ex.sets, 0),
          workoutName: historyEntry.workoutName,
          completed: true,
        };
        
        set((s) => {
          const clientIndex = s.clients.findIndex((c) => c.id === clientId);
          if (clientIndex === -1) return s;
          
          const updatedClients = [...s.clients];
          const currentClient = updatedClients[clientIndex];
          
          updatedClients[clientIndex] = {
            ...currentClient,
            completedWorkouts: [...(currentClient.completedWorkouts || []), workoutSession],
            workoutHistory: [...(currentClient.workoutHistory || []), historyEntry],
          };
          
          return {
            ...s,
            clients: updatedClients,
            activeClient: s.activeClient?.id === clientId 
              ? updatedClients[clientIndex] 
              : s.activeClient,
          };
        });
      },

      /**
       * Получить историю тренировок клиента (отсортированную от новых к старым)
       */
      getClientWorkoutHistory: (clientId) => {
        const state = get();
        const client = state.clients.find((c) => c.id === clientId);
        
        if (!client || !client.workoutHistory) {
          return [];
        }
        
        // Сортируем от новых к старым
        return [...client.workoutHistory].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      },

      /**
       * Получить активность всех клиентов (последние тренировки)
       */
      getAllClientsActivity: () => {
        const state = get();
        const clients = state.clients || [];
        
        // Собираем все тренировки со всех клиентов
        const allActivities: Array<{ clientName: string; clientId: string; workout: WorkoutSession }> = [];
        
        clients.forEach((client) => {
          const workouts = client.completedWorkouts || [];
          workouts.forEach((workout) => {
            allActivities.push({
              clientName: client.name,
              clientId: client.id,
              workout,
            });
          });
        });
        
        // Сортируем по дате (от новых к старым)
        allActivities.sort((a, b) => {
          const dateA = new Date(a.workout.date).getTime();
          const dateB = new Date(b.workout.date).getTime();
          return dateB - dateA;
        });
        
        return allActivities;
      },

      /**
       * Загрузить начальные данные (заглушка)
       * В будущем здесь будет загрузка из LocalStorage или API
       */
      loadInitialData: () => {
        set((state) => {
          // Загружаем упражнения только если они пусты
          const exercises = (state.exercises && state.exercises.length > 0) 
            ? state.exercises 
            : getDefaultExercises();
          
          return {
            ...state,
            exercises,
            // Убеждаемся, что clients - это массив
            clients: state.clients || [],
          };
        });
      },

      /**
       * Добавить Toast уведомление
       */
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          ...state,
          toasts: [...(state.toasts || []), { ...toast, id }],
        }));
      },

      /**
       * Удалить Toast уведомление
       */
      removeToast: (id) => {
        set((state) => ({
          ...state,
          toasts: (state.toasts || []).filter((t) => t.id !== id),
        }));
      },

      /**
       * Очистить все данные (для демо/разработки)
       */
      clearAllData: () => {
        set({
          userMode: null,
          clients: [],
          exercises: [],
          activeClient: null,
          workoutPlans: [],
          toasts: [],
        });
        // Очищаем localStorage
        localStorage.removeItem('oft-storage');
        // Перезагружаем начальные данные
        setTimeout(() => {
          useAppStore.getState().loadInitialData();
        }, 100);
      },

      /**
       * Привязать Telegram аккаунт к клиенту
       */
      bindTelegram: (clientId, telegramId, telegramUsername) => {
        set((state) => {
          const clients = state.clients || [];
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          
          if (clientIndex === -1) {
            return state; // Клиент не найден
          }
          
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...updatedClients[clientIndex],
            telegramId,
            telegramUsername,
            isTelegramLinked: true,
          };
          
          return {
            ...state,
            clients: updatedClients,
            activeClient: state.activeClient?.id === clientId 
              ? updatedClients[clientIndex] 
              : state.activeClient,
          };
        });
      },

      /**
       * Привязать Telegram аккаунт (упрощенная версия)
       */
      linkTelegram: (clientId, username) => {
        const mockTelegramId = `${Math.floor(Math.random() * 1000000000)}`;
        useAppStore.getState().bindTelegram(clientId, mockTelegramId, username);
      },

      /**
       * Отвязать Telegram аккаунт
       */
      unlinkTelegram: (clientId) => {
        set((state) => {
          const clients = state.clients || [];
          const clientIndex = clients.findIndex((c) => c.id === clientId);
          
          if (clientIndex === -1) {
            return state;
          }
          
          const updatedClients = [...clients];
          updatedClients[clientIndex] = {
            ...updatedClients[clientIndex],
            telegramId: undefined,
            telegramUsername: undefined,
            isTelegramLinked: false,
          };
          
          return {
            ...state,
            clients: updatedClients,
            activeClient: state.activeClient?.id === clientId 
              ? updatedClients[clientIndex] 
              : state.activeClient,
          };
        });
      },

      /**
       * Имитация отправки уведомления в Telegram
       * В реальном приложении здесь был бы вызов API Telegram Bot
       */
      sendTelegramNotification: (clientId, message) => {
        const state = useAppStore.getState();
        const client = state.clients.find((c) => c.id === clientId);
        
        // Отправляем уведомление только если клиент привязан к Telegram
        if (client && (client.isTelegramLinked || client.telegramId)) {
          // Имитируем отправку уведомления
          // В реальном приложении здесь был бы API вызов
          
          // Показываем Toast с Telegram стилем для активного клиента
          if (state.activeClient?.id === clientId) {
            state.addToast({
              type: 'info',
              message: `✈️ ${message}`,
              // Toast будет автоматически стилизован с иконкой Telegram
            });
          }
        }
      },

      /**
       * Установить состояние ожидания авторизации
       */
      setAuthPending: (pending) => {
        set({ isAuthPending: pending });
      },

      /**
       * Завершить авторизацию и установить активного пользователя
       */
      setAuthenticated: (user) => {
        set((state) => {
          // Находим или создаем клиента
          let client = state.clients.find((c) => c.id === user.id);
          
          // Если клиента нет, создаем его (для демо)
          if (!client) {
            client = {
              id: user.id,
              name: user.name,
              age: 25, // Дефолтное значение
              goal: 'muscle_gain' as any,
              equipment: 'gym' as any,
              telegramId: user.telegramId,
              isTelegramLinked: !!user.telegramId,
              isFirstLogin: true, // Новый клиент должен пройти онбординг
            };
            // Добавляем клиента в список
            const updatedClients = [...(state.clients || []), client];
            return {
              ...state,
              userMode: 'client',
              clients: updatedClients,
              activeClient: client,
              isAuthPending: false,
            };
          }
          
          // Обновляем клиента если есть telegramId
          if (user.telegramId && !client.telegramId) {
            const updatedClients = (state.clients || []).map((c) =>
              c.id === user.id
                ? { ...c, telegramId: user.telegramId, isTelegramLinked: true }
                : c
            );
            return {
              ...state,
              userMode: 'client',
              clients: updatedClients,
              activeClient: { ...client, telegramId: user.telegramId, isTelegramLinked: true },
              isAuthPending: false,
            };
          }
          
          return {
            ...state,
            userMode: 'client',
            activeClient: client,
            isAuthPending: false,
          };
        });
      },

      /**
       * Авторизация через Telegram Widget
       */
      loginViaTelegram: (tgUser) => {
        const state = get();
        const telegramId = tgUser.id;
        const loginTimestamp = Date.now(); // Сохраняем timestamp входа
        
        // Ищем существующего клиента по telegramId
        let client = state.clients.find((c) => c.telegramId === telegramId);
        let isNewUser = false;
        
        if (!client) {
          // Создаем нового клиента
          isNewUser = true;
          const fullName = tgUser.lastName 
            ? `${tgUser.firstName} ${tgUser.lastName}`.trim()
            : tgUser.firstName;
          
          client = {
            id: `client_${telegramId}`,
            name: fullName,
            age: 25, // Дефолтное значение, будет заполнено на онбординге
            goal: ClientGoal.MuscleGain, // Дефолтное значение
            equipment: Equipment.Gym, // Дефолтное значение
            telegramId: telegramId,
            telegramUsername: tgUser.username,
            isTelegramLinked: true,
            isFirstLogin: true, // Новый клиент должен пройти онбординг
            photoUrl: tgUser.photoUrl,
          };
          
          // Добавляем клиента в список
          set((s) => ({
            ...s,
            clients: [...(s.clients || []), client!],
          }));
        } else {
          // Обновляем данные существующего клиента из Telegram
          const fullName = tgUser.lastName 
            ? `${tgUser.firstName} ${tgUser.lastName}`.trim()
            : tgUser.firstName;
          
          set((s) => {
            const updatedClients = (s.clients || []).map((c) =>
              c.id === client!.id
                ? {
                    ...c,
                    name: fullName,
                    telegramUsername: tgUser.username || c.telegramUsername,
                    photoUrl: tgUser.photoUrl || c.photoUrl,
                    isTelegramLinked: true,
                  }
                : c
            );
            
            return {
              ...s,
              clients: updatedClients,
            };
          });
          
          // Обновляем client с новыми данными
          client = {
            ...client,
            name: fullName,
            telegramUsername: tgUser.username || client.telegramUsername,
            photoUrl: tgUser.photoUrl || client.photoUrl,
            isTelegramLinked: true,
          };
        }
        
        // Устанавливаем активного клиента и режим
        set((s) => ({
          ...s,
          userMode: 'client',
          activeClient: client!,
          isAuthPending: false,
          isAuthenticated: true, // Пользователь авторизован
        }));
        
        // Сохраняем timestamp входа в localStorage (опционально, для аналитики)
        if (typeof window !== 'undefined') {
          localStorage.setItem('oft_last_login', loginTimestamp.toString());
        }
        
        return { isNewUser, client: client! };
      },

      /**
       * Вход без авторизации (демо-режим)
       * Создает или использует существующего демо-клиента
       */
      loginWithoutAuth: () => {
        const state = get();
        const clients = state.clients || [];
        
        // Ищем существующего демо-клиента (без telegramId)
        let demoClient: Client | undefined = clients.find((c) => !c.telegramId && c.id.startsWith('demo-client'));
        let isNewUser = false;
        
        if (!demoClient) {
          // Создаем нового демо-клиента
          isNewUser = true;
          const demoClientId = `demo-client-${Date.now()}`;
          
          const newDemoClient: Client = {
            id: demoClientId,
            name: 'Демо Пользователь',
            age: 25,
            goal: ClientGoal.MuscleGain,
            equipment: Equipment.Gym,
            isFirstLogin: true,
            isTelegramLinked: false,
            completedWorkouts: [],
            workoutHistory: [],
            contraindications: [],
            selfOrganizedDays: [],
          };
          
          // Добавляем клиента в список и сразу устанавливаем как активного
          set((s) => ({
            ...s,
            clients: [...(s.clients || []), newDemoClient],
            userMode: 'client',
            activeClient: newDemoClient,
            isAuthPending: false,
            isAuthenticated: false,
          }));
          
          return { isNewUser, client: newDemoClient };
        }
        
        // Используем существующего демо-клиента
        set((s) => ({
          ...s,
          userMode: 'client',
          activeClient: demoClient!,
          isAuthPending: false,
          isAuthenticated: false,
        }));
        
        return { isNewUser, client: demoClient };
      },

      /**
       * Выход из системы
       */
      logout: () => {
        set((state) => ({
          ...state,
          userMode: null,
          activeClient: null,
          isAuthPending: false,
          isAuthenticated: false,
        }));
        if (typeof window !== 'undefined') {
          localStorage.removeItem('oft_last_login');
          localStorage.removeItem('oft-storage');
        }
      },

      /**
       * Применить программу тренировок к клиенту
       */
      applyWorkoutProgram: (clientId, programId) => {
        const state = get();
        const program = state.workoutPrograms.find((p) => p.id === programId);
        if (!program) {
          console.error('Program not found:', programId);
          return;
        }

        const client = state.clients.find((c) => c.id === clientId);
        if (!client) {
          console.error('Client not found:', clientId);
          return;
        }

        // Распределяем упражнения по дням недели
        const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const workoutsPerWeek = program.workoutsPerWeek;
        const exercisesPerWorkout = Math.ceil(program.exercises.length / workoutsPerWeek);

        const newWeeklyPlan: WeeklyPlan = {};

        // Распределяем упражнения по дням
        let exerciseIndex = 0;
        for (let i = 0; i < workoutsPerWeek && exerciseIndex < program.exercises.length; i++) {
          const day = days[i];
          const workoutExercises: WorkoutPlanExercise[] = [];

          // Добавляем упражнения для этого дня
          for (let j = 0; j < exercisesPerWorkout && exerciseIndex < program.exercises.length; j++) {
            const exerciseId = program.exercises[exerciseIndex];
            workoutExercises.push({
              exerciseId,
              sets: 3,
              reps: 10,
            });
            exerciseIndex++;
          }

          if (workoutExercises.length > 0) {
            newWeeklyPlan[day] = workoutExercises;
          }
        }

        // Обновляем weeklyPlan клиента
        set((s) => {
          const updatedClients = s.clients.map((c) => {
            if (c.id === clientId) {
              return {
                ...c,
                weeklyPlan: newWeeklyPlan,
              };
            }
            return c;
          });

          return {
            ...s,
            clients: updatedClients,
            activeClient: s.activeClient?.id === clientId
              ? { ...s.activeClient, weeklyPlan: newWeeklyPlan }
              : s.activeClient,
          };
        });
      },

      /**
       * Умный генератор тренировок по анкетным данным клиента
       * Учитывает уровень (новичок/профи), травмы, оборудование и длительность
       */
      generateWorkout: (preferences) => {
        const state = get();
        const exercises = state.exercises || [];
        const client = state.activeClient || state.clients?.[0];
        const level: FitnessLevel = (client?.fitnessLevel ?? client?.level ?? 'beginner') as FitnessLevel;
        const contraindications = client?.contraindications || [];
        const { muscleGroups, durationMinutes, equipment: eqPref } = preferences;

        const isBeginner = level === 'beginner';
        const isAdvanced = level === 'advanced';
        const setsMin = isBeginner ? 2 : isAdvanced ? 4 : 3;
        const setsMax = isBeginner ? 3 : isAdvanced ? 5 : 4;
        const repsMin = isBeginner ? 10 : isAdvanced ? 6 : 8;
        const repsMax = isBeginner ? 15 : isAdvanced ? 10 : 12;

        const matchesEquipment = (ex: Exercise): boolean => {
          const eq = ex.equipment || [];
          if (eqPref === 'gym') return true;
          if (eqPref === 'pullup_only') return eq.includes('турник');
          if (eqPref === 'home')
            return eq.length === 0 || eq.every((e) => e === 'гантели' || e === 'резинки');
          return true;
        };

        const hasContraindication = (ex: Exercise): boolean =>
          (ex.avoidIf || []).some((c) => contraindications.includes(c));

        let pool = exercises.filter((ex) => {
          if (!muscleGroups.includes(ex.muscleGroup)) return false;
          if (hasContraindication(ex)) return false;
          if (!matchesEquipment(ex)) return false;
          if (isBeginner && ex.highAxialLoad) return false;
          if (isBeginner && ex.difficulty === 'advanced') return false;
          if (isAdvanced && ex.difficulty === 'beginner' && ex.muscleGroup !== MuscleGroup.Core) {
            const hasHarder = exercises.some(
              (e) =>
                e.muscleGroup === ex.muscleGroup &&
                !hasContraindication(e) &&
                matchesEquipment(e) &&
                (e.difficulty === 'intermediate' || e.difficulty === 'advanced')
            );
            if (hasHarder) return false;
          }
          return true;
        });

        const shuffle = <T,>(a: T[]): T[] => {
          const out = [...a];
          for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [out[i], out[j]] = [out[j], out[i]];
          }
          return out;
        };
        pool = shuffle(pool);

        const pickPerGroup = Math.max(1, Math.ceil((durationMinutes / 8)));
        const maxTotal = Math.min(12, Math.max(4, Math.floor(durationMinutes / 5)));
        const selected: Exercise[] = [];
        const usedIds = new Set<string>();

        for (const mg of muscleGroups) {
          const groupEx = shuffle(pool.filter((e) => e.muscleGroup === mg && !usedIds.has(e.id)));
          let n = pickPerGroup;
          if (mg === MuscleGroup.Core) n = 1;
          for (let i = 0; i < n && i < groupEx.length && selected.length < maxTotal; i++) {
            selected.push(groupEx[i]);
            usedIds.add(groupEx[i].id);
          }
        }

        const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
        return selected.map((ex) => ({
          exerciseId: ex.id,
          sets: rnd(setsMin, setsMax),
          reps: rnd(repsMin, repsMax),
        }));
      },

      /**
       * Подобрать альтернативу для одного слота (для кнопки «Заменить» в генераторе)
       */
      pickAlternativeForSlot: (preferences, excludeExerciseId, forMuscleGroup) => {
        const state = get();
        const exercises = state.exercises || [];
        const client = state.activeClient || state.clients?.[0];
        const level: FitnessLevel = (client?.fitnessLevel ?? client?.level ?? 'beginner') as FitnessLevel;
        const contraindications = client?.contraindications || [];
        const eqPref = preferences.equipment;

        const isBeginner = level === 'beginner';
        const isAdvanced = level === 'advanced';
        const setsMin = isBeginner ? 2 : isAdvanced ? 4 : 3;
        const setsMax = isBeginner ? 3 : isAdvanced ? 5 : 4;
        const repsMin = isBeginner ? 10 : isAdvanced ? 6 : 8;
        const repsMax = isBeginner ? 15 : isAdvanced ? 10 : 12;

        const matchesEquipment = (ex: Exercise): boolean => {
          const eq = ex.equipment || [];
          if (eqPref === 'gym') return true;
          if (eqPref === 'pullup_only') return eq.includes('турник');
          if (eqPref === 'home') return eq.length === 0 || eq.every((e) => e === 'гантели' || e === 'резинки');
          return true;
        };
        const hasContraindication = (ex: Exercise): boolean =>
          (ex.avoidIf || []).some((c) => contraindications.includes(c));

        let pool = exercises.filter((ex) => {
          if (ex.muscleGroup !== forMuscleGroup || ex.id === excludeExerciseId) return false;
          if (hasContraindication(ex)) return false;
          if (!matchesEquipment(ex)) return false;
          if (isBeginner && ex.highAxialLoad) return false;
          if (isBeginner && ex.difficulty === 'advanced') return false;
          if (isAdvanced && ex.difficulty === 'beginner' && ex.muscleGroup !== MuscleGroup.Core) {
            const hasHarder = exercises.some(
              (e) => e.muscleGroup === forMuscleGroup && !hasContraindication(e) && matchesEquipment(e) &&
                (e.difficulty === 'intermediate' || e.difficulty === 'advanced')
            );
            if (hasHarder) return false;
          }
          return true;
        });

        if (pool.length === 0) return null;
        const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
        const ex = pool[Math.floor(Math.random() * pool.length)];
        return { exerciseId: ex.id, sets: rnd(setsMin, setsMax), reps: rnd(repsMin, repsMax) };
      },
    }),
    {
      name: 'oft-storage', // Ключ для localStorage
      // Восстановление состояния после загрузки
      onRehydrateStorage: () => (state) => {
        // После загрузки из localStorage, убеждаемся, что данные корректны
        if (state) {
          if (!state.clients || !Array.isArray(state.clients)) {
            state.clients = [];
          } else {
            // Убеждаемся, что у каждого клиента есть completedWorkouts, weeklyPlan, workoutHistory и новые поля
            state.clients = state.clients.map((client) => ({
              ...client,
              completedWorkouts: client.completedWorkouts || [],
              weeklyPlan: client.weeklyPlan || {},
              workoutHistory: client.workoutHistory || [],
              contraindications: client.contraindications || [],
              selfOrganizedDays: client.selfOrganizedDays || [],
              isFirstLogin: client.isFirstLogin !== undefined ? client.isFirstLogin : true, // По умолчанию true для новых клиентов
              fitnessLevel: client.fitnessLevel || undefined,
              workoutDaysPerWeek: client.workoutDaysPerWeek || undefined,
              workoutDurationMinutes: client.workoutDurationMinutes || undefined,
            }));
          }
          
          // Синхронизируем activeClient с актуальными данными из clients
          if (state.activeClient && state.clients.length > 0) {
            const updatedActiveClient = state.clients.find((c) => c.id === state.activeClient?.id);
            if (updatedActiveClient) {
              state.activeClient = updatedActiveClient;
            }
          }
          
          // Проверяем авторизацию: если есть activeClient, значит пользователь авторизован
          if (state.activeClient && state.userMode === 'client') {
            state.isAuthenticated = true;
          } else {
            state.isAuthenticated = false;
          }
          
          if (!state.exercises || !Array.isArray(state.exercises) || state.exercises.length === 0) {
            state.exercises = getDefaultExercises();
          }
          if (!state.workoutPlans || !Array.isArray(state.workoutPlans)) {
            state.workoutPlans = [];
          }
          if (!state.workoutPrograms || !Array.isArray(state.workoutPrograms)) {
            state.workoutPrograms = initialWorkoutPrograms;
          }
          if (!state.toasts || !Array.isArray(state.toasts)) {
            state.toasts = [];
          }
        }
      },
    }
  )
);

// ============================================
// Автоматическая инициализация при первом использовании
// ============================================

// Загружаем начальные данные при первом импорте
if (typeof window !== 'undefined') {
  useAppStore.getState().loadInitialData();
}

// ============================================
// Экспорт типов
// ============================================

export type { AppStore, AppState, AppActions, UserMode };
