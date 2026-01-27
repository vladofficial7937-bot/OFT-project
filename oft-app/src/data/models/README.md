# 📋 Модели данных OFT

Этот каталог содержит TypeScript типы и интерфейсы для всех сущностей приложения.

## 📁 Структура

- `types.ts` - Основные типы и интерфейсы
- `index.ts` - Реэкспорт всех типов

## 🔷 Основные сущности

### Client (Клиент)
Представляет клиента тренера с его целями и уровнем подготовки.

```typescript
import { Client } from '@/data/models';

const client: Client = {
  id: '1',
  name: 'Иван Иванов',
  goal: 'Набор массы',
  level: 'intermediate',
  equipment: ['Гантели', 'Штанга'],
  createdAt: new Date().toISOString(),
};
```

### MuscleGroup (Группа мышц)
Категория упражнений по группам мышц.

```typescript
const muscleGroup: MuscleGroup = {
  id: 'chest',
  name: 'Грудь',
  nameEn: 'chest',
};
```

### Exercise (Упражнение)
Описание конкретного упражнения.

```typescript
const exercise: Exercise = {
  id: 'bench-press',
  title: 'Жим штанги лежа',
  muscleGroupId: 'chest',
  level: 'intermediate',
  equipment: ['Штанга', 'Скамья'],
  description: 'Базовое упражнение для развития грудных мышц',
  tips: ['Держите локти под углом 45°', 'Не отрывайте таз от скамьи'],
  setsReps: '4x8-10',
  videoUrl: 'https://...',
};
```

### WorkoutPlan (План тренировок)
Недельный план тренировок для клиента.

```typescript
const plan: WorkoutPlan = {
  id: 'plan-1',
  clientId: 'client-1',
  days: [
    {
      dayNumber: 1,
      name: 'День 1: Грудь + Трицепс',
      exercises: [
        {
          exerciseId: 'bench-press',
          setsReps: '4x8',
          notes: 'Разминка обязательна',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
};
```

### WorkoutSession (Тренировочная сессия)
Запись о выполненной тренировке.

```typescript
const session: WorkoutSession = {
  id: 'session-1',
  clientId: 'client-1',
  date: new Date().toISOString(),
  planDayNumber: 1,
  exercises: [
    {
      exerciseId: 'bench-press',
      sets: [
        { reps: 10, weight: 60, completed: true },
        { reps: 8, weight: 70, completed: true },
      ],
      completed: true,
    },
  ],
  completed: true,
};
```

## 🎯 Использование

### Импорт типов

```typescript
// Импорт конкретных типов
import { Client, Exercise, WorkoutPlan } from '@/data/models';

// Импорт всех типов
import * as Models from '@/data/models';
```

### Type Guards (Проверка типов)

```typescript
function isClient(obj: any): obj is Client {
  return (
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'level' in obj
  );
}
```

### Partial типы для форм

```typescript
type ClientFormData = Partial<Client>;
type ExerciseFormData = Omit<Exercise, 'id'>;
```

## 🔄 Связи между типами

```
Client 1---* WorkoutPlan
Client 1---* WorkoutSession

WorkoutPlan 1---* WorkoutDay
WorkoutDay 1---* PlannedExercise

WorkoutSession 1---* CompletedExercise
CompletedExercise 1---* SetResult

Exercise 1---1 PlannedExercise.exerciseId
Exercise 1---1 CompletedExercise.exerciseId
MuscleGroup 1---* Exercise
```

## 📝 Соглашения

1. **ID всегда string** - для гибкости (можно использовать UUID, nanoid и т.д.)
2. **Даты в ISO формате** - `new Date().toISOString()`
3. **Опциональные поля помечены `?`** - для будущего расширения
4. **Используем enum-like types** - `'beginner' | 'intermediate' | 'advanced'`
