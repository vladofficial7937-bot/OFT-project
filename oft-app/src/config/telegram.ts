/**
 * Конфигурация Telegram-бота для авторизации
 * Задаётся через переменные окружения (Vite: VITE_*).
 */

/** Username бота без @ (например: myoft_bot). Используется в Login Widget и для Mini App. */
export const TELEGRAM_BOT_USERNAME =
  (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string) || 'onlineft_bot';

/** Проверка: задан ли кастомный бот (не дефолтный). */
export const hasCustomBot = !!import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

/** Bot token для отправки сообщений (VITE_TELEGRAM_BOT_TOKEN). */
export const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string;

/** Функция для отправки сообщения через Bot API. */
export async function sendTelegramMessage(chatId: string | number, text: string, options?: {
  reply_markup?: any;
  parse_mode?: 'Markdown' | 'HTML';
}): Promise<{ ok: boolean; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[Telegram] Bot token not configured');
    return { ok: false, error: 'Bot token not configured' };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const body = {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || 'Markdown',
      reply_markup: options?.reply_markup,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('[Telegram] Send message error:', result);
      return { ok: false, error: result.description };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Telegram] Send message failed:', error);
    return { ok: false, error: 'Network error' };
  }
}
