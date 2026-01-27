# Запуск OFT в Replit

## Быстрый старт

1. **Импорт проекта**
   - Создай новый Repl → **Import from GitHub** (или загрузи папку `oft-app`).
   - Укажи корень проекта: папка **`oft-app`** (где лежат `package.json`, `vite.config.ts`).

2. **Установка зависимостей**
   - Replit обычно запускает `npm install` при первом открытии.
   - При необходимости выполни вручную: `npm install`.

3. **Запуск**
   - Нажми **Run** (или выполни `npm run dev`).
   - Приложение откроется во встроенном браузере Replit. Replit сам подставляет `PORT` и пробрасывает порт.

## Конфигурация

- **`.replit`** — команда запуска: `npm run dev`.
- **`replit.nix`** — Node.js 20.
- **`vite.config.ts`** — `server.host: true` и `server.port` из `process.env.PORT` (по умолчанию 5173), чтобы dev‑сервер был доступен снаружи.

## Скрипты

| Команда | Описание |
|--------|----------|
| `npm run dev` | Dev‑сервер (HMR) |
| `npm start` | То же, что `dev` |
| `npm run build` | Сборка в `dist/` |
| `npm run preview` | Просмотр production‑сборки |

## Деплой (Replit Deploy)

Для деплоя через Replit:

1. Собери проект: `npm run build`.
2. Раздавай статику из `dist/` (например, через `npx serve dist -s -l $PORT` или свой сервер).
3. В настройках Replit укажи **Run** команду для production (build + serve). Пример:

   ```bash
   npm run build && npx serve dist -s -l $PORT
   ```

   Пакет `serve` можно добавить: `npm i -D serve`.

## Переменные окружения

- **`PORT`** — Replit задаёт автоматически. Vite использует его для `dev` и `preview`.

## Возможные проблемы

- **Белый экран / 404** — убедись, что корень Repl — папка `oft-app` (где `package.json`).
- **Порт занят** — Replit сам выбирает порт; в логах будет указан актуальный URL.
- **Ошибки сборки** — выполни `npm run build` локально и исправь TypeScript/ESLint ошибки перед деплоем.
