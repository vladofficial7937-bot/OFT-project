/**
 * Инициализация Telegram Mini App при монтировании.
 * ready(), expand(), MainButton.hide(). Верхняя панель — safe-area-inset-top.
 */

import { useEffect } from 'react';
import { initTelegramWebApp, isMiniApp, getTelegramWebApp } from '../lib/telegramWebApp';

export default function MiniAppInit() {
  useEffect(() => {
    if (!isMiniApp()) return;
    initTelegramWebApp(); // ready(), expand(), colors, enableClosingConfirmation
    getTelegramWebApp()?.MainButton?.hide();
  }, []);
  return null;
}
