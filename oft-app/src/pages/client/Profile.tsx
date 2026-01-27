/**
 * Профиль клиента
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCoachingStore } from '../../store/useCoachingStore';
import { ROUTES } from '../../router/routes';
import Button from '../../components/ui/Button';
import { ClientGoal, Equipment, Contraindication } from '../../data/models/types';
import TrainerSelectModal from '../../components/client/TrainerSelectModal';

// Конфигурация противопоказаний
const CONTRAINDICATION_OPTIONS: Array<{
  value: Contraindication;
  label: string;
  icon: string;
  description: string;
}> = [
  { value: Contraindication.Back, label: 'Проблемы со спиной', icon: '🦴', description: 'Грыжи, протрузии, боли в пояснице' },
  { value: Contraindication.Knees, label: 'Проблемы с коленями', icon: '🦵', description: 'Артрит, травмы связок, боли' },
  { value: Contraindication.Shoulders, label: 'Проблемы с плечами', icon: '💪', description: 'Вывихи, тендинит, импинджмент' },
  { value: Contraindication.Wrists, label: 'Проблемы с запястьями', icon: '✋', description: 'Туннельный синдром, травмы' },
  { value: Contraindication.Neck, label: 'Проблемы с шеей', icon: '🧣', description: 'Остеохондроз, боли, зажимы' },
  { value: Contraindication.Heart, label: 'Сердечно-сосудистые', icon: '❤️', description: 'Гипертония, аритмия, другие проблемы' },
];

export default function Profile() {
  const navigate = useNavigate();
  
  const activeClient = useAppStore((s) => s.activeClient);
  const clients = useAppStore((s) => s.clients || []);
  const updateClientContraindications = useAppStore((s) => s.updateClientContraindications);
  const addToast = useAppStore((s) => s.addToast);
  const appLogout = useAppStore((s) => s.logout);
  const authLogout = useAuthStore((s) => s.logout);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);

  const trainers = useCoachingStore((s) => s.trainers);
  const createRequest = useCoachingStore((s) => s.createRequest);
  const getRequestForClient = useCoachingStore((s) => s.getRequestForClient);
  const getTrainerById = useCoachingStore((s) => s.getTrainerById);
  const cancelRequestForClient = useCoachingStore((s) => s.cancelRequestForClient);
  
  const client = activeClient || clients[0];
  const request = client && client.id ? getRequestForClient(client.id) : null;
  const pendingTrainer = request?.status === 'pending' ? getTrainerById(request.trainerId) : null;

  // Обработчик выхода
  const handleLogout = () => {
    authLogout();
    appLogout();
    addToast({ type: 'info', message: 'Вы вышли из системы' });
    setShowLogoutConfirm(false);
    navigate(ROUTES.HOME);
  };

  // Обработчик изменения противопоказаний
  const handleContraindicationChange = (contraindication: Contraindication, checked: boolean) => {
    if (!client) return;
    
    const currentContraindications = client.contraindications || [];
    let newContraindications: Contraindication[];
    
    if (checked) {
      newContraindications = [...currentContraindications, contraindication];
    } else {
      newContraindications = currentContraindications.filter((c) => c !== contraindication);
    }
    
    updateClientContraindications(client.id, newContraindications);
    
    // Показываем уведомление
    addToast({
      type: 'success',
      message: checked 
        ? 'Ограничение добавлено. Мы будем предупреждать о неподходящих упражнениях.' 
        : 'Ограничение снято.',
    });
  };

  // Если клиент не найден
  if (!client) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
        <div className="card text-center py-16 animate-fade-in">
          <div className="text-7xl mb-6">👤</div>
          <h2 className="text-2xl font-bold mb-3">Клиент не выбран</h2>
          <p className="mb-8 text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Выберите клиента в настройках
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT.HOME)}>
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  // Функция для форматирования цели клиента
  const getGoalLabel = (goal: ClientGoal): string => {
    const labels: Record<ClientGoal, string> = {
      [ClientGoal.WeightLoss]: 'Похудение',
      [ClientGoal.MuscleGain]: 'Набор массы',
      [ClientGoal.Endurance]: 'Выносливость',
      [ClientGoal.Strength]: 'Сила',
    };
    return labels[goal] ?? goal;
  };

  // Функция для форматирования оборудования
  const getEquipmentLabel = (equipment: Equipment): string => {
    const labels = {
      [Equipment.Gym]: 'Тренажерный зал',
      [Equipment.Home]: 'Дома',
    };
    return labels[equipment] || equipment;
  };

  // Получаем аватар клиента (инициалы или фото)
  const getAvatar = () => {
    if (client.photoUrl) {
      return (
        <img
          src={client.photoUrl}
          alt={client.name}
          className="w-24 h-24 rounded-full object-cover"
        />
      );
    }
    const initials = client.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return (
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
        style={{
          background: 'linear-gradient(135deg, #ff5252 0%, #ff6b6b 100%)',
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 safe-area-bottom">
      {/* Заголовок */}
      <div className="mb-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span>←</span>
          <span>Назад</span>
        </button>
        <h1 className="text-2xl sm:text-4xl font-bold break-words">Профиль</h1>
      </div>

      {/* Основная информация */}
      <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Аватар */}
          <div className="flex-shrink-0">
            {getAvatar()}
          </div>

          {/* Информация */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-2">{client.name}</h2>
            {client.age && (
              <p className="text-lg mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {client.age} лет
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Цель
                </p>
                <p className="font-semibold">{getGoalLabel(client.goal)}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Оборудование
                </p>
                <p className="font-semibold">{getEquipmentLabel(client.equipment)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Мои ограничения */}
      <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-xl font-bold">Мои ограничения</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Отметьте проблемы со здоровьем для безопасных тренировок
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          {CONTRAINDICATION_OPTIONS.map((option) => {
            const isChecked = client.contraindications?.includes(option.value) || false;
            
            return (
              <label
                key={option.value}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: isChecked 
                    ? 'rgba(255, 82, 82, 0.1)' 
                    : 'var(--color-background-secondary)',
                  border: isChecked 
                    ? '1px solid rgba(255, 82, 82, 0.3)' 
                    : '1px solid transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleContraindicationChange(option.value, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded cursor-pointer"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    {option.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
        
        {(client.contraindications?.length || 0) > 0 && (
          <div 
            className="mt-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span className="font-medium" style={{ color: '#ffc107' }}>Важно:</span> При составлении плана тренировок упражнения, 
            которые могут быть опасны при ваших ограничениях, будут отмечены предупреждением.
          </div>
        )}
      </div>

      {/* Персональный тренер */}
      <div className="card mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">👨‍🏫</span>
          <div>
            <h3 className="text-xl font-bold">Персональный тренер</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Выберите тренера, чтобы получить план тренировок
            </p>
          </div>
        </div>
        {request?.status === 'pending' && pendingTrainer && (
          <div
            className="mb-4 p-4 rounded-2xl text-center cursor-default"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              opacity: 0.9,
            }}
          >
            <p className="font-medium text-white">Ожидание ответа от @{pendingTrainer.username}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Тренер ещё не принял заявку. Дождитесь ответа.
            </p>
            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!client) return;
                  cancelRequestForClient(client.id);
                  addToast({ type: 'info', message: 'Заявка отменена' });
                }}
              >
                Отменить заявку
              </Button>
            </div>
          </div>
        )}
        {request?.status === 'accepted' && (
          <div
            className="mb-4 p-4 rounded-2xl flex items-center gap-3"
            style={{
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
            }}
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-white">
                Ваш тренер: @{getTrainerById(request.trainerId)?.username ?? request.trainerId}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Функционал тренировок доступен
              </p>
            </div>
            <div className="ml-auto">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!client) return;
                  // Удаляем запрос(ы) и снимаем назначение тренера
                  cancelRequestForClient(client.id);
                  // Сбрасываем assignedTrainerId
                  // updateClient импортирован выше
                  const updateClient = useAppStore.getState().updateClient;
                  try {
                    updateClient(client.id, { assignedTrainerId: undefined });
                  } catch (e) {
                    console.error('Failed to clear assignedTrainerId', e);
                  }
                  addToast({ type: 'info', message: 'Вы отменили выбор тренера' });
                }}
              >
                Отменить тренера
              </Button>
            </div>
          </div>
        )}
        {(!request || request.status === 'rejected') && (
          <Button
            onClick={() => setShowTrainerModal(true)}
            className="w-full py-4 text-lg font-semibold"
            style={{
              background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
              boxShadow: '0 0 20px rgba(255, 68, 68, 0.4)',
            }}
          >
            Выбрать персонального тренера
          </Button>
        )}
        <TrainerSelectModal
          isOpen={showTrainerModal}
          onClose={() => setShowTrainerModal(false)}
          trainers={trainers}
          onSelect={(t) => {
            if (!client) return;
            createRequest(client.id, t.id);
            addToast({ type: 'success', message: `Заявка отправлена @${t.username}` });
          }}
        />
      </div>

      {/* Статистика */}
      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
        <div 
          className="card animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#FF5252' }}>
              {client.completedWorkouts?.length || 0}
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Завершенных тренировок
            </p>
          </div>
        </div>

        <div 
          className="card animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#FF5252' }}>
              {client.weeklyPlan 
                ? Object.values(client.weeklyPlan).filter((day) => day && day.length > 0).length
                : 0}
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Дней с тренировками в неделю
            </p>
          </div>
        </div>
      </div>

      {/* Кнопка выхода */}
      <div className="card animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Выход из системы</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Выйти из аккаунта и вернуться на главную страницу
            </p>
          </div>
          <div className="relative">
            <Button
              onClick={() => setShowLogoutConfirm(true)}
              variant="secondary"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
              }}
            >
              Выйти
            </Button>

            {/* Подтверждение выхода */}
            {showLogoutConfirm && (
              <div
                className="absolute right-0 top-full mt-2 p-4 rounded-lg shadow-xl z-50 min-w-[250px]"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Вы уверены, что хотите выйти?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleLogout}
                    className="flex-1"
                    style={{
                      background: '#ef4444',
                      color: 'white',
                    }}
                  >
                    Да, выйти
                  </Button>
                  <Button
                    onClick={() => setShowLogoutConfirm(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
