# 💾 Локальное хранилище

Модуль для работы с localStorage, предоставляющий типизированный API для хранения данных приложения.

## 🚀 Быстрый старт

```typescript
import { storage } from '@/data/storage';

// Хранилище автоматически инициализируется при импорте
// Если данных нет, загружаются seed-данные

// Получить всех клиентов
const clients = storage.getClients();

// Добавить нового клиента
const newClient = storage.addClient({
  name: 'Иван Иванов',
  goal: 'Набор массы',
  level: 'beginner',
  equipment: ['Гантели', 'Турник'],
});
```

## 📋 API

### Инициализация

```typescript
// Инициализация (выполняется автоматически)
storage.init();

// Сброс к seed-данным
storage.reset();

// Очистка всех данных
storage.clearAll();
```

### Клиенты

```typescript
// Получить всех клиентов
const clients: Client[] = storage.getClients();

// Получить клиента по ID
const client: Client | undefined = storage.getClient('client-1');

// Добавить нового клиента
const newClient = storage.addClient({
  name: 'Мария Петрова',
  goal: 'Похудение',
  level: 'beginner',
  equipment: ['Коврик', 'Гантели'],
});

// Обновить клиента
const updated = storage.updateClient('client-1', {
  goal: 'Поддержание формы',
});

// Удалить клиента (также удаляет связанные планы и сессии)
const deleted: boolean = storage.deleteClient('client-1');
```

### Упражнения

```typescript
// Получить все упражнения
const exercises: Exercise[] = storage.getExercises();

// Получить упражнение по ID
const exercise: Exercise | undefined = storage.getExercise('ex-bench-press');

// Получить упражнения по группе мышц
const chestExercises = storage.getExercisesByMuscleGroup('chest');

// Получить упражнения по уровню
const beginnerExercises = storage.getExercisesByLevel('beginner');

// Получить упражнения по оборудованию
const dumbellExercises = storage.getExercisesByEquipment('Гантели');
```

### Группы мышц

```typescript
// Получить все группы мышц
const muscleGroups: MuscleGroup[] = storage.getMuscleGroups();

// Получить группу по ID
const chest: MuscleGroup | undefined = storage.getMuscleGroup('chest');
```

### Планы тренировок

```typescript
// Получить план клиента
const plan: WorkoutPlan | undefined = storage.getWorkoutPlan('client-1');

// Получить все планы
const allPlans: WorkoutPlan[] = storage.getWorkoutPlans();

// Создать новый план
const newPlan = storage.createWorkoutPlan('client-1', [
  {
    dayNumber: 1,
    name: 'День 1: Грудь',
    exercises: [
      {
        exerciseId: 'ex-bench-press',
        setsReps: '4x8',
        notes: 'Разминка обязательна',
      },
    ],
  },
]);

// Сохранить существующий план
storage.saveWorkoutPlan(plan);
```

### Сессии тренировок

```typescript
// Получить все сессии клиента
const sessions: WorkoutSession[] = storage.getWorkoutSessions('client-1');

// Получить все сессии
const allSessions: WorkoutSession[] = storage.getAllWorkoutSessions();

// Получить сессию по ID
const session: WorkoutSession | undefined = storage.getWorkoutSession('session-1');

// Добавить новую сессию
const newSession = storage.addWorkoutSession({
  clientId: 'client-1',
  date: new Date().toISOString(),
  planDayNumber: 1,
  exercises: [
    {
      exerciseId: 'ex-bench-press',
      completed: true,
      sets: [
        { reps: 10, weight: 60, completed: true },
        { reps: 8, weight: 70, completed: true },
      ],
    },
  ],
  completed: true,
});

// Обновить сессию
const updated = storage.updateWorkoutSession('session-1', {
  completed: true,
});

// Удалить сессию
const deleted: boolean = storage.deleteWorkoutSession('session-1');
```

### Утилиты

```typescript
// Экспортировать все данные (для бэкапа)
const backup = storage.exportData();
// Результат:
// {
//   clients: Client[],
//   exercises: Exercise[],
//   muscleGroups: MuscleGroup[],
//   workoutPlans: WorkoutPlan[],
//   workoutSessions: WorkoutSession[]
// }

// Импортировать данные (для восстановления)
storage.importData(backup);

// Импортировать частично
storage.importData({
  clients: [...],
  workoutPlans: [...],
});
```

## 🔑 Ключи localStorage

```typescript
const STORAGE_KEYS = {
  CLIENTS: 'oft_clients',
  EXERCISES: 'oft_exercises',
  MUSCLE_GROUPS: 'oft_muscleGroups',
  WORKOUT_PLANS: 'oft_workoutPlans',
  WORKOUT_SESSIONS: 'oft_workoutSessions',
};
```

## 💡 Примеры использования

### Создание нового клиента с планом

```typescript
import { storage } from '@/data/storage';

// 1. Создаём клиента
const client = storage.addClient({
  name: 'Алексей Смирнов',
  goal: 'Набор массы',
  level: 'intermediate',
  equipment: ['Штанга', 'Гантели', 'Скамья'],
});

// 2. Создаём план тренировок
const plan = storage.createWorkoutPlan(client.id, [
  {
    dayNumber: 1,
    name: 'День 1: Грудь + Трицепс',
    exercises: [
      {
        exerciseId: 'ex-bench-press',
        setsReps: '4x8-10',
      },
      {
        exerciseId: 'ex-dips',
        setsReps: '3x10-12',
      },
    ],
  },
  {
    dayNumber: 2,
    name: 'День 2: Спина + Бицепс',
    exercises: [
      {
        exerciseId: 'ex-pull-ups',
        setsReps: '4x8-10',
      },
      {
        exerciseId: 'ex-barbell-row',
        setsReps: '4x8-10',
      },
    ],
  },
]);
```

### Запись тренировки

```typescript
import { storage } from '@/data/storage';

// Получаем план клиента
const plan = storage.getWorkoutPlan('client-1');
const day1 = plan?.days[0];

// Создаём сессию на основе дня плана
const session = storage.addWorkoutSession({
  clientId: 'client-1',
  date: new Date().toISOString(),
  planDayNumber: 1,
  exercises: day1!.exercises.map(ex => ({
    exerciseId: ex.exerciseId,
    completed: false,
    sets: [],
  })),
  completed: false,
});

// Записываем результаты подходов
const updatedSession = storage.updateWorkoutSession(session.id, {
  exercises: [
    {
      exerciseId: 'ex-bench-press',
      completed: true,
      sets: [
        { reps: 10, weight: 60, completed: true },
        { reps: 8, weight: 70, completed: true },
        { reps: 8, weight: 70, completed: true },
        { reps: 6, weight: 70, completed: true },
      ],
    },
  ],
  completed: true,
});
```

### Фильтрация упражнений по критериям

```typescript
import { storage } from '@/data/storage';

const client = storage.getClient('client-1');

if (client) {
  // Найти упражнения, подходящие для клиента
  const suitableExercises = storage
    .getExercises()
    .filter(ex => {
      // По уровню
      const levelMatch = ex.level === client.level;
      
      // По оборудованию
      const equipmentMatch = ex.equipment.every(eq =>
        client.equipment.includes(eq) || eq === 'Без оборудования'
      );
      
      return levelMatch && equipmentMatch;
    });
}
```

## ⚠️ Важные замечания

1. **Автоматическая инициализация**: Хранилище инициализируется автоматически при первом импорте
2. **Singleton pattern**: Используется один экземпляр на всё приложение
3. **Seed-данные**: При первом запуске автоматически загружаются тестовые данные
4. **Каскадное удаление**: При удалении клиента также удаляются его планы и сессии
5. **Сортировка сессий**: Сессии возвращаются отсортированными по дате (новые первыми)
6. **Генерация ID**: ID генерируются автоматически в формате `{prefix}-{timestamp}-{random}`

## 🔄 Миграция данных

Если нужно обновить структуру данных:

```typescript
// Экспортируем старые данные
const oldData = storage.exportData();

// Трансформируем данные
const newData = {
  ...oldData,
  clients: oldData.clients.map(client => ({
    ...client,
    newField: 'default value',
  })),
};

// Очищаем хранилище
storage.clearAll();

// Импортируем обновлённые данные
storage.importData(newData);
storage.init();
```
