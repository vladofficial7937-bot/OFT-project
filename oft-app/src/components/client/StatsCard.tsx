/**
 * Компонент карточки статистики
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export default function StatsCard({
  title,
  value,
  icon,
  subtitle,
  trend,
}: StatsCardProps) {
  return (
    <div className="card animate-fade-in min-w-0">
      <div className="flex items-start justify-between mb-2 min-w-0">
        <span
          className="text-sm truncate flex-1 min-w-0"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {title}
        </span>
        <span className="text-xl sm:text-2xl shrink-0 ml-1">{icon}</span>
      </div>

      <div
        className="text-2xl sm:text-3xl font-bold mb-1 break-words"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {value}
      </div>

      {subtitle && (
        <p
          className="text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {subtitle}
        </p>
      )}

      {trend && (
        <div
          className={`text-xs mt-2 flex items-center gap-1 ${
            trend.direction === 'up'
              ? 'text-green-500'
              : trend.direction === 'down'
              ? 'text-red-500'
              : ''
          }`}
          style={
            trend.direction === 'neutral'
              ? { color: 'var(--color-text-secondary)' }
              : {}
          }
        >
          {trend.direction === 'up' && '↑'}
          {trend.direction === 'down' && '↓'}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
