/**
 * Утилиты для аналитики (Google Analytics, Yandex Metrika и т.д.)
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

/**
 * Инициализация Google Analytics
 */
export const initAnalytics = () => {
  const gaId = import.meta.env.VITE_GA_ID;
  
  if (!gaId || !import.meta.env.PROD) {
    return;
  }

  // Google Analytics 4
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', {
      page_path: window.location.pathname,
    });
  `;
  document.head.appendChild(script2);

  const w = window as Window & { dataLayer?: unknown[] };
  w.gtag = function(...args: unknown[]) {
    if (w.dataLayer) {
      w.dataLayer.push(args);
    }
  };
};

/**
 * Отслеживание события
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (!import.meta.env.PROD) {
    console.log('Analytics Event:', { category, action, label, value });
    return;
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * Отслеживание просмотра страницы
 */
export const trackPageView = (path: string) => {
  if (!import.meta.env.PROD) {
    console.log('Page View:', path);
    return;
  }

  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_ID || '', {
      page_path: path,
    });
  }
};

/**
 * Отслеживание ошибок
 */
export const trackError = (error: Error, _errorInfo?: unknown) => {
  trackEvent('Error', 'Exception', error.message);
  
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: error.toString(),
      fatal: false,
    });
  }
};
