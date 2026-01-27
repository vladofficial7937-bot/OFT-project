import { useState } from 'react';
import { aiService, AI_FEATURES_ENABLED } from '../features/ai/aiService';
import { useAppStore } from '../store/useAppStore';
import type { Client, Exercise, WorkoutSession } from '../data/models';
import type {
  ClientAssessment,
  GeneratePlanRequest,
  ProgressionSuggestion,
  PersonalizedTip,
} from '../features/ai/types';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addToast = useAppStore((s) => s.addToast);

  // Обёртка для обработки ошибок
  const withErrorHandling = async <T,>(
    fn: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fn();

      if (successMessage) {
        addToast({ type: 'success', message: successMessage });
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Произошла ошибка';
      setError(errorMessage);
      addToast({ type: 'error', message: errorMessage });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 1. Диагностика клиента
  const assessClient = async (
    client: Omit<Client, 'id' | 'createdAt'>
  ): Promise<ClientAssessment | null> => {
    if (!AI_FEATURES_ENABLED.assessment) {
      addToast({
        type: 'info',
        message: 'ИИ-диагностика пока недоступна',
      });
      return null;
    }

    return withErrorHandling(
      () => aiService.assessClient(client),
      'Диагностика завершена'
    );
  };

  // 2. Генерация плана
  const generatePlan = async (request: GeneratePlanRequest) => {
    if (!AI_FEATURES_ENABLED.planGeneration) {
      addToast({
        type: 'info',
        message: 'ИИ-генерация плана появится в следующей версии',
      });
      return null;
    }

    return withErrorHandling(() => aiService.generateWorkoutPlan(request));
  };

  // 3. Рекомендации по прогрессии
  const getProgression = async (
    exercise: Exercise,
    history: WorkoutSession[]
  ): Promise<ProgressionSuggestion | null> => {
    if (!AI_FEATURES_ENABLED.progression) return null;

    return withErrorHandling(() =>
      aiService.suggestProgression(exercise, history)
    );
  };

  // 4. Персональные советы
  const getTips = async (
    client: Client,
    sessions: WorkoutSession[]
  ): Promise<PersonalizedTip[] | null> => {
    if (!AI_FEATURES_ENABLED.tips) return null;

    return withErrorHandling(() =>
      aiService.getPersonalizedTips(client, sessions)
    );
  };

  // 5. Анализ восстановления
  const analyzeRecovery = async (sessions: WorkoutSession[]) => {
    if (!AI_FEATURES_ENABLED.recovery) return null;

    return withErrorHandling(() => aiService.analyzeRecovery(sessions));
  };

  return {
    // Методы
    assessClient,
    generatePlan,
    getProgression,
    getTips,
    analyzeRecovery,

    // Состояние
    loading,
    error,

    // Доступность функций
    features: AI_FEATURES_ENABLED,
  };
}
