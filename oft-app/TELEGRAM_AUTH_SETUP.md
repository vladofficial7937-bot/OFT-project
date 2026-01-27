# Настройка авторизации через Telegram

Описанные шаги нужны, чтобы включить вход через Telegram (Login Widget на сайте и авто-вход в Mini App).

## Чеклист настройки

- [ ] **Бот создан** в [@BotFather](https://t.me/BotFather) (`/newbot`), сохранён username без `@`
- [ ] **`.env`** в корне `oft-app`: `VITE_TELEGRAM_BOT_USERNAME=твой_бот` — перезапуск `npm run dev` после изменений
- [ ] **Деплой:** в Environment Variables сборки добавлена `VITE_TELEGRAM_BOT_USERNAME`
- [ ] **Login Widget (веб):** у бота задан домен через [@BotFather](https://t.me/BotFather) → `/setdomain`
- [ ] **Mini App:** в боте настроены Menu Button / Web App URL (URL вашего фронтенда)

---

## 1. Создание бота

Если бот ещё не создан:

1. Открой [@BotFather](https://t.me/BotFather) в Telegram.
2. Отправь `/newbot`, введи имя и username бота (например `@myoft_bot`).
3. Сохрани **username без «@»** (например `myoft_bot`) — он понадобится ниже.

## 2. Переменная окружения

Создай файл `.env` в корне проекта `oft-app` (можно скопировать из `.env.example`):

```env
VITE_TELEGRAM_BOT_USERNAME=твой_бот_username
```

Подставь username своего бота **без @**. Пример: `VITE_TELEGRAM_BOT_USERNAME=myoft_bot`.

- Перезапусти dev-сервер (`npm run dev`) после изменения `.env`.
- **Деплой (Vercel, Netlify и т.п.):** добавь `VITE_TELEGRAM_BOT_USERNAME` в настройки Environment Variables сборки, иначе в проде будет использоваться бот по умолчанию (`onlineft_bot`) и виджет может не работать.

## 3. Login Widget (вход на сайте)

Виджет «Войти через Telegram» показывается на странице `/auth/telegram` в **продакшене** (не в dev и не в Mini App).

Чтобы он работал:

1. Напиши [@BotFather](https://t.me/BotFather) команду **`/setdomain`**.
2. Выбери своего бота.
3. Укажи **домен сайта**, на котором открыта форма входа (например `yourapp.com` или `yourapp.vercel.app`).  
   **Без этого** виджет не отобразится или вернёт ошибку.

Для локальной разработки можно использовать [ngrok](https://ngrok.com): поднять тоннель на `localhost`, получить домен (например `abc123.ngrok.io`) и указать его в `/setdomain`.

## 4. Mini App (приложение внутри Telegram)

Если OFT открывается как **Mini App** из меню бота:

1. В [@BotFather](https://t.me/BotFather): **Bot Settings → Menu Button** или **Configure Web App**.
2. Укажи URL твоего приложения (например `https://yourapp.com` или хостинг, где развёрнут фронтенд).
3. При первом запуске OFT показывает **выбор роли** («Я Тренер» / «Я Клиент»), используя `WebApp.initDataUnsafe.user`. Роль сохраняется в **Supabase** (таблица `profiles`) и в Zustand. При следующих открытиях — запрос к `profiles` по id → роль в Zustand → редирект в кабинет.

## 4.1. Supabase и таблица `profiles`

OFT использует Supabase для хранения ролей (Mini App):

- **Таблица `profiles`** создаётся вручную. Код её не создаёт (избегаем 42P07).
- Ожидаемые колонки: `id` (text, Telegram user id), `role` (text: `client` | `trainer`), при необходимости `first_name`, `username`, `updated_at`.
- При старте: `initDataUnsafe.user` → `SELECT` из `profiles` по `id`. Нет записи → UI выбора роли → `INSERT`. Есть запись → роль в Zustand, редирект.
- **RLS:** для anon-ключа нужны политики `SELECT` и `INSERT` на `profiles`, иначе запросы будут отклоняться.

## 5. Проверка

- **Dev**: на `/auth/telegram` доступны «Войти через Telegram (Dev Mode)» и «Продолжить без авторизации». Реальный виджет в dev не загружается.
- **Продакшен, веб**: на `/auth/telegram` должен отображаться Login Widget. Домен обязан быть задан через `/setdomain`.
- **Mini App**: при первом запуске — выбор роли, затем редирект в дашборд тренера или главную клиента. При повторном открытии — мгновенный вход по сохранённой сессии.

## 6. Безопасность (опционально)

Данные от виджета содержат поле `hash`. В продакшене его нужно проверять на бэкенде (HMAC-SHA256 с токеном бота). Токен **не должен** храниться во фронтенде. Сейчас OFT использует только клиентскую логику; для полноценной проверки нужен свой API.

---

**Итог:** задай `VITE_TELEGRAM_BOT_USERNAME` в `.env`, настрой `/setdomain` для домена и при необходимости Web App URL у бота.

---

## Краткая справка BotFather

| Команда / действие | Назначение |
|--------------------|------------|
| `/newbot` | Создать бота, получить username |
| `/setdomain` | Домен для Login Widget (обязательно для кнопки «Войти через Telegram» на сайте) |
| **Bot Settings → Menu Button** / **Configure Web App** | URL Mini App при открытии из бота |
