# Настройка Telegram интеграции для OFT

## 1. Создание Telegram бота

1. Напишите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните Bot Token

## 2. Настройка переменных окружения

### Frontend (.env)
```env
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
```

### Backend (backend/.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_bot_token
PORT=3001
```

## 3. Создание таблицы telegram_users

Выполните SQL скрипт `backend/telegram_users.sql` в вашей Supabase базе данных.

## 4. Настройка webhook

1. Запустите backend: `cd backend && npm install && npm start`
2. Настройте webhook URL в BotFather: `/setwebhook https://your-domain.com/webhook/telegram`

## 5. Запуск

1. Frontend: `npm run dev`
2. Backend: `cd backend && npm run dev`

## Как работает

1. Пользователь пишет `/start` боту - сохраняется в таблице `telegram_users`
2. Тренер вводит username в приложении - отправляется приглашение
3. Пользователь нажимает "Принять" - добавляется как клиент
4. Пользователь нажимает "Отклонить" - приглашение удаляется