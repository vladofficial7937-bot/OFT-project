/**
 * Онбординг для нового клиента - первичный опрос
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import { ClientGoal, Contraindication } from '../../data/models/types';
import type { FitnessLevel } from '../../data/models/types';
import { ROUTES } from '../../router/routes';

// Конфигурация шагов
const STEPS = [
  { id: 1, title: 'Твои цели', description: 'Что ты хочешь достичь?' },
  { id: 2, title: 'Опыт', description: 'Какой у тебя уровень подготовки?' },
  { id: 3, title: 'Ограничения и здоровье', description: 'Есть ли у тебя проблемы со здоровьем?' },
  { id: 4, title: 'Доступное время', description: 'Сколько времени ты можешь уделять тренировкам?' },
];

// Варианты целей
const GOAL_OPTIONS: Array<{ value: ClientGoal; label: string; icon: string; description: string }> = [
  { value: ClientGoal.WeightLoss, label: 'Похудение', icon: '🔥', description: 'Сбросить лишний вес и улучшить форму' },
  { value: ClientGoal.MuscleGain, label: 'Набор массы', icon: '💪', description: 'Набрать мышечную массу и силу' },
  { value: ClientGoal.Strength, label: 'Сила', icon: '⚡', description: 'Увеличить силовые показатели' },
  { value: ClientGoal.Endurance, label: 'Выносливость', icon: '🏃', description: 'Улучшить выносливость и кардио' },
];

// Варианты уровня подготовки
const FITNESS_LEVEL_OPTIONS: Array<{ value: FitnessLevel; label: string; icon: string; description: string }> = [
  { value: 'beginner', label: 'Новичок', icon: '🌱', description: 'Только начинаю заниматься' },
  { value: 'intermediate', label: 'Средний', icon: '📈', description: 'Есть опыт тренировок' },
  { value: 'advanced', label: 'Профи', icon: '🏆', description: 'Опытный спортсмен' },
];

// Варианты ограничений
const CONTRAINDICATION_OPTIONS: Array<{ value: Contraindication | 'none'; label: string; icon: string; description: string }> = [
  { value: Contraindication.Back, label: 'Проблемы со спиной', icon: '🦴', description: 'Грыжи, протрузии, боли' },
  { value: Contraindication.Knees, label: 'Проблемы с коленями', icon: '🦵', description: 'Артрит, травмы связок' },
  { value: Contraindication.Shoulders, label: 'Проблемы с плечами', icon: '💪', description: 'Вывихи, тендинит' },
  { value: Contraindication.Heart, label: 'Сердечно-сосудистые', icon: '❤️', description: 'Гипертония, аритмия' },
  { value: 'none', label: 'Нет ограничений', icon: '✅', description: 'Здоров, могу выполнять любые упражнения' },
];

// Варианты дней в неделю
const DAYS_OPTIONS = [2, 3, 4, 5, 6];

// Варианты продолжительности тренировки
const DURATION_OPTIONS = [30, 45, 60, 75, 90];

export default function Onboarding() {
  const navigate = useNavigate();
  
  const activeClient = useAppStore((state) => state.activeClient);
  const clients = useAppStore((state) => state.clients || []);
  const addToast = useAppStore((state) => state.addToast);
  
  const client = activeClient || clients[0];
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<ClientGoal | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<FitnessLevel | null>(null);
  const [selectedContraindications, setSelectedContraindications] = useState<Array<Contraindication | 'none'>>([]);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Обработчик выбора цели
  const handleGoalSelect = (goal: ClientGoal) => {
    setSelectedGoal(goal);
  };

  // Обработчик выбора уровня
  const handleLevelSelect = (level: FitnessLevel) => {
    setSelectedLevel(level);
  };

  // Обработчик выбора ограничений
  const handleContraindicationToggle = (value: Contraindication | 'none') => {
    if (value === 'none') {
      // Если выбрано "Нет ограничений", очищаем все остальные
      setSelectedContraindications(['none']);
    } else {
      // Убираем "none" если оно было выбрано
      const filtered = selectedContraindications.filter((c) => c !== 'none');
      // Переключаем выбранное ограничение
      if (filtered.includes(value)) {
        // Если снимаем последнее ограничение, массив может стать пустым - это нормально
        const newSelection = filtered.filter((c) => c !== value);
        setSelectedContraindications(newSelection.length > 0 ? newSelection : []);
      } else {
        setSelectedContraindications([...filtered, value]);
      }
    }
  };

  // Обработчик выбора дней
  const handleDaysSelect = (days: number) => {
    setSelectedDays(days);
  };

  // Обработчик выбора продолжительности
  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
  };

  // Переход к следующему шагу
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      // Логирование отключено для production
      // console.log(`📝 Переход со шага ${currentStep} на шаг ${currentStep + 1}`, {
      //   step: currentStep,
      //   selectedGoal,
      //   selectedLevel,
      //   selectedContraindications,
      //   selectedDays,
      //   selectedDuration,
      // });
      setDirection('forward');
      setCurrentStep(currentStep + 1);
    }
  };

  // Переход к предыдущему шагу
  const handleBack = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  // Проверка, можно ли перейти к следующему шагу
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedGoal !== null;
      case 2:
        return selectedLevel !== null;
      case 3:
        // Шаг 3 всегда валиден - пользователь может не иметь ограничений
        // Пустой массив означает, что пользователь здоров
        return true;
      case 4:
        return selectedDays !== null && selectedDuration !== null;
      default:
        return false;
    }
  };

  // Завершение онбординга
  const handleComplete = () => {
    if (!client) {
      addToast({
        type: 'error',
        message: 'Ошибка: клиент не найден',
      });
      return;
    }

    // Сохраняем данные в клиента
    const contraindications = selectedContraindications.filter(
      (c) => c !== 'none'
    ) as Contraindication[];

    // Подготавливаем данные для сохранения
    const clientUpdates = {
      goal: selectedGoal!,
      fitnessLevel: selectedLevel!,
      contraindications: contraindications.length > 0 ? contraindications : [],
      workoutDaysPerWeek: selectedDays!,
      workoutDurationMinutes: selectedDuration!,
      isFirstLogin: false,
    };

    // Логирование отключено для production
    // console.log('🎯 Сохранение данных онбординга:', {
    //   clientId: client.id,
    //   clientName: client.name,
    //   updates: clientUpdates,
    // });

    // Обновляем клиента через store
    const updateClient = useAppStore.getState().updateClient;
    updateClient(client.id, clientUpdates);

    // Проверяем, что данные сохранились
    const updatedClient = useAppStore.getState().clients.find((c) => c.id === client.id);
    console.log('✅ Данные клиента после обновления:', {
      goal: updatedClient?.goal,
      fitnessLevel: updatedClient?.fitnessLevel,
      contraindications: updatedClient?.contraindications,
      workoutDaysPerWeek: updatedClient?.workoutDaysPerWeek,
      workoutDurationMinutes: updatedClient?.workoutDurationMinutes,
      isFirstLogin: updatedClient?.isFirstLogin,
    });

    // Показываем мотивирующее сообщение
    addToast({
      type: 'success',
      message: 'Спасибо! Мы адаптировали систему под твои параметры 🎉',
      duration: 5000,
    });

    // Перенаправляем на главную
    setTimeout(() => {
      navigate(ROUTES.CLIENT.HOME);
    }, 1000);
  };

  // Анимации для переходов
  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  };

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6">
        <div className="card text-center max-w-md min-w-0">
          <div className="text-5xl sm:text-6xl mb-4">❌</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 break-words">Клиент не найден</h2>
          <Button onClick={() => navigate(ROUTES.HOME)}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col py-6 px-4 sm:p-6 safe-area-bottom overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
        {/* Прогресс-бар */}
        <div className="mb-4 sm:mb-8 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Шаг {currentStep} из {STEPS.length}
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {Math.round((currentStep / STEPS.length) * 100)}%
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Заголовок шага */}
        <div className="text-center mb-4 sm:mb-8 animate-fade-in shrink-0">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 break-words px-2">
            {STEPS[currentStep - 1].title}
          </h1>
          <p
            className="text-base sm:text-lg break-words px-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* Контент шага */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="card min-w-0 overflow-visible"
          >
            {/* Шаг 1: Цели */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOAL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleGoalSelect(option.value)}
                    className={`p-6 rounded-xl text-left transition-all ${
                      selectedGoal === option.value
                        ? 'scale-105 shadow-xl'
                        : 'hover:scale-102 hover:shadow-lg'
                    }`}
                    style={{
                      backgroundColor:
                        selectedGoal === option.value
                          ? 'rgba(255, 82, 82, 0.15)'
                          : 'var(--color-background-secondary)',
                      border: `2px solid ${
                        selectedGoal === option.value
                          ? 'var(--color-accent)'
                          : 'transparent'
                      }`,
                    }}
                  >
                    <div className="text-4xl mb-3">{option.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{option.label}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Шаг 2: Опыт */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FITNESS_LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleLevelSelect(option.value)}
                    className={`p-6 rounded-xl text-center transition-all ${
                      selectedLevel === option.value
                        ? 'scale-105 shadow-xl'
                        : 'hover:scale-102 hover:shadow-lg'
                    }`}
                    style={{
                      backgroundColor:
                        selectedLevel === option.value
                          ? 'rgba(255, 82, 82, 0.15)'
                          : 'var(--color-background-secondary)',
                      border: `2px solid ${
                        selectedLevel === option.value
                          ? 'var(--color-accent)'
                          : 'transparent'
                      }`,
                    }}
                  >
                    <div className="text-5xl mb-3">{option.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{option.label}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Шаг 3: Ограничения */}
            {currentStep === 3 && (
              <div className="space-y-3">
                {CONTRAINDICATION_OPTIONS.map((option) => {
                  const isSelected = selectedContraindications.includes(option.value);
                  const isNoneSelected = selectedContraindications.includes('none');
                  const isNoneOption = option.value === 'none';
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleContraindicationToggle(option.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isSelected ? 'scale-[1.02] shadow-xl' : 'hover:scale-[1.01] hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? 'rgba(255, 82, 82, 0.2)'
                          : isNoneSelected && !isNoneOption
                          ? 'var(--color-background-secondary)'
                          : 'var(--color-background-secondary)',
                        border: `2px solid ${
                          isSelected 
                            ? 'var(--color-accent)' 
                            : isNoneSelected && !isNoneOption
                            ? 'rgba(255, 82, 82, 0.1)'
                            : 'transparent'
                        }`,
                        opacity: isNoneSelected && !isNoneOption ? 0.5 : 1,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <span className="text-3xl">{option.icon}</span>
                          {isSelected && (
                            <span 
                              className="absolute -top-1 -right-1 text-lg"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold mb-1 ${isSelected ? '' : ''}`}>
                            {option.label}
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: 'var(--color-accent)',
                              color: '#FFFFFF',
                            }}
                          >
                            <span className="text-sm font-bold">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {selectedContraindications.length === 0 && (
                  <div 
                    className="mt-4 p-3 rounded-lg text-sm text-center"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#22c55e',
                    }}
                  >
                    ✅ Отлично! Вы не указали ограничений - значит, вы здоровы и можете выполнять любые упражнения.
                  </div>
                )}
              </div>
            )}

            {/* Шаг 4: Время */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Дни в неделю */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 break-words">
                    Сколько дней в неделю?
                  </h3>
                  <div
                    className="grid gap-2 sm:gap-3"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))' }}
                  >
                    {DAYS_OPTIONS.map((days) => (
                      <button
                        key={days}
                        onClick={() => handleDaysSelect(days)}
                        className={`p-4 rounded-xl text-center transition-all ${
                          selectedDays === days
                            ? 'scale-110 shadow-xl'
                            : 'hover:scale-105 hover:shadow-lg'
                        }`}
                        style={{
                          backgroundColor:
                            selectedDays === days
                              ? 'rgba(255, 82, 82, 0.15)'
                              : 'var(--color-background-secondary)',
                          border: `2px solid ${
                            selectedDays === days ? 'var(--color-accent)' : 'transparent'
                          }`,
                        }}
                      >
                        <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                          {days}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                          дней
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Продолжительность */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 break-words">
                    Сколько минут на тренировку?
                  </h3>
                  <div
                    className="grid gap-2 sm:gap-3"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))' }}
                  >
                    {DURATION_OPTIONS.map((duration) => (
                      <button
                        key={duration}
                        onClick={() => handleDurationSelect(duration)}
                        className={`p-4 rounded-xl text-center transition-all ${
                          selectedDuration === duration
                            ? 'scale-110 shadow-xl'
                            : 'hover:scale-105 hover:shadow-lg'
                        }`}
                        style={{
                          backgroundColor:
                            selectedDuration === duration
                              ? 'rgba(255, 82, 82, 0.15)'
                              : 'var(--color-background-secondary)',
                          border: `2px solid ${
                            selectedDuration === duration ? 'var(--color-accent)' : 'transparent'
                          }`,
                        }}
                      >
                        <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                          {duration}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                          мин
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Кнопки навигации */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            ← Назад
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              className={!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Далее →
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!canProceed()}
              className={!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Завершить 🎉
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
