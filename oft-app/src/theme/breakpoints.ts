/**
 * Брейкпоинты для адаптивного дизайна
 */

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

/**
 * Media queries для использования в styled-components или других CSS-in-JS решениях
 */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `(max-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  aboveMobile: `(min-width: ${BREAKPOINTS.mobile + 1}px)`,
  aboveTablet: `(min-width: ${BREAKPOINTS.tablet + 1}px)`,
} as const;

/**
 * Tailwind breakpoints для использования в классах
 * sm: 640px, md: 768px, lg: 1024px, xl: 1280px
 */
export const TAILWIND_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
