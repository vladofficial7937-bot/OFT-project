# 🏪 Zustand Store

Централизованное управление состоянием приложения OFT.

## 📋 Структура состояния

### State (Данные)

```typescript
{
  // Режим работы
  currentMode: 'trainer' | 'client' | null,
  selectedClientId: string | null,
  
  // Данные приложения
  clients: Client[],
  exercises: Exercise[],
  muscleGroups: MuscleGroup[],
  workoutPlans: WorkoutPlan[],
  workoutSessions: WorkoutSession[],
}
```

### Actions (Действия)

#### Инициализация
- `initData()` - загрузить данные из localStorage

#### Режим работы
- `setMode(mode)` - переключить режим (trainer/client)
- `selectClient(id)` - выбрать клиента

#### Тренер - Клиенты
- `addClient(data)` - добавить клиента
- `updateClient(id, updates)` - обновить клиента
- `deleteClient(id)` - удалить клиента (+ каскадное удаление)

#### Тренер - Планы
- `createWorkoutPlan(clientId, days)` - создать план
- `updateWorkoutPlan(plan)` - обновить план

#### Клиент - Тренировки
- `getTodayWorkout()` - получить тренировку на сегодня
- `startWorkoutSession(dayNumber)` - начать тренировку
- `completeExercise(sessionId, exerciseId, sets)` - отметить упражнение
- `completeSession(sessionId)` - завершить тренировку
- `getProgressData()` - получить данные прогресса

#### Селекторы
- `getCurrentClient()` - текущий клиент
- `getClientWorkoutPlan(clientId)` - план клиента
- `getExercisesByMuscle(muscleGroupId)` - упражнения по группе мышц
- `getClientSessions(clientId)` - сессии клиента

## 🚀 Использование

### Базовое использование

```typescript
import { useStore } from '@/store';

function MyComponent() {
  // Получение состояния
  const clients = useStore((state) => state.clients);
  const currentMode = useStore((state) => state.currentMode);
  
  // Получение действий
  const setMode = useStore((state) => state.setMode);
  const addClient = useStore((state) => state.addClient);
  
  return (
    <div>
      <button onClick={() => setMode('trainer')}>
        Режим тренера
      </button>
      <div>Клиентов: {clients.length}</div>
    </div>
  );
}
```

### Селекторы для оптимизации

```typescript
// ❌ Плохо - подписывается на все изменения state
const state = useStore();

// ✅ Хорошо - подписывается только на clients
const clients = useStore((state) => state.clients);

// ✅ Отлично - используем встроенный селектор
const currentClient = useStore((state) => state.getCurrentClient());
```

### Множественные подписки

```typescript
function ClientDashboard() {
  const {
    currentClient,
    workoutPlan,
    sessions,
    getTodayWorkout,
  } = useStore((state) => ({
    currentClient: state.getCurrentClient(),
    workoutPlan: state.selectedClientId 
      ? state.getClientWorkoutPlan(state.selectedClientId)
      : null,
    sessions: state.selectedClientId
      ? state.getClientSessions(state.selectedClientId)
      : [],
    getTodayWorkout: state.getTodayWorkout,
  }));
  
  const todayWorkout = getTodayWorkout();
  
  return (
    <div>
      <h2>{currentClient?.name}</h2>
      <div>План: {workoutPlan?.days.length} дней</div>
      <div>Тренировок: {sessions.length}</div>
      {todayWorkout && (
        <div>Сегодня: {todayWorkout.name}</div>
      )}
    </div>
  );
}
```

## 📝 Примеры сценариев

### Сценарий 1: Режим тренера - Добавление клиента

```typescript
function AddClientForm() {
  const addClient = useStore((state) => state.addClient);
  const [name, setName] = useState('');
  
  const handleSubmit = () => {
    const newClient = addClient({
      name,
      goal: 'Набор массы',
      level: 'beginner',
      equipment: ['Гантели'],
    });
    
    console.log('Клиент добавлен:', newClient);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">Добавить</button>
    </form>
  );
}
```

### Сценарий 2: Создание плана тренировок

```typescript
function CreatePlanButton({ clientId }: { clientId: string }) {
  const createWorkoutPlan = useStore((state) => state.createWorkoutPlan);
  const exercises = useStore((state) => state.exercises);
  
  const handleCreatePlan = () => {
    const chestExercises = exercises.filter(ex => ex.muscleGroupId === 'chest');
    const backExercises = exercises.filter(ex => ex.muscleGroupId === 'back');
    
    const plan = createWorkoutPlan(clientId, [
      {
        dayNumber: 1,
        name: 'День 1: Грудь',
        exercises: chestExercises.slice(0, 3).map(ex => ({
          exerciseId: ex.id,
          setsReps: '4x8-10',
        })),
      },
      {
        dayNumber: 2,
        name: 'День 2: Спина',
        exercises: backExercises.slice(0, 3).map(ex => ({
          exerciseId: ex.id,
          setsReps: '4x8-10',
        })),
      },
    ]);
    
    console.log('План создан:', plan);
  };
  
  return (
    <button onClick={handleCreatePlan}>
      Создать план
    </button>
  );
}
```

### Сценарий 3: Режим клиента - Тренировка

```typescript
function WorkoutScreen() {
  const {
    getTodayWorkout,
    startWorkoutSession,
    completeExercise,
    completeSession,
  } = useStore((state) => ({
    getTodayWorkout: state.getTodayWorkout,
    startWorkoutSession: state.startWorkoutSession,
    completeExercise: state.completeExercise,
    completeSession: state.completeSession,
  }));
  
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  
  const todayWorkout = getTodayWorkout();
  
  const handleStart = () => {
    if (todayWorkout) {
      const session = startWorkoutSession(todayWorkout.dayNumber);
      setCurrentSession(session);
    }
  };
  
  const handleCompleteExercise = (exerciseId: string) => {
    if (currentSession) {
      completeExercise(currentSession.id, exerciseId, [
        { reps: 10, weight: 60, completed: true },
        { reps: 8, weight: 70, completed: true },
      ]);
    }
  };
  
  const handleFinish = () => {
    if (currentSession) {
      completeSession(currentSession.id);
      setCurrentSession(null);
    }
  };
  
  if (!todayWorkout) {
    return <div>Нет тренировки на сегодня</div>;
  }
  
  return (
    <div>
      <h2>{todayWorkout.name}</h2>
      {!currentSession ? (
        <button onClick={handleStart}>Начать тренировку</button>
      ) : (
        <div>
          {todayWorkout.exercises.map(ex => (
            <div key={ex.exerciseId}>
              <button onClick={() => handleCompleteExercise(ex.exerciseId)}>
                Выполнено
              </button>
            </div>
          ))}
          <button onClick={handleFinish}>Завершить</button>
        </div>
      )}
    </div>
  );
}
```

### Сценарий 4: Просмотр прогресса

```typescript
function ProgressView() {
  const {
    getCurrentClient,
    getProgressData,
    getClientSessions,
  } = useStore((state) => ({
    getCurrentClient: state.getCurrentClient,
    getProgressData: state.getProgressData,
    getClientSessions: state.getClientSessions,
  }));
  
  const client = getCurrentClient();
  const progress = getProgressData();
  const sessions = client ? getClientSessions(client.id) : [];
  
  if (!client) {
    return <div>Клиент не выбран</div>;
  }
  
  return (
    <div>
      <h2>Прогресс: {client.name}</h2>
      <div>Всего тренировок: {progress?.totalSessions || 0}</div>
      <div>Завершено: {progress?.completedSessions || 0}</div>
      <div>Последняя: {progress?.lastWorkoutDate || 'Нет данных'}</div>
      
      <h3>История</h3>
      {sessions.map(session => (
        <div key={session.id}>
          {new Date(session.date).toLocaleDateString()} - 
          {session.completed ? '✅' : '⏳'}
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Синхронизация с localStorage

Store автоматически синхронизируется с localStorage:

- **При изменении данных** → обновляется localStorage
- **При инициализации** → загружаются данные из localStorage
- **Каскадные операции** → автоматически обрабатываются (например, удаление клиента удаляет его планы и сессии)

## 🎯 Особенности

### Immer middleware

Store использует `immer` для удобного изменения состояния:

```typescript
// Можно писать "мутирующий" код - immer сделает его иммутабельным
set((state) => {
  state.clients.push(newClient);
  state.selectedClientId = newClient.id;
});

// Вместо:
set({
  clients: [...state.clients, newClient],
  selectedClientId: newClient.id,
});
```

### Автоматическая инициализация

Store автоматически инициализируется при первом импорте:

```typescript
// В useStore.ts
if (typeof window !== 'undefined') {
  useStore.getState().initData();
}
```

### Вычисляемые селекторы

Селекторы всегда возвращают актуальные данные:

```typescript
const getCurrentClient = () => {
  const { selectedClientId, clients } = get();
  return clients.find(c => c.id === selectedClientId) || null;
};
```

## ⚡ Оптимизация производительности

### Избегайте лишних ре-рендеров

```typescript
// ❌ Плохо - компонент перерендерится при любом изменении store
function MyComponent() {
  const store = useStore();
  return <div>{store.clients.length}</div>;
}

// ✅ Хорошо - только при изменении clients
function MyComponent() {
  const clientsCount = useStore((state) => state.clients.length);
  return <div>{clientsCount}</div>;
}
```

### Используйте shallow equality

```typescript
import { shallow } from 'zustand/shallow';

const { clients, exercises } = useStore(
  (state) => ({
    clients: state.clients,
    exercises: state.exercises,
  }),
  shallow
);
```

## 📊 Режимы работы

### Режим тренера

```typescript
setMode('trainer');
selectClient('client-anna');
// Теперь доступны действия тренера
addClient({...});
createWorkoutPlan(clientId, days);
```

### Режим клиента

```typescript
setMode('client');
selectClient('client-anna');
// Теперь доступны действия клиента
const todayWorkout = getTodayWorkout();
startWorkoutSession(dayNumber);
```

## 🔧 Отладка

```typescript
// Получить полное состояние
const state = useStore.getState();
console.log(state);

// Подписаться на изменения
const unsubscribe = useStore.subscribe(
  (state) => console.log('State changed:', state)
);

// Отписаться
unsubscribe();
```
