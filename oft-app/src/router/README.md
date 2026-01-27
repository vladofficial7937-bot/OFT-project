# 🗺️ Роутинг приложения

Навигация в приложении OFT с использованием React Router v6.

## 📍 Маршруты

### Главная страница

- `/` - **StartPage** - Выбор режима работы (тренер/клиент)

### Режим тренера

| Путь | Компонент | Описание |
|------|-----------|----------|
| `/trainer` | TrainerDashboard | Панель тренера со списком клиентов |
| `/trainer/add-client` | AddClientWizard | Мастер добавления нового клиента |
| `/trainer/client/:id` | ClientProfile | Профиль клиента с планом тренировок |

### Режим клиента

| Путь | Компонент | Описание |
|------|-----------|----------|
| `/client` | ClientHome | Главная страница клиента |
| `/client/muscle-map` | MuscleMap | Карта мышц для выбора упражнений |
| `/client/exercises` | ExerciseCatalog | Каталог всех упражнений |
| `/client/exercises/:id` | ExerciseDetail | Детальная информация об упражнении |
| `/client/today` | TodayWorkout | Тренировка на сегодня |
| `/client/progress` | Progress | Статистика и прогресс |

## 🔗 Использование констант

Импортируйте константы маршрутов из `routes.ts`:

```typescript
import { ROUTES } from '@/router/routes';
import { useNavigate } from 'react-router-dom';

// Навигация
const navigate = useNavigate();
navigate(ROUTES.TRAINER.DASHBOARD);

// Динамические маршруты
navigate(ROUTES.TRAINER.CLIENT_PROFILE('client-123'));
navigate(ROUTES.CLIENT.EXERCISE_DETAIL('ex-bench-press'));
```

## 🧭 Навигация в компонентах

### Link компонент

```tsx
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';

<Link to={ROUTES.CLIENT.EXERCISES}>
  Упражнения
</Link>
```

### useNavigate хук

```tsx
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.CLIENT.TODAY);
  };

  return <button onClick={handleClick}>К тренировке</button>;
}
```

### Программная навигация с данными

```tsx
const navigate = useNavigate();

// С состоянием
navigate(ROUTES.TRAINER.DASHBOARD, {
  state: { fromAddClient: true }
});

// Назад
navigate(-1);

// Замена текущего маршрута
navigate(ROUTES.HOME, { replace: true });
```

## 🎣 Получение параметров

### useParams - параметры из URL

```tsx
import { useParams } from 'react-router-dom';

function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  
  return <div>Клиент ID: {id}</div>;
}
```

### useSearchParams - query параметры

```tsx
import { useSearchParams } from 'react-router-dom';

function ExerciseCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filter = searchParams.get('filter');
  
  const handleFilter = (value: string) => {
    setSearchParams({ filter: value });
  };
}
```

### useLocation - текущая локация

```tsx
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  
  console.log(location.pathname); // '/client/exercises'
  console.log(location.state);    // Состояние из navigate
}
```

## 🛡️ Защищённые маршруты

Пример защищённого маршрута для тренера:

```tsx
import { Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

function TrainerRoute({ children }: { children: React.ReactNode }) {
  const userMode = useAppStore((state) => state.userMode);
  
  if (userMode !== 'trainer') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Использование
<Route 
  path="/trainer" 
  element={
    <TrainerRoute>
      <TrainerDashboard />
    </TrainerRoute>
  } 
/>
```

## 📱 Навигация с мобильных меню

```tsx
const menuItems = [
  { path: ROUTES.CLIENT.HOME, icon: '🏠', label: 'Главная' },
  { path: ROUTES.CLIENT.EXERCISES, icon: '💪', label: 'Упражнения' },
  { path: ROUTES.CLIENT.TODAY, icon: '📅', label: 'Сегодня' },
  { path: ROUTES.CLIENT.PROGRESS, icon: '📊', label: 'Прогресс' },
];

{menuItems.map(item => (
  <Link key={item.path} to={item.path} className="nav-item">
    {item.icon} {item.label}
  </Link>
))}
```

## 🔄 Хлебные крошки

```tsx
import { useLocation, Link } from 'react-router-dom';

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  return (
    <div className="flex gap-2">
      <Link to="/">Главная</Link>
      {pathnames.map((name, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        return (
          <span key={path}>
            / <Link to={path}>{name}</Link>
          </span>
        );
      })}
    </div>
  );
}
```

## ⚙️ Конфигурация

Все маршруты настроены в `App.tsx`:

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<StartPage />} />
    <Route path="/trainer" element={<TrainerDashboard />} />
    {/* ... */}
  </Routes>
</BrowserRouter>
```

## 🚧 404 страница

Добавьте catch-all маршрут:

```tsx
<Route path="*" element={<NotFound />} />
```

## 📝 Best Practices

1. **Используйте константы** из `routes.ts` вместо хардкода путей
2. **Типизируйте параметры** при использовании `useParams<{ id: string }>()`
3. **Используйте относительные пути** когда это возможно
4. **Добавляйте loading состояния** при навигации
5. **Обрабатывайте ошибки** навигации
