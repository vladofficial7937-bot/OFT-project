/**
 * Константы маршрутов приложения
 */

export const ROUTES = {
  // Главная
  HOME: '/',

  // Тренер
  TRAINER: {
    DASHBOARD: '/trainer',
    ADD_CLIENT: '/trainer/add-client',
    ASSIGN_WORKOUT: (clientId: string) => `/trainer/assign/${clientId}`,
    ASSIGN_WORKOUT_PATTERN: '/trainer/assign/:clientId',
    CLIENT_PROFILE: (id: string) => `/trainer/client/${id}`,
    CLIENT_PROFILE_PATTERN: '/trainer/client/:id',
  },

  // Клиент
  CLIENT: {
    HOME: '/client',
    ONBOARDING: '/client/onboarding',
    CATALOG: '/client/catalog',
    MUSCLE_MAP: '/client/muscle-map',
    EXERCISES: '/client/exercises',
    EXERCISE_DETAIL: (id: string) => `/client/exercises/${id}`,
    EXERCISE_DETAIL_PATTERN: '/client/exercises/:id',
    TODAY: '/client/today',
    PROGRESS: '/client/progress',
    PROFILE: '/client/profile',
    HISTORY: '/client/history',
    MY_PLAN: '/client/my-plan',
    PROGRAMS: '/client/programs',
    WORKOUT_GENERATOR: '/client/workout-generator',
    GENERATOR: '/client/generator',
  },

  // Авторизация
  AUTH: {
    TELEGRAM: '/auth/telegram',
    ROLE_SELECT: '/auth/role-select',
  },
} as const;
