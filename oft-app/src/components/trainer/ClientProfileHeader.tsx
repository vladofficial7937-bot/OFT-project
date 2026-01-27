/**
 * Шапка профиля клиента
 */

import { Link } from 'react-router-dom';
import { ROUTES } from '../../router/routes';
import type { Client } from '../../data/models';

interface ClientProfileHeaderProps {
  client: Client;
}

export default function ClientProfileHeader({ client }: ClientProfileHeaderProps) {
  // Генерация инициалов
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Цвет аватара (можно случайный или по ID)
  const avatarColors = [
    'var(--color-accent)',
    '#3b82f6',
    'var(--color-success)',
    '#a855f7',
  ];
  const avatarColor =
    avatarColors[client.name.length % avatarColors.length];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getLevelText = (level: string) => {
    const levels: Record<string, string> = {
      beginner: 'Новичок',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
    };
    return levels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      beginner: {
        bg: 'rgba(74, 222, 128, 0.2)',
        text: 'var(--color-success)',
      },
      intermediate: {
        bg: 'rgba(251, 191, 36, 0.2)',
        text: 'var(--color-warning)',
      },
      advanced: {
        bg: 'rgba(239, 68, 68, 0.2)',
        text: 'var(--color-error)',
      },
    };
    return colors[level] || { bg: 'var(--color-card)', text: 'var(--color-text-primary)' };
  };

  const level = client.level ?? client.fitnessLevel ?? 'beginner';
  const levelStyle = getLevelColor(level);

  return (
    <div className="card mb-6">
      <Link
        to={ROUTES.TRAINER.DASHBOARD}
        className="inline-flex items-center gap-2 mb-4 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--color-accent)' }}
      >
        ← Назад к клиентам
      </Link>

      <div className="flex items-start gap-6">
        {/* Аватар */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {getInitials(client.name)}
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{client.name}</h1>

          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: levelStyle.bg,
                color: levelStyle.text,
              }}
            >
              {getLevelText(level)}
            </span>

            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: 'rgba(255, 68, 68, 0.2)',
                color: 'var(--color-accent)',
              }}
            >
              {client.goal}
            </span>
          </div>

          <p
            className="text-sm mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            С нами с {client.createdAt ? formatDate(client.createdAt) : '—'}
          </p>

          {client.age && (
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Возраст: {client.age} лет
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
