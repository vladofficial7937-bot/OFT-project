import type {
  Client,
  WorkoutPlan,
  WorkoutSession,
} from '../../data/models';
import type { Exercise } from '../../data/models/types';
import type {
  ClientAssessment,
  GeneratePlanRequest,
  GeneratedPlan,
  FormAnalysis,
  ProgressionSuggestion,
  PersonalizedTip,
  ChatMessage,
  ChatContext,
} from './types';

export interface AIService {
  // 1. Диагностика клиента при создании
  assessClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<ClientAssessment>;

  // 2. Генерация плана тренировок
  generateWorkoutPlan(request: GeneratePlanRequest): Promise<GeneratedPlan>;

  // 3. Корректировка существующего плана
  adjustPlan(plan: WorkoutPlan, feedback: string): Promise<GeneratedPlan>;

  // 4. Рекомендации по нагрузке для конкретного упражнения
  suggestProgression(
    exercise: Exercise,
    history: WorkoutSession[]
  ): Promise<ProgressionSuggestion>;

  // 5. Анализ техники по видео (будущее)
  analyzeForm(videoUrl: string, exerciseId: string): Promise<FormAnalysis>;

  // 6. Персональные советы на основе прогресса
  getPersonalizedTips(
    client: Client,
    sessions: WorkoutSession[]
  ): Promise<PersonalizedTip[]>;

  // 7. Чат с ИИ-тренером
  chat(messages: ChatMessage[], context: ChatContext): Promise<ChatMessage>;

  // 8. Анализ восстановления (по частоте тренировок)
  analyzeRecovery(sessions: WorkoutSession[]): Promise<{
    status: 'undertraining' | 'optimal' | 'overtraining';
    recommendation: string;
  }>;
}

// ЗАГЛУШКА-РЕАЛИЗАЦИЯ
class MockAIService implements AIService {
  private delay(ms: number = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async assessClient(
    client: Omit<Client, 'id' | 'createdAt'>
  ): Promise<ClientAssessment> {
    await this.delay(1500);

    // Заглушка с правдоподобными данными
    const level = client.fitnessLevel ?? client.level ?? 'beginner';
    return {
      summary: `На основе анкеты клиента "${client.name}" рекомендуется начать с ${
        level === 'beginner'
          ? 'базовых'
          : level === 'intermediate'
          ? 'умеренно сложных'
          : 'интенсивных'
      } тренировок.`,
      recommendations: [
        `Цель "${client.goal}" достижима при регулярных тренировках 3-4 раза в неделю`,
        `Доступное оборудование: ${client.equipment ?? 'зал'}. Позволяет составить эффективный план`,
        'Рекомендуется начать с адаптационного периода 2-3 недели',
      ],
      warnings:
        (client.fitnessLevel ?? client.level) === 'beginner'
          ? [
              'Обратите внимание на технику выполнения упражнений',
              'Не гонитесь за весами в первые недели',
            ]
          : [],
      suggestedLevel: (client.fitnessLevel ?? client.level ?? 'beginner') as 'beginner' | 'intermediate' | 'advanced',
      estimatedCalories: client.goal === 'weight_loss' ? 300 : 400,
    };
  }

  async generateWorkoutPlan(
    _request: GeneratePlanRequest
  ): Promise<GeneratedPlan> {
    await this.delay(2000);

    throw new Error(
      'ИИ-генерация плана пока недоступна. Эта функция будет активирована после подключения OpenAI API.'
    );
  }

  async adjustPlan(_plan: WorkoutPlan, _feedback: string): Promise<GeneratedPlan> {
    await this.delay(1500);

    throw new Error('ИИ-корректировка плана пока недоступна.');
  }

  async suggestProgression(
    exercise: Exercise,
    _history: WorkoutSession[]
  ): Promise<ProgressionSuggestion> {
    await this.delay(1000);

    // Заглушка: WorkoutSession не содержит exercises в текущей модели
    return {
      exerciseId: exercise.id,
      suggestedReps: 12,
      reasoning: 'Начните с умеренного количества повторений для освоения техники',
      confidence: 0.7,
    };
  }

  async analyzeForm(
    _videoUrl: string,
    _exerciseId: string
  ): Promise<FormAnalysis> {
    await this.delay(2000);

    throw new Error(
      'ИИ-анализ техники по видео пока недоступен. Требуется интеграция с Computer Vision API.'
    );
  }

  async getPersonalizedTips(
    _client: Client,
    sessions: WorkoutSession[]
  ): Promise<PersonalizedTip[]> {
    await this.delay(1200);

    // Простые советы на основе данных
    const tips: PersonalizedTip[] = [];

    if (sessions.length < 3) {
      tips.push({
        category: 'motivation',
        title: 'Отличное начало!',
        content:
          'Вы на правильном пути. Регулярность — ключ к успеху. Старайтесь тренироваться 3-4 раза в неделю.',
        priority: 'high',
        actionable: true,
      });
    }

    const completionRate =
      sessions.filter((s) => s.completed).length / sessions.length;
    if (completionRate < 0.7) {
      tips.push({
        category: 'motivation',
        title: 'Завершайте тренировки полностью',
        content: `Вы завершаете только ${Math.round(
          completionRate * 100
        )}% тренировок. Попробуйте уменьшить объём, но выполнять план целиком.`,
        priority: 'medium',
        actionable: true,
      });
    }

    tips.push({
      category: 'recovery',
      title: 'Не забывайте про отдых',
      content:
        'Мышцы растут во время восстановления. Обеспечьте 7-8 часов сна и 1-2 дня полного отдыха в неделю.',
      priority: 'medium',
      actionable: true,
    });

    return tips;
  }

  async chat(
    messages: ChatMessage[],
    _context: ChatContext
  ): Promise<ChatMessage> {
    await this.delay(1500);

    const lastMessage = messages[messages.length - 1];

    return {
      role: 'assistant',
      content: `Это демо-ответ. После подключения ИИ я смогу анализировать ваш прогресс и давать персональные советы.\n\nВы написали: "${lastMessage.content}"`,
      timestamp: new Date().toISOString(),
    };
  }

  async analyzeRecovery(sessions: WorkoutSession[]): Promise<{
    status: 'undertraining' | 'optimal' | 'overtraining';
    recommendation: string;
  }> {
    await this.delay(800);

    const lastWeek = sessions.filter((s) => {
      const date = new Date(s.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    });

    if (lastWeek.length < 2) {
      return {
        status: 'undertraining',
        recommendation:
          'Рекомендуется увеличить частоту тренировок до 3-4 раз в неделю для достижения результатов.',
      };
    } else if (lastWeek.length > 6) {
      return {
        status: 'overtraining',
        recommendation:
          'Слишком частые тренировки могут привести к перетренированности. Добавьте дни отдыха.',
      };
    }

    return {
      status: 'optimal',
      recommendation: 'Частота тренировок оптимальна. Продолжайте в том же духе!',
    };
  }
}

// Экспорт singleton
export const aiService: AIService = new MockAIService();

// Флаг для проверки доступности ИИ
export const AI_FEATURES_ENABLED = {
  assessment: true, // Диагностика доступна (с заглушкой)
  planGeneration: false, // Генерация плана недоступна
  planAdjustment: false,
  progression: true, // Простая логика без ИИ
  formAnalysis: false, // Видео-анализ недоступен
  tips: true, // Простые советы
  chat: false, // Чат недоступен
  recovery: true, // Простой анализ
};
