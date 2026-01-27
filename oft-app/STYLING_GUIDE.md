# 🎨 Руководство по стилизации

## Цветовые переменные

В проекте используются CSS-переменные для цветов темы:

```css
--color-background: #1a1a1a;
--color-card: #2a2a2a;
--color-primary: #ff4444;
--color-text-primary: #ffffff;
--color-text-secondary: #b0b0b0;
```

## Использование цветов

### В React компонентах (inline стили)

```tsx
<div style={{ color: 'var(--color-primary)' }}>
  Красный текст
</div>

<div style={{ backgroundColor: 'var(--color-card)' }}>
  Карточка с фоном
</div>
```

### В CSS файлах

```css
.custom-element {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}
```

## Готовые компоненты

### Карточка (.card)

```tsx
<div className="card">
  <h2>Заголовок</h2>
  <p>Контент карточки</p>
</div>
```

### Основная кнопка (.btn-primary)

```tsx
<button className="btn-primary">
  Нажми меня
</button>
```

### Вторичная кнопка (.btn-secondary)

```tsx
<button className="btn-secondary">
  Отмена
</button>
```

## Стандартные Tailwind классы

Используйте стандартные классы Tailwind для layout и spacing:

```tsx
<div className="flex items-center justify-center min-h-screen">
  <div className="space-y-4 p-6">
    <h1 className="text-4xl font-bold">Заголовок</h1>
    <p className="text-lg">Параграф</p>
  </div>
</div>
```

## Комбинирование

```tsx
<div className="card max-w-md mx-auto p-6">
  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
    Заголовок
  </h2>
  <p style={{ color: 'var(--color-text-secondary)' }}>
    Описание
  </p>
  <button className="btn-primary w-full mt-4">
    Действие
  </button>
</div>
```

## Адаптивность

Используйте брейкпоинты Tailwind:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Контент */}
</div>
```

## Анимации и переходы

```tsx
<button className="transition-all duration-200 hover:opacity-80 active:scale-95">
  Кнопка с анимацией
</button>
```
