/**
 * Telegram Mini App (Web App) — интеграция и хелперы.
 * Используется только при запуске внутри Telegram.
 */

export type TelegramTheme = 'light' | 'dark';

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  MainButton: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    enable: () => void;
    disable: () => void;
    setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  colorScheme: TelegramTheme;
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ type: 'ok' | 'close' | 'cancel'; text?: string; id?: string }> }) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  showAlert: (message: string) => void;
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
    auth_date?: number;
    hash?: string;
  };
  isExpanded: boolean;
  platform: string;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

const OFT_BG = '#0a0a0a';
const OFT_HEADER = '#1e1e1e';

function getWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

/** Запущено ли приложение внутри Telegram Mini App (есть initData от Telegram) */
export function isMiniApp(): boolean {
  const wa = getWebApp();
  if (!wa) return false;
  const initData = (wa as any).initData;
  return typeof initData === 'string' && initData.length > 0;
}

/** Инициализация Mini App: ready, expand, цвета, отключение свайпа вниз для закрытия */
export function initTelegramWebApp(): void {
  const wa = getWebApp();
  if (!wa) return;

  wa.ready();
  wa.expand();
  wa.setBackgroundColor(OFT_BG);
  wa.setHeaderColor(OFT_HEADER);
  wa.enableClosingConfirmation(); // запрос при свайпе вниз
}

/** Тактильная отдача при тапе (кнопки, навигация) */
export function hapticTap(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  getWebApp()?.HapticFeedback?.impactOccurred(style);
}

/** Успех / ошибка / предупреждение */
export function hapticNotification(type: 'error' | 'success' | 'warning'): void {
  getWebApp()?.HapticFeedback?.notificationOccurred(type);
}

/** Смена выбора (табы, переключатели) */
export function hapticSelection(): void {
  getWebApp()?.HapticFeedback?.selectionChanged();
}

/** Тема Telegram (light / dark) */
export function getTelegramTheme(): TelegramTheme {
  return getWebApp()?.colorScheme ?? 'dark';
}

/** Экземпляр Web App (для MainButton, BackButton и т.д.) */
export function getTelegramWebApp(): TelegramWebApp | null {
  return getWebApp();
}
