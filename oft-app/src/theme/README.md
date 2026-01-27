# 🎨 Тема оформления OFT

Тёмная фитнес-тема для приложения Online Fitness Trainer.

## 🎨 Цветовая палитра

### Основные цвета

```typescript
import { COLORS } from '@/theme';

// Фон
COLORS.background    // #1a1a1a - Основной фон приложения
COLORS.card          // #2a2a2a - Фон карточек
COLORS.cardHover     // #333333 - Фон карточек при наведении

// Акцент
COLORS.accent        // #ff4444 - Основной акцентный цвет (красный)
COLORS.accentHover   // #ff6666 - Акцент при наведении

// Текст
COLORS.textPrimary   // #ffffff - Основной текст
COLORS.textSecondary // #b0b0b0 - Вторичный текст

// Границы
COLORS.border        // #3a3a3a - Цвет границ

// Статусы
COLORS.success       // #4ade80 - Успех
COLORS.warning       // #fbbf24 - Предупреждение
COLORS.error         // #ef4444 - Ошибка
COLORS.info          // #3b82f6 - Информация
```

### Использование в Tailwind

```tsx
// Фон
<div className="bg-background">...</div>
<div className="bg-card">...</div>

// Текст
<p className="text-textPrimary">Основной текст</p>
<p className="text-textSecondary">Вторичный текст</p>

// Акценты
<button className="bg-accent hover:bg-accentHover">Кнопка</button>

// Границы
<div className="border border-border">...</div>
```

## 🧱 Компоненты

### Карточки

```tsx
// Базовая карточка
<div className="card">
  <h3>Заголовок</h3>
  <p>Контент</p>
</div>

// Интерактивная карточка
<div className="card-hover">
  <h3>Кликабельная карточка</h3>
</div>
```

### Кнопки

```tsx
// Основная кнопка
<button className="btn-primary">
  Действие
</button>

// Вторичная кнопка
<button className="btn-secondary">
  Отмена
</button>
```

### Поля ввода

```tsx
<input 
  type="text" 
  className="input-field" 
  placeholder="Введите текст"
/>
```

### Бейджи

```tsx
// Основной бейдж
<span className="badge-primary">Активен</span>

// Вторичный бейдж
<span className="badge-secondary">Новичок</span>
```

### Разделитель

```tsx
<div className="divider" />
```

## 📱 Адаптивность

### Брейкпоинты

```typescript
import { BREAKPOINTS, MEDIA_QUERIES } from '@/theme';

// Значения брейкпоинтов
BREAKPOINTS.mobile   // 480px
BREAKPOINTS.tablet   // 768px
BREAKPOINTS.desktop  // 1024px

// Media queries
MEDIA_QUERIES.mobile      // (max-width: 480px)
MEDIA_QUERIES.tablet      // (max-width: 768px)
MEDIA_QUERIES.desktop     // (min-width: 1024px)
MEDIA_QUERIES.aboveMobile // (min-width: 481px)
MEDIA_QUERIES.aboveTablet // (min-width: 769px)
```

### Tailwind брейкпоинты

```tsx
// Адаптивные классы
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* На мобильных - 1 колонка */}
  {/* На планшетах - 2 колонки */}
  {/* На десктопе - 3 колонки */}
</div>

// Скрытие элементов
<div className="hidden md:block">
  {/* Видно только на планшетах и больше */}
</div>

<div className="block md:hidden">
  {/* Видно только на мобильных */}
</div>
```

## 🔤 Типографика

### Шрифт

Используется **Inter** от Google Fonts:
- 400 (Regular)
- 500 (Medium)
- 600 (SemiBold)
- 700 (Bold)

```tsx
// По умолчанию все тексты используют Inter
<p>Текст использует Inter</p>

// Жирность
<p className="font-normal">Regular (400)</p>
<p className="font-medium">Medium (500)</p>
<p className="font-semibold">SemiBold (600)</p>
<p className="font-bold">Bold (700)</p>
```

### Размеры

```tsx
<h1 className="text-4xl font-bold">Заголовок H1</h1>
<h2 className="text-3xl font-semibold">Заголовок H2</h2>
<h3 className="text-2xl font-semibold">Заголовок H3</h3>
<h4 className="text-xl font-semibold">Заголовок H4</h4>
<p className="text-base">Обычный текст</p>
<p className="text-sm">Маленький текст</p>
<p className="text-xs">Очень маленький текст</p>
```

## 🎭 Тени

```typescript
import { SHADOWS } from '@/theme';

SHADOWS.sm  // Маленькая тень
SHADOWS.md  // Средняя тень
SHADOWS.lg  // Большая тень
SHADOWS.xl  // Очень большая тень
```

```tsx
<div className="shadow-sm">Маленькая тень</div>
<div className="shadow-md">Средняя тень</div>
<div className="shadow-lg">Большая тень</div>
<div className="shadow-xl">Очень большая тень</div>
```

## 📐 Скругления

```typescript
import { BORDER_RADIUS } from '@/theme';

BORDER_RADIUS.sm   // 4px
BORDER_RADIUS.md   // 8px
BORDER_RADIUS.lg   // 12px (по умолчанию для карточек)
BORDER_RADIUS.xl   // 16px
BORDER_RADIUS.full // 9999px (круглый)
```

```tsx
<div className="rounded-sm">4px</div>
<div className="rounded-md">8px</div>
<div className="rounded-lg">12px</div>
<div className="rounded-card">12px (кастомный)</div>
<div className="rounded-xl">16px</div>
<div className="rounded-full">Круглый</div>
```

## 🎯 Примеры использования

### Карточка клиента

```tsx
<div className="card-hover">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-semibold">Иван Петров</h3>
    <span className="badge-primary">Активен</span>
  </div>
  
  <div className="space-y-2 text-sm text-textSecondary">
    <p>Цель: Набор массы</p>
    <p>Уровень: Средний</p>
  </div>
  
  <div className="divider" />
  
  <div className="flex gap-2">
    <button className="btn-primary flex-1">Тренировки</button>
    <button className="btn-secondary flex-1">Прогресс</button>
  </div>
</div>
```

### Форма добавления

```tsx
<div className="card">
  <h2 className="text-2xl font-bold mb-6">Новый клиент</h2>
  
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">Имя</label>
      <input type="text" className="input-field w-full" />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Цель</label>
      <select className="input-field w-full">
        <option>Похудение</option>
        <option>Набор массы</option>
      </select>
    </div>
    
    <div className="flex gap-2 pt-4">
      <button className="btn-primary flex-1">Сохранить</button>
      <button className="btn-secondary">Отмена</button>
    </div>
  </div>
</div>
```

### Список с разделителями

```tsx
<div className="card">
  <h3 className="text-xl font-bold mb-4">История тренировок</h3>
  
  <div className="space-y-0 divide-y divide-border">
    {sessions.map(session => (
      <div key={session.id} className="py-3 first:pt-0 last:pb-0">
        <div className="flex items-center justify-between">
          <span>{session.date}</span>
          <span className={session.completed ? 'text-success' : 'text-warning'}>
            {session.completed ? '✅' : '⏳'}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>
```

## 🚀 Best Practices

1. **Используйте готовые компоненты** - `.card`, `.btn-primary`, `.input-field`
2. **Соблюдайте иерархию текста** - `textPrimary` для важного, `textSecondary` для деталей
3. **Добавляйте переходы** - `transition-colors`, `transition-all`
4. **Используйте gap вместо margin** - `gap-4`, `space-y-4`
5. **Применяйте семантические классы** - вместо `text-[#ff4444]` используйте `text-accent`
