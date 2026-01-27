/**
 * Компонент таймера отдыха между упражнениями
 */

interface RestTimerProps {
  seconds: number;
  onSkip: () => void;
}

export default function RestTimer({ seconds, onSkip }: RestTimerProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 bottom-[calc(5.5rem+var(--safe-area-inset-bottom))] md:bottom-8"
      style={{
        animation: 'slide-up 0.3s ease-out',
      }}
    >
      <div
        className="px-6 py-4 rounded-full shadow-lg flex items-center gap-4"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'white',
        }}
      >
        <span className="text-2xl font-bold">
          ⏱️ {minutes}:{secs.toString().padStart(2, '0')}
        </span>
        <span className="text-sm">Отдыхайте</span>
        <button
          onClick={onSkip}
          className="px-4 py-1 rounded-full text-sm transition-colors hover:opacity-80"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          Пропустить
        </button>
      </div>
    </div>
  );
}
