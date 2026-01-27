/**
 * Карточка клиента для TrainerDashboard
 */

import { useNavigate } from 'react-router-dom';
import type { Client, FitnessLevel } from '../../data/models';
import { Equipment } from '../../data/models';
import { ROUTES } from '../../router/routes';

interface ClientCardProps {
  client: Client;
}

const LEVEL_BADGES: Record<FitnessLevel, { text: string; color: string }> = {
  beginner: { text: 'Новичок', color: 'success' },
  intermediate: { text: 'Средний', color: 'warning' },
  advanced: { text: 'Продвинутый', color: 'accent' },
};

const EQUIPMENT_LABELS: Record<string, string> = {
  [Equipment.Gym]: 'Тренажерный зал',
  [Equipment.Home]: 'Дома',
};

export default function ClientCard({ client }: ClientCardProps) {
  const navigate = useNavigate();

  const handleOpenProfile = () => {
    navigate(ROUTES.TRAINER.CLIENT_PROFILE(client.id));
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const level = client.level ?? client.fitnessLevel ?? 'beginner';
  const levelBadge = LEVEL_BADGES[level];
  const equipmentLabel = EQUIPMENT_LABELS[client.equipment] ?? client.equipment;

  return (
    <div className="card-hover animate-fade-in" onClick={handleOpenProfile}>
      <div className="space-y-4">
        {/* Заголовок */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{client.name}</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {client.goal}
            </p>
          </div>
          <span
            className="badge text-white"
            style={{ backgroundColor: `var(--color-${levelBadge.color})` }}
          >
            {levelBadge.text}
          </span>
        </div>

        {/* Информация */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--color-text-secondary)' }}>Начало:</span>
            <span>{client.createdAt ? formatDate(client.createdAt) : '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--color-text-secondary)' }}>Оборудование:</span>
            <span className="text-right">{equipmentLabel}</span>
          </div>
        </div>

        {/* Разделитель */}
        <div className="divider" />

        {/* Кнопка */}
        <button
          className="btn-primary w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenProfile();
          }}
        >
          Открыть профиль
        </button>
      </div>
    </div>
  );
}
