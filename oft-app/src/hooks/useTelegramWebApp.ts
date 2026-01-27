/**
 * Хук для работы с Telegram Mini App (Web App).
 * Возвращает флаг isMiniApp и хелперы; вне Telegram — no-op.
 */

import { useMemo } from 'react';
import {
  isMiniApp,
  hapticTap,
  hapticNotification,
  hapticSelection,
  getTelegramTheme,
  getTelegramWebApp,
  type TelegramTheme,
  type TelegramWebApp as TWA,
} from '../lib/telegramWebApp';

export interface UseTelegramWebAppReturn {
  /** Запущено внутри Telegram Mini App */
  isMiniApp: boolean;
  /** Тема Telegram (light / dark) */
  theme: TelegramTheme;
  /** Экземпляр Web App (MainButton, BackButton и т.д.) */
  webApp: TWA | null;
  /** Лёгкий тап (кнопки, навигация) */
  hapticTap: (style?: 'light' | 'medium' | 'heavy') => void;
  /** Уведомление (успех / ошибка / предупреждение) */
  hapticNotification: (type: 'error' | 'success' | 'warning') => void;
  /** Смена выбора (табы) */
  hapticSelection: () => void;
}

export function useTelegramWebApp(): UseTelegramWebAppReturn {
  const miniApp = isMiniApp();
  const theme = getTelegramTheme();
  const webApp = getTelegramWebApp();

  return useMemo(
    () => ({
      isMiniApp: miniApp,
      theme,
      webApp,
      hapticTap: (style = 'light') => hapticTap(style),
      hapticNotification,
      hapticSelection,
    }),
    [miniApp, theme, webApp]
  );
}
