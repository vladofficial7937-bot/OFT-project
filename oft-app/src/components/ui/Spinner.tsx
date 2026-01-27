/**
 * Компонент спиннера загрузки
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`${sizes[size]} border-t-transparent rounded-full animate-spin ${className}`}
      style={{
        borderColor: 'var(--color-accent)',
        borderTopColor: 'transparent',
      }}
      aria-label="Загрузка"
    />
  );
}
