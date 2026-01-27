# Руководство по интеграции ИИ-функций

## 🎯 Быстрый старт

### 1. Использование диагностики клиента

В `AddClientWizard.tsx` после создания клиента:

```typescript
import { useAI } from '@/hooks/useAI';
import AIAssessmentResult from '@/components/ai/AIAssessmentResult';

function AddClientWizard() {
  const { assessClient, loading } = useAI();
  const [assessment, setAssessment] = useState<ClientAssessment | null>(null);

  const handleCreateClient = async () => {
    // ... создание клиента
    
    // Запуск диагностики
    const result = await assessClient(newClient);
    if (result) {
      setAssessment(result);
    }
  };

  return (
    <>
      {/* ... форма */}
      
      {assessment && (
        <AIAssessmentResult
          assessment={assessment}
          onClose={() => setAssessment(null)}
        />
      )}
    </>
  );
}
```

### 2. Использование рекомендаций по прогрессии

В `ExerciseDetail.tsx` или `TodayWorkout.tsx`:

```typescript
import { useAI } from '@/hooks/useAI';

function ExerciseDetail() {
  const { getProgression, loading } = useAI();
  const sessions = useStore(state => state.getClientSessions(clientId));
  const [progression, setProgression] = useState(null);

  const handleGetProgression = async () => {
    const result = await getProgression(exercise, sessions);
    if (result) {
      setProgression(result);
    }
  };

  return (
    <div>
      <button onClick={handleGetProgression} disabled={loading}>
        {loading ? 'Анализ...' : 'Получить рекомендации по нагрузке'}
      </button>
      
      {progression && (
        <div className="card">
          <h3>Рекомендация</h3>
          <p>{progression.reasoning}</p>
          {progression.suggestedWeight && (
            <p>Предлагаемый вес: {progression.suggestedWeight} кг</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 3. Использование персональных советов

В `Progress.tsx`:

```typescript
import { useAI } from '@/hooks/useAI';

function Progress() {
  const { getTips, loading } = useAI();
  const client = useStore(state => state.getCurrentClient());
  const sessions = useStore(state => state.getClientSessions(clientId));
  const [tips, setTips] = useState<PersonalizedTip[]>([]);

  useEffect(() => {
    if (client && sessions.length > 0) {
      getTips(client, sessions).then(setTips);
    }
  }, [client, sessions]);

  return (
    <div>
      {tips.map((tip, index) => (
        <div key={index} className="card">
          <h4>{tip.title}</h4>
          <p>{tip.content}</p>
          <span className={`badge-${tip.priority}`}>
            {tip.priority === 'high' ? 'Важно' : tip.priority === 'medium' ? 'Средне' : 'Низко'}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## 🔌 Подключение реального API

### Вариант 1: Прямое подключение (только для разработки)

```typescript
// src/features/ai/openAIService.ts
import OpenAI from 'openai';
import { AIService } from './aiService';
import type { GeneratePlanRequest, GeneratedPlan } from './types';

class OpenAIService implements AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY не установлен');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateWorkoutPlan(request: GeneratePlanRequest): Promise<GeneratedPlan> {
    const prompt = `Создай детальный план тренировок в формате JSON:
{
  "days": [
    {
      "dayNumber": 1,
      "name": "День 1: Грудь + Трицепс",
      "exercises": [
        {
          "exerciseId": "...",
          "setsReps": "4x8-10"
        }
      ]
    }
  ]
}

Клиент: ${request.client.name}
Цель: ${request.client.goal}
Уровень: ${request.client.level}
Оборудование: ${request.client.equipment.join(', ')}
Дней в неделю: ${request.daysPerWeek}
Длительность: ${request.sessionDuration} минут`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Преобразование в WorkoutPlan
    return {
      plan: {
        id: `plan-${Date.now()}`,
        clientId: request.client.id,
        days: response.days,
        createdAt: new Date().toISOString(),
      },
      explanation: 'План создан с помощью ИИ на основе ваших параметров',
    };
  }

  // ... остальные методы
}

// Замена в aiService.ts
export const aiService: AIService = new OpenAIService();
```

### Вариант 2: Backend Proxy (рекомендуется для production)

```typescript
// src/features/ai/apiService.ts
class APIService implements AIService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  async generateWorkoutPlan(request: GeneratePlanRequest): Promise<GeneratedPlan> {
    const response = await fetch(`${this.baseUrl}/ai/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // ... остальные методы
}
```

## 📝 Переменные окружения

Создайте `.env.local`:

```env
# OpenAI (для разработки)
VITE_OPENAI_API_KEY=sk-...

# Backend API (для production)
VITE_API_URL=https://api.yourdomain.com

# Feature flags
VITE_AI_ENABLED=true
VITE_AI_PLAN_GENERATION=true
```

## 🧪 Тестирование

```typescript
// src/features/ai/__tests__/aiService.test.ts
import { aiService } from '../aiService';
import { seedData } from '@/data/seeds';

describe('AIService', () => {
  it('should assess client', async () => {
    const client = seedData.clients[0];
    const assessment = await aiService.assessClient(client);
    
    expect(assessment).toHaveProperty('summary');
    expect(assessment).toHaveProperty('recommendations');
    expect(assessment.suggestedLevel).toBe(client.level);
  });

  it('should suggest progression', async () => {
    const exercise = seedData.exercises[0];
    const sessions = []; // mock sessions
    
    const suggestion = await aiService.suggestProgression(exercise, sessions);
    
    expect(suggestion).toHaveProperty('exerciseId');
    expect(suggestion).toHaveProperty('reasoning');
  });
});
```

## 🚨 Обработка ошибок

Все методы `useAI` автоматически обрабатывают ошибки и показывают toast:

```typescript
const { assessClient, error } = useAI();

// error будет автоматически установлен при ошибке
// Toast уведомление покажется автоматически
```

Для кастомной обработки:

```typescript
try {
  const result = await assessClient(client);
  // ...
} catch (err) {
  // Кастомная обработка
  console.error('Custom error handling:', err);
}
```

## 📊 Мониторинг использования

Добавьте аналитику:

```typescript
// src/features/ai/analytics.ts
export function trackAIFeature(feature: string, action: string) {
  // Google Analytics, Mixpanel, etc.
  if (window.gtag) {
    window.gtag('event', 'ai_feature', {
      feature,
      action,
    });
  }
}

// В useAI.ts
trackAIFeature('assessment', 'started');
```

## 🔐 Безопасность

1. **Никогда не коммитьте API ключи**
   - Добавьте `.env.local` в `.gitignore`
   - Используйте секреты в CI/CD

2. **Валидация входных данных**
   ```typescript
   if (!client.name || client.name.length < 2) {
     throw new Error('Имя клиента слишком короткое');
   }
   ```

3. **Rate Limiting**
   - Ограничьте количество запросов на пользователя
   - Используйте debounce для частых вызовов

4. **Обработка персональных данных**
   - Получайте согласие перед отправкой данных
   - Анонимизируйте где возможно
