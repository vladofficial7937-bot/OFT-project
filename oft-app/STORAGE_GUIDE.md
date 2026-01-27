# 💾 Руководство по работе с хранилищем

## Быстрый старт

```typescript
import { storage } from '@/data/storage';

// Хранилище автоматически инициализировано!
const clients = storage.getClients();
```

## Основные операции

### Работа с клиентами

```typescript
// Получить всех клиентов
const clients = storage.getClients();

// Получить клиента по ID
const client = storage.getClient('client-anna');

// Добавить нового клиента
const newClient = storage.addClient({
  name: 'Иван Иванов',
  goal: 'Набор массы',
  level: 'beginner',
  equipment: ['Гантели', 'Турник'],
});

// Обновить клиента
storage.updateClient(newClient.id, {
  goal: 'Поддержание формы',
});

// Удалить клиента
storage.deleteClient(newClient.id);
```

### Работа с упражнениями

```typescript
// Все упражнения
const exercises = storage.getExercises();

// Упражнения по группе мышц
const chestExercises = storage.getExercisesByMuscleGroup('chest');

// Упражнения по уровню
const beginnerExercises = storage.getExercisesByLevel('beginner');

// Упражнения по оборудованию
const dumbellExercises = storage.getExercisesByEquipment('Гантели');
```

### Работа с планами тренировок

```typescript
// Получить план клиента
const plan = storage.getWorkoutPlan('client-anna');

// Создать новый план
const newPlan = storage.createWorkoutPlan('client-anna', [
  {
    dayNumber: 1,
    name: 'День 1: Верх тела',
    exercises: [
      {
        exerciseId: 'ex-pushups',
        setsReps: '3x12',
        notes: 'Если тяжело, с колен',
      },
    ],
  },
]);

// Обновить план
storage.saveWorkoutPlan(newPlan);
```

### Работа с тренировками

```typescript
// Получить тренировки клиента
const sessions = storage.getWorkoutSessions('client-anna');

// Добавить новую тренировку
const session = storage.addWorkoutSession({
  clientId: 'client-anna',
  date: new Date().toISOString(),
  planDayNumber: 1,
  exercises: [
    {
      exerciseId: 'ex-pushups',
      completed: true,
      sets: [
        { reps: 12, completed: true },
        { reps: 10, completed: true },
        { reps: 8, completed: true },
      ],
    },
  ],
  completed: true,
});

// Обновить тренировку
storage.updateWorkoutSession(session.id, {
  completed: true,
});
```

## Утилиты

```typescript
// Экспорт данных
const backup = storage.exportData();

// Импорт данных
storage.importData(backup);

// Сброс к начальным данным
storage.reset();

// Очистка всех данных
storage.clearAll();
```

## Ключи localStorage

- `oft_clients` - Клиенты
- `oft_exercises` - Упражнения
- `oft_muscleGroups` - Группы мышц
- `oft_workoutPlans` - Планы тренировок
- `oft_workoutSessions` - Тренировочные сессии

## Особенности

✅ **Автоматическая инициализация** - Загружает seed-данные при первом запуске  
✅ **Singleton** - Один экземпляр на всё приложение  
✅ **TypeScript** - Полная типизация  
✅ **Каскадное удаление** - При удалении клиента удаляются его планы и сессии  
✅ **Генерация ID** - Автоматическая генерация уникальных ID  

## Примеры

Смотрите `src/data/storage/examples.ts` для полных примеров использования.

## Демо

Запустите приложение и откройте вкладку "💾 Хранилище" для интерактивной демонстрации.
