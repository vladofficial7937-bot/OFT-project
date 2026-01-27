# ИИ-функции OFT

Архитектура для интеграции ИИ-агентов в приложение OFT.

## 📁 Структура

```
src/features/ai/
├── types.ts          # TypeScript типы для ИИ
├── aiService.ts      # Сервис с заглушками и интерфейсом
└── README.md         # Документация

src/hooks/
└── useAI.ts          # React hook для работы с ИИ

src/components/ai/
├── AIAssistantPanel.tsx      # Панель активации ИИ-функций
└── AIAssessmentResult.tsx    # Отображение результатов диагностики
```

## 🎯 Доступные функции

### ✅ Реализовано (с заглушками)

- **Диагностика клиента** (`assessment`) - анализ анкеты и рекомендации
- **Рекомендации по прогрессии** (`progression`) - простой анализ истории
- **Персональные советы** (`tips`) - базовые советы на основе данных
- **Анализ восстановления** (`recovery`) - оценка частоты тренировок

### 🚧 В разработке (заглушки с ошибками)

- **Генерация плана** (`planGeneration`) - требует OpenAI API
- **Корректировка плана** (`planAdjustment`) - требует OpenAI API
- **Анализ техники по видео** (`formAnalysis`) - требует Computer Vision API
- **Чат с ИИ-тренером** (`chat`) - требует OpenAI API

## 🔌 Интеграция

### Шаг 1: Подключение OpenAI API

Создайте файл `src/features/ai/openAIService.ts`:

```typescript
import { aiService } from './aiService';
import { GeneratePlanRequest, GeneratedPlan } from './types';
import OpenAI from 'openai';

class OpenAIService extends aiService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    super();
    this.openai = new OpenAI({ apiKey });
  }

  async generateWorkoutPlan(request: GeneratePlanRequest): Promise<GeneratedPlan> {
    const prompt = `Создай план тренировок для клиента:
Имя: ${request.client.name}
Цель: ${request.client.goal}
Уровень: ${request.client.level}
Оборудование: ${request.client.equipment.join(', ')}
Дней в неделю: ${request.daysPerWeek}
Длительность: ${request.sessionDuration} минут`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    // Парсинг ответа и создание WorkoutPlan
    // ...
  }
}
```

### Шаг 2: Обновление флагов

В `src/features/ai/aiService.ts`:

```typescript
export const AI_FEATURES_ENABLED = {
  assessment: true,
  planGeneration: true,  // ✅ Включено после интеграции
  planAdjustment: true,  // ✅ Включено после интеграции
  progression: true,
  formAnalysis: false,  // Требует Computer Vision
  tips: true,
  chat: true,           // ✅ Включено после интеграции
  recovery: true,
};
```

### Шаг 3: Использование в компонентах

```typescript
import { useAI } from '@/hooks/useAI';

function MyComponent() {
  const { assessClient, loading, features } = useAI();

  const handleAssess = async () => {
    const result = await assessClient(clientData);
    if (result) {
      // Показать результат
    }
  };

  return (
    <button onClick={handleAssess} disabled={!features.assessment || loading}>
      {loading ? 'Анализ...' : 'Запустить диагностику'}
    </button>
  );
}
```

## 📝 API Reference

### `useAI()` Hook

```typescript
const {
  // Методы
  assessClient,      // Диагностика клиента
  generatePlan,      // Генерация плана
  getProgression,    // Рекомендации по прогрессии
  getTips,           // Персональные советы
  analyzeRecovery,   // Анализ восстановления

  // Состояние
  loading,           // boolean
  error,             // string | null

  // Доступность
  features,          // AI_FEATURES_ENABLED
} = useAI();
```

### `AIService` Interface

Все методы возвращают `Promise` и могут выбрасывать ошибки:

- `assessClient(client)` → `Promise<ClientAssessment>`
- `generateWorkoutPlan(request)` → `Promise<GeneratedPlan>`
- `suggestProgression(exercise, history)` → `Promise<ProgressionSuggestion>`
- `getPersonalizedTips(client, sessions)` → `Promise<PersonalizedTip[]>`
- `analyzeRecovery(sessions)` → `Promise<{status, recommendation}>`

## 🎨 UI Компоненты

### `AIAssistantPanel`

Панель для активации ИИ-функций:

```tsx
<AIAssistantPanel
  type="assessment"  // 'assessment' | 'plan' | 'form' | 'tips' | 'progression'
  context={{ client }}
  onResult={(result) => console.log(result)}
/>
```

### `AIAssessmentResult`

Отображение результатов диагностики:

```tsx
<AIAssessmentResult
  assessment={assessmentResult}
  onClose={() => setShowResult(false)}
/>
```

## 🔐 Безопасность

⚠️ **Важно**: При интеграции реальных API:

1. **Никогда не храните API ключи в коде**
   - Используйте переменные окружения: `import.meta.env.VITE_OPENAI_API_KEY`
   - Для production используйте backend proxy

2. **Ограничьте доступ к API**
   - Используйте rate limiting
   - Валидируйте входные данные
   - Обрабатывайте ошибки gracefully

3. **Защита данных клиентов**
   - Не отправляйте персональные данные без согласия
   - Используйте анонимизацию где возможно

## 📊 Мониторинг

Рекомендуется добавить:

- Логирование вызовов API
- Метрики использования функций
- Отслеживание ошибок
- Аналитика производительности

## 🚀 Roadmap

- [ ] Интеграция OpenAI для генерации планов
- [ ] Интеграция Computer Vision для анализа техники
- [ ] Чат-бот с ИИ-тренером
- [ ] Персонализация на основе ML-моделей
- [ ] Прогнозирование прогресса
- [ ] Рекомендации по питанию

## 📚 Примеры использования

См. `src/pages/trainer/AddClientWizard.tsx` для примера использования диагностики при создании клиента.
