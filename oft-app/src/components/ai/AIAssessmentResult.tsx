/**
 * Компонент для отображения результата ИИ-диагностики клиента
 */

import type { ClientAssessment } from '../../features/ai/types';

interface AIAssessmentResultProps {
  assessment: ClientAssessment;
  onClose?: () => void;
}

export default function AIAssessmentResult({
  assessment,
  onClose,
}: AIAssessmentResultProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return '#22c55e';
      case 'intermediate':
        return '#eab308';
      case 'advanced':
        return '#ef4444';
      default:
        return 'var(--color-accent)';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Новичок';
      case 'intermediate':
        return 'Средний уровень';
      case 'advanced':
        return 'Продвинутый';
      default:
        return level;
    }
  };

  return (
    <div className="card animate-fade-in">
      {/* ЗАГОЛОВОК */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔍</span>
          <h2 className="text-2xl font-bold">Результаты диагностики</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-2xl text-textSecondary hover:text-textPrimary transition-colors"
            aria-label="Закрыть"
          >
            ×
          </button>
        )}
      </div>

      {/* КРАТКОЕ РЕЗЮМЕ */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
          {assessment.summary}
        </p>
      </div>

      {/* РЕКОМЕНДУЕМЫЙ УРОВЕНЬ */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Рекомендуемый уровень</h3>
        <div className="flex items-center gap-3">
          <span
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: getLevelColor(assessment.suggestedLevel) }}
          >
            {getLevelText(assessment.suggestedLevel)}
          </span>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Ориентировочный расход калорий: ~{assessment.estimatedCalories} ккал за тренировку
          </span>
        </div>
      </div>

      {/* РЕКОМЕНДАЦИИ */}
      {assessment.recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>✅</span>
            <span>Рекомендации</span>
          </h3>
          <ul className="space-y-2">
            {assessment.recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <span className="text-accent mt-1">•</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ПРЕДУПРЕЖДЕНИЯ */}
      {assessment.warnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>Важно</span>
          </h3>
          <ul className="space-y-2">
            {assessment.warnings.map((warning, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg border-l-4"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderLeftColor: 'var(--color-warning)',
                }}
              >
                <span className="text-warning mt-1">⚠</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {warning}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ФУТЕР */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
          💡 Эти рекомендации основаны на базовом анализе. После подключения ИИ они станут более
          персонализированными.
        </p>
      </div>
    </div>
  );
}
