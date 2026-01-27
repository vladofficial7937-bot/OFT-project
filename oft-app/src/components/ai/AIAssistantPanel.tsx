import { useState } from 'react';
import { AI_FEATURES_ENABLED } from '../../features/ai/aiService';
import Spinner from '../ui/Spinner';

interface AIAssistantPanelProps {
  type: 'assessment' | 'plan' | 'form' | 'tips' | 'progression';
  context?: any;
  onResult?: (result: any) => void;
}

export default function AIAssistantPanel({
  type,
  context: _context,
  onResult: _onResult,
}: AIAssistantPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading] = useState(false);

  const featureEnabled = {
    assessment: AI_FEATURES_ENABLED.assessment,
    plan: AI_FEATURES_ENABLED.planGeneration,
    form: AI_FEATURES_ENABLED.formAnalysis,
    tips: AI_FEATURES_ENABLED.tips,
    progression: AI_FEATURES_ENABLED.progression,
  }[type];

  const config = {
    assessment: {
      title: 'ИИ-диагностика клиента',
      description:
        'Искусственный интеллект проанализирует анкету клиента и даст рекомендации по началу тренировок',
      icon: '🔍',
      buttonText: 'Запустить диагностику',
    },
    plan: {
      title: 'ИИ-генерация плана',
      description:
        'Создайте персональный план тренировок на основе целей, уровня и оборудования клиента',
      icon: '🤖',
      buttonText: 'Создать план с ИИ',
    },
    form: {
      title: 'ИИ-анализ техники',
      description:
        'Загрузите видео выполнения упражнения, и ИИ проанализирует технику и даст советы по улучшению',
      icon: '📹',
      buttonText: 'Анализировать видео',
    },
    tips: {
      title: 'ИИ-советы',
      description:
        'Персональные рекомендации на основе вашего прогресса, частоты тренировок и выполнения плана',
      icon: '💡',
      buttonText: 'Получить советы',
    },
    progression: {
      title: 'ИИ-рекомендации по нагрузке',
      description:
        'Анализ вашей истории выполнения упражнения и рекомендации по увеличению веса или повторений',
      icon: '📈',
      buttonText: 'Получить рекомендации',
    },
  }[type];

  const handleActivate = () => {
    if (!featureEnabled) return;

    setIsExpanded(true);
    // Здесь будет вызов ИИ через useAI hook
  };

  return (
    <div
      className={`card border-2 ${
        featureEnabled
          ? 'border-accent/30 bg-accent/5'
          : 'border-dashed border-border bg-card'
      }`}
    >
      {/* ШАПКА */}
      <div className="flex items-start gap-4 mb-4">
        <span className="text-4xl">{config.icon}</span>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">{config.title}</h3>
            {!featureEnabled && (
              <span className="text-xs bg-border text-textSecondary px-2 py-1 rounded">
                Скоро
              </span>
            )}
            {featureEnabled && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                Beta
              </span>
            )}
          </div>

          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {config.description}
          </p>
        </div>
      </div>

      {/* КНОПКА */}
      {!isExpanded && (
        <button
          onClick={handleActivate}
          disabled={!featureEnabled || loading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
            featureEnabled
              ? 'bg-accent hover:bg-accentHover text-white'
              : 'bg-border text-textSecondary cursor-not-allowed opacity-50'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              <span>Обработка...</span>
            </span>
          ) : (
            config.buttonText
          )}
        </button>
      )}

      {/* РАЗВЁРНУТЫЙ КОНТЕНТ (placeholder) */}
      {isExpanded && featureEnabled && (
        <div className="mt-4 pt-4 border-t border-border">
          <p
            className="text-textSecondary text-sm mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ИИ-функция активна. Здесь будет отображаться результат работы ИИ.
          </p>
          <button
            onClick={() => setIsExpanded(false)}
            className="btn-secondary w-full"
          >
            Свернуть
          </button>
        </div>
      )}

      {/* НЕДОСТУПНО */}
      {!featureEnabled && (
        <p
          className="text-xs text-textSecondary mt-3 text-center"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Эта функция появится после подключения ИИ API
        </p>
      )}
    </div>
  );
}
