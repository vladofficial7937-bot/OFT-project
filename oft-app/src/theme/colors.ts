/**
 * Цветовая схема приложения OFT
 * Современная палитра с градиентами и плавными переходами
 */

export const COLORS = {
  // Основные цвета фона
  background: '#0a0a0a',
  backgroundSecondary: '#111111',
  card: 'rgba(30, 30, 30, 0.8)',
  cardHover: 'rgba(40, 40, 40, 0.9)',
  cardGlass: 'rgba(30, 30, 30, 0.6)',

  // Акцентные цвета с градиентами
  accent: '#ff4444',
  accentHover: '#ff6666',
  accentGradient: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 50%, #ff4444 100%)',
  accentGradientHover: 'linear-gradient(135deg, #ff5555 0%, #ff7b7b 50%, #ff5555 100%)',

  // Цвета текста
  textPrimary: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',

  // Границы
  border: 'rgba(255, 68, 68, 0.2)',
  borderHover: 'rgba(255, 68, 68, 0.4)',

  // Дополнительные цвета (для статусов и т.д.)
  success: '#4ade80',
  successGradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  warning: '#fbbf24',
  warningGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  error: '#ef4444',
  errorGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  info: '#3b82f6',
  infoGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',

  // Эффекты свечения
  glow: 'rgba(255, 68, 68, 0.3)',
  glowStrong: 'rgba(255, 68, 68, 0.5)',
} as const;

/**
 * Тени для карточек и элементов
 */
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
  glow: '0 0 20px rgba(255, 68, 68, 0.3), 0 0 40px rgba(255, 68, 68, 0.2)',
  glowStrong: '0 0 30px rgba(255, 68, 68, 0.5), 0 0 60px rgba(255, 68, 68, 0.3)',
} as const;

/**
 * Радиусы скругления
 */
export const BORDER_RADIUS = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const;
