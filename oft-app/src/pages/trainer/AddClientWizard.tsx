/**
 * 3-шаговый wizard для добавления нового клиента
 * Использует useAppStore и новые типы
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { saveClient, fetchChatIdByUsername } from '../../lib/supabaseProfiles';
import { sendTelegramMessage } from '../../config/telegram';
import Button from '../../components/ui/Button';
import type { Client } from '../../data/models/types';
import { ClientGoal, Equipment } from '../../data/models/types';
import { ROUTES } from '../../router/routes';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  name: string;
  age: number | '';
  goal: ClientGoal | null;
  equipment: Equipment | null;
  telegramUsername: string;
}

export default function AddClientWizard() {
  const navigate = useNavigate();
  const addClient = useAppStore((state) => state.addClient);
  const addToast = useAppStore((state) => state.addToast);

  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    goal: null,
    equipment: null,
    telegramUsername: '',
  });

  // Обновление данных формы
  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Валидация текущего шага
  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.goal !== null && formData.equipment !== null;
      case 3:
        return true; // Все данные уже проверены
      case 4:
        return formData.telegramUsername.trim().length > 0;
      default:
        return false;
    }
  };

  // Навигация
  const handleNext = () => {
    if (validateStep() && step < 4) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  // Создание клиента
  const handleCreateClient = () => {
    if (!validateStep()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Генерируем случайный ID
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Создаём объект клиента
    const newClient: Client = {
      id: clientId,
      name: formData.name.trim(),
      age: formData.age === '' ? 0 : Number(formData.age),
      goal: formData.goal!,
      equipment: formData.equipment!,
      telegramUsername: formData.telegramUsername.trim(),
    };

    // Добавляем клиента в store
    addClient(newClient);

    // Синхронизируем с Supabase
    saveClient(newClient).then(async (result) => {
      if (!result.success) {
        addToast({
          type: 'error',
          message: 'Ошибка синхронизации с сервером',
        });
      } else {
        // Отправляем приглашение в Telegram
        if (formData.telegramUsername.trim()) {
          const chatId = await fetchChatIdByUsername(formData.telegramUsername.trim());
          if (chatId) {
            const message = `Привет! Тренер ${newClient.name} приглашает вас в фитнес-сервис OFT.\n\nПодтвердите участие:`;
            const replyMarkup = {
              inline_keyboard: [
                [
                  { text: '✅ Принять', callback_data: `accept_${newClient.id}` },
                  { text: '❌ Отклонить', callback_data: `decline_${newClient.id}` }
                ]
              ]
            };
            const sendResult = await sendTelegramMessage(chatId, message, { reply_markup: replyMarkup });
            if (sendResult.ok) {
              addToast({
                type: 'success',
                message: 'Приглашение отправлено в Telegram',
              });
            } else {
              addToast({
                type: 'warning',
                message: 'Клиент не найден в Telegram боте. Попросите клиента написать боту /start',
              });
            }
          } else {
            addToast({
              type: 'warning',
              message: 'Клиент не найден в Telegram боте. Попросите клиента написать боту /start',
            });
          }
        }
      }
    });

    // Показываем уведомление
    addToast({
      type: 'success',
      message: `Клиент "${newClient.name}" успешно создан!`,
    });

    // Редирект на дашборд тренера
    navigate(ROUTES.TRAINER.DASHBOARD);
  };

  // Форматирование цели
  const getGoalLabel = (goal: ClientGoal): string => {
    const labels: Record<ClientGoal, string> = {
      [ClientGoal.WeightLoss]: 'Похудение',
      [ClientGoal.MuscleGain]: 'Набор массы',
      [ClientGoal.Endurance]: 'Выносливость',
      [ClientGoal.Strength]: 'Сила',
    };
    return labels[goal] ?? goal;
  };

  // Форматирование оборудования
  const getEquipmentLabel = (equipment: Equipment): string => {
    const labels = {
      [Equipment.Gym]: 'Тренажерный зал',
      [Equipment.Home]: 'Дома',
    };
    return labels[equipment];
  };

  // Опции для выбора
  const goalOptions = [
    { value: ClientGoal.WeightLoss, label: 'Похудение', icon: '🔥' },
    { value: ClientGoal.MuscleGain, label: 'Набор массы', icon: '💪' },
    { value: ClientGoal.Endurance, label: 'Выносливость', icon: '🏃' },
  ];

  const equipmentOptions = [
    { value: Equipment.Gym, label: 'Тренажерный зал', icon: '🏋️' },
    { value: Equipment.Home, label: 'Дома', icon: '🏠' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
      {/* Прогресс-бар */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 flex items-center ${
                s < 3 ? 'mr-4' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  s === step
                    ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white scale-110'
                    : s < step
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-card)] border-2 border-[var(--color-border)] text-[var(--color-text-secondary)]'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                    s < step
                      ? 'bg-[var(--color-accent)]'
                      : 'bg-[var(--color-border)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Шаг {step} из 3
        </p>
      </div>

      {/* Форма */}
      <div className="card animate-scale-in">
        {/* ШАГ 1: Личные данные */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Личные данные</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Имя <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <input
                type="text"
                className="input-field w-full"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Введите имя клиента"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Возраст
              </label>
              <input
                type="number"
                className="input-field w-full"
                value={formData.age}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFormData('age', value === '' ? '' : Number(value));
                }}
                placeholder="25"
                min="10"
                max="100"
              />
            </div>
          </div>
        )}

        {/* ШАГ 2: Цели и оборудование */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Цели и оборудование</h2>

            {/* Выбор цели */}
            <div>
              <label className="block text-sm font-medium mb-4">
                Цель тренировок <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
                {goalOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFormData('goal', option.value)}
                    className={`card-hover p-4 rounded-lg text-center transition-all duration-300 ${
                      formData.goal === option.value
                        ? 'ring-2 ring-[var(--color-accent)] bg-gradient-to-br from-[var(--color-card)] to-[var(--color-card-hover)]'
                        : ''
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Выбор оборудования */}
            <div>
              <label className="block text-sm font-medium mb-4">
                Доступное оборудование <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
                {equipmentOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFormData('equipment', option.value)}
                    className={`card-hover p-4 rounded-lg text-center transition-all duration-300 ${
                      formData.equipment === option.value
                        ? 'ring-2 ring-[var(--color-accent)] bg-gradient-to-br from-[var(--color-card)] to-[var(--color-card-hover)]'
                        : ''
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ШАГ 3: Итоговая сводка */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Итоговая сводка</h2>

            <div className="card" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Имя:
                  </span>
                  <span className="font-bold text-lg">{formData.name}</span>
                </div>

                {formData.age !== '' && (
                  <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Возраст:
                    </span>
                    <span className="font-medium">{formData.age} лет</span>
                  </div>
                )}

                <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Цель:
                  </span>
                  <span className="font-medium">
                    {formData.goal ? getGoalLabel(formData.goal) : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Оборудование:
                  </span>
                  <span className="font-medium">
                    {formData.equipment ? getEquipmentLabel(formData.equipment) : '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleCreateClient}
                className="w-full text-lg py-4"
              >
                ✓ Создать клиента
              </Button>
            </div>
          </div>
        )}

        {/* ШАГ 4: Telegram username */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Связь с Telegram</h2>

            <div className="card" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Введите username клиента в Telegram (без @). Клиент получит приглашение в сервис.
                </p>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    value={formData.telegramUsername}
                    onChange={(e) => updateFormData('telegramUsername', e.target.value.replace('@', ''))}
                    placeholder="username"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleCreateClient}
                className="w-full text-lg py-4"
              >
                ✓ Отправить приглашение
              </Button>
            </div>
          </div>
        )}

        {/* Кнопки навигации */}
        {step < 4 && (
          <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              ← Назад
            </Button>

            <Button
              onClick={handleNext}
              disabled={!validateStep()}
              className={!validateStep() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Далее →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
