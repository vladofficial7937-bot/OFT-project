/**
 * Индикатор шагов для Wizard
 */

interface WizardStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function WizardStepIndicator({
  currentStep,
  totalSteps,
  stepTitles,
}: WizardStepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isFuture = step > currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Кружок с номером */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    transition-colors
                    ${isCompleted ? 'text-white' : ''}
                    ${isCurrent ? 'text-white' : ''}
                    ${isFuture ? '' : ''}
                  `}
                  style={{
                    backgroundColor: isCompleted
                      ? 'var(--color-success)'
                      : isCurrent
                      ? 'var(--color-accent)'
                      : 'var(--color-card)',
                    border: isFuture ? '2px solid var(--color-border)' : 'none',
                    color: isFuture ? 'var(--color-text-secondary)' : '',
                  }}
                >
                  {isCompleted ? '✓' : step}
                </div>
                <span
                  className="text-xs mt-2 text-center font-medium"
                  style={{
                    color: isCurrent
                      ? 'var(--color-accent)'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {stepTitles[index]}
                </span>
              </div>

              {/* Линия между шагами */}
              {index < totalSteps - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2"
                  style={{
                    backgroundColor:
                      step < currentStep
                        ? 'var(--color-success)'
                        : 'var(--color-border)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
