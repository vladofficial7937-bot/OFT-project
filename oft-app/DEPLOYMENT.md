# Деплой OFT MVP

Руководство по развёртыванию приложения OFT в production.

## 📋 Предварительные требования

- Node.js 18+ установлен
- npm или yarn установлен
- Git репозиторий настроен

## 🚀 Варианты деплоя

### 1. Vercel (Рекомендуется)

Vercel идеально подходит для React приложений с автоматическим деплоем.

#### Установка Vercel CLI

```bash
npm i -g vercel
```

#### Логин

```bash
vercel login
```

#### Деплой

```bash
# Первый деплой (preview)
vercel

# Production деплой
vercel --prod
```

#### Настройка через веб-интерфейс

1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите ваш GitHub/GitLab репозиторий
3. Настройки:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Environment Variables

В настройках проекта добавьте:
- `VITE_APP_VERSION=0.1.0`
- `VITE_AI_ENABLED=false`
- `VITE_API_URL=https://your-api.com` (если есть)
- `VITE_GA_ID=G-XXXXXXXXXX` (если используете Google Analytics)

#### Настройка домена

1. В настройках проекта → Domains
2. Добавьте ваш домен
3. Следуйте инструкциям по настройке DNS

---

### 2. Netlify

#### Установка Netlify CLI

```bash
npm i -g netlify-cli
```

#### Логин

```bash
netlify login
```

#### Build settings

Создайте `netlify.toml` в корне проекта:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Деплой

```bash
# Первый деплой
netlify deploy

# Production деплой
netlify deploy --prod --dir=dist
```

#### Через веб-интерфейс

1. Зайдите на [netlify.com](https://netlify.com)
2. Подключите репозиторий
3. Настройки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

---

### 3. GitHub Pages

#### Установка gh-pages

```bash
npm i -D gh-pages
```

#### Обновление package.json

```json
{
  "homepage": "https://YOUR_USERNAME.github.io/oft-app",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### Настройка base в vite.config.ts

```typescript
export default defineConfig({
  base: '/oft-app/', // Имя вашего репозитория
  // ... остальные настройки
});
```

#### Деплой

```bash
npm run deploy
```

#### Настройка GitHub Actions (опционально)

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

### 4. Docker

#### Создание Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Создание nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Build и запуск

```bash
# Build образ
docker build -t oft-app .

# Запуск контейнера
docker run -d -p 80:80 --name oft-app oft-app
```

#### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## 🔧 Environment Variables

Создайте `.env.production`:

```env
VITE_APP_VERSION=0.1.0
VITE_AI_ENABLED=false
VITE_API_URL=https://api.yoursite.com
VITE_GA_ID=G-XXXXXXXXXX
VITE_ENV=production
```

---

## ✅ Проверка после деплоя

1. **Проверьте главную страницу**: Открывается ли `/`
2. **Проверьте роутинг**: Работают ли `/trainer` и `/client`
3. **Проверьте 404**: Несуществующие страницы должны показывать правильную ошибку
4. **Проверьте консоль**: Нет ли ошибок в браузере
5. **Проверьте производительность**: Lighthouse score > 80
6. **Проверьте мобильную версию**: Адаптивность на разных устройствах

---

## 📊 Мониторинг

### Google Analytics

После деплоя проверьте, что события отслеживаются:
- Просмотры страниц
- Клики по кнопкам
- Ошибки

### Error Tracking

Рекомендуется подключить:
- **Sentry**: Для отслеживания ошибок
- **LogRocket**: Для записи сессий пользователей

---

## 🔄 Continuous Deployment

### Vercel / Netlify

Автоматический деплой при push в `main` ветку.

### GitHub Actions

См. пример выше в разделе GitHub Pages.

---

## 🐛 Troubleshooting

### Проблема: Белый экран после деплоя

**Решение**: Проверьте base path в `vite.config.ts` и правильность путей к assets.

### Проблема: 404 на всех страницах кроме `/`

**Решение**: Настройте redirects на `/index.html` (SPA routing).

### Проблема: Ошибки CORS

**Решение**: Настройте CORS на backend или используйте proxy в Vite.

---

## 📚 Дополнительные ресурсы

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Docker Documentation](https://docs.docker.com)
