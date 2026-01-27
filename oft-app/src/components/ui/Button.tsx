/**
 * Переиспользуемый компонент кнопки с loading состоянием
 */

import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  loading,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'danger':
        return 'px-6 py-3 font-semibold transition-colors text-white';
      default:
        return 'btn-primary';
    }
  };

  const getDangerStyle = (): CSSProperties | undefined => {
    if (variant === 'danger') {
      return {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--glass-radius)',
        boxShadow: '0 0 15px #FF0000, 0 4px 12px rgba(0, 0, 0, 0.4)',
      };
    }
    return undefined;
  };

  return (
    <button
      type="button"
      className={`${getVariantClass()} ${className} transition-transform ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
      }`}
      style={getDangerStyle()}
      disabled={!!loading || !!disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" />
          <span>Загрузка...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
