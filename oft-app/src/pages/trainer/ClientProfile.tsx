/**
 * Детальная страница профиля клиента для тренера
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { deleteClientFromSupabase, saveClient } from '../../lib/supabaseProfiles';
import { ROUTES } from '../../router/routes';
import ClientProfileHeader from '../../components/trainer/ClientProfileHeader';
import Tabs from '../../components/ui/Tabs';
import ClientProgressSummary from '../../components/trainer/ClientProgressSummary';
import AIAssistantPanel from '../../components/ai/AIAssistantPanel';
import DeleteClientModal from '../../components/trainer/DeleteClientModal';
import Button from '../../components/ui/Button';
import ActivityCalendar from '../../components/calendar/ActivityCalendar';
import { ClientGoal, Equipment } from '../../data/models/types';
import type { FitnessLevel, WorkoutHistoryEntry, WorkoutMood } from '../../data/models/types';
import type { WorkoutSessionWithDetails } from '../../components/client/WorkoutHistoryItem';

type Tab = 'plan' | 'progress' | 'history' | 'notes' | 'settings';

// Конфигурация настроений
const MOOD_CONFIG: Record<WorkoutMood, { emoji: string; label: string; color: string }> = {
  strong: { emoji: '💪', label: 'Сильный', color: '#22c55e' },
  good: { emoji: '😊', label: 'Хорошо', color: '#84cc16' },
  normal: { emoji: '😐', label: 'Нормально', color: '#eab308' },
  tired: { emoji: '😓', label: 'Устал', color: '#f97316' },
  exhausted: { emoji: '😵', label: 'Измотан', color: '#ef4444' },
};

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const clients = useAppStore((state) => state.clients || []);
  const currentUser = useAuthStore((state) => state.user);
  const exercises = useAppStore((state) => state.exercises || []);
  const updateClient = useAppStore((state) => state.updateClient);
  const deleteClient = useAppStore((state) => state.deleteClient);
  const addToast = useAppStore((state) => state.addToast);
  const getClientWorkoutHistory = useAppStore((state) => state.getClientWorkoutHistory);

  const client = id ? clients.find((c) => c.id === id) ?? null : null;
  
  // Проверяем, что клиент принадлежит этому тренеру
  useEffect(() => {
    if (client && client.assignedTrainerId !== currentUser?.id) {
      navigate(ROUTES.TRAINER.DASHBOARD, { replace: true });
    }
  }, [client, currentUser, navigate]);
  
  // Мемоизируем workoutHistory чтобы избежать лишних перерендеров
  const workoutHistory: WorkoutHistoryEntry[] = useMemo(() => {
    if (!id) return [];
    try {
      return getClientWorkoutHistory(id) || [];
    } catch (e) {
      console.error('Error getting workout history:', e);
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  const sessions: WorkoutSessionWithDetails[] = useMemo(() => workoutHistory.map((h) => ({
    id: h.id,
    date: h.date,
    workoutName: h.workoutName,
    exercisesCount: h.exercises.length,
    totalSets: h.exercises.reduce((s, e) => s + (parseInt(e.sets, 10) || 0), 0),
    completed: true,
    planDayNumber: undefined,
    exercises: h.exercises.map((e) => ({
      exerciseId: '',
      sets: [{ reps: parseInt(e.reps, 10) || 0, completed: true }],
      completed: true,
    })),
  })), [workoutHistory]);

  const [activeTab, setActiveTab] = useState<Tab>('plan');

  // State для заметок
  const [notes, setNotes] = useState(client?.notes || '');
  const [notesChanged, setNotesChanged] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    name: client?.name ?? '',
    age: client?.age,
    goal: (client?.goal ?? ClientGoal.MuscleGain) as (typeof ClientGoal)[keyof typeof ClientGoal],
    level: (client?.fitnessLevel ?? client?.level ?? 'beginner') as FitnessLevel,
    equipment: (client?.equipment ?? Equipment.Gym) as (typeof Equipment)[keyof typeof Equipment],
  });
  const [formChanged, setFormChanged] = useState(false);

  // State для удаления
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (client) {
      setNotes(client.notes ?? '');
      setFormData({
        name: client.name,
        age: client.age,
        goal: client.goal,
        level: (client.fitnessLevel ?? client.level ?? 'beginner') as FitnessLevel,
        equipment: client.equipment ?? Equipment.Gym,
      });
    }
  }, [client]);

  // Если клиент не найден
  if (!client) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-6 px-4 sm:px-6">
        <div className="card max-w-md text-center">
          <p className="text-6xl mb-4">❌</p>
          <h2 className="text-2xl font-bold mb-2">Клиент не найден</h2>
          <p
            className="mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Возможно, клиент был удалён или ID указан неверно
          </p>
          <Link to={ROUTES.TRAINER.DASHBOARD} className="btn-primary">
            Вернуться к списку клиентов
          </Link>
        </div>
      </div>
    );
  }

  const saveNotes = async () => {
    if (!id) return;
    setIsSavingNotes(true);
    updateClient(id, { notes });
    // Синхронизируем с Supabase
    const updatedClient = { ...client, notes };
    saveClient(updatedClient).then((result) => {
      if (!result.success) {
        addToast({
          type: 'error',
          message: 'Ошибка синхронизации заметок с сервером',
        });
      }
    });
    setNotesChanged(false);
    setLastSaved(new Date());
    addToast({ type: 'success', message: 'Заметки сохранены!' });
    setTimeout(() => setIsSavingNotes(false), 300);
  };

  const saveSettings = async () => {
    if (!id) return;
    setIsSavingSettings(true);
    updateClient(id, {
      name: formData.name,
      age: formData.age,
      goal: formData.goal,
      fitnessLevel: formData.level,
      equipment: formData.equipment,
    });
    // Синхронизируем с Supabase
    const updatedClient = { 
      ...client, 
      name: formData.name,
      age: formData.age || 0,
      goal: formData.goal,
      fitnessLevel: formData.level,
      equipment: formData.equipment,
    };
    saveClient(updatedClient).then((result) => {
      if (!result.success) {
        addToast({
          type: 'error',
          message: 'Ошибка синхронизации настроек с сервером',
        });
      }
    });
    setFormChanged(false);
    addToast({ type: 'success', message: 'Изменения сохранены!' });
    setTimeout(() => setIsSavingSettings(false), 300);
  };

  const handleDelete = (confirmName: string) => {
    if (!id || !client) return;
    if (confirmName !== client.name) {
      addToast({ type: 'error', message: 'Имя введено неверно' });
      return;
    }
    deleteClient(id);
    // Синхронизируем удаление с Supabase
    deleteClientFromSupabase(id).then((result: { success: boolean; error?: string }) => {
      if (!result.success) {
        addToast({
          type: 'error',
          message: 'Ошибка синхронизации удаления с сервером',
        });
      }
    });
    navigate(ROUTES.TRAINER.DASHBOARD);
  };
  
  // Состояние для развернутых записей истории
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Set<string>>(new Set());

  const tabs = [
    { id: 'plan', label: 'План тренировок', icon: '📋' },
    { id: 'progress', label: 'Прогресс', icon: '📊' },
    { id: 'history', label: 'История', icon: '🕐', badge: workoutHistory.length > 0 ? workoutHistory.length : undefined },
    { id: 'notes', label: 'Заметки', icon: '📝' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
  ];

  const goalOptions: { value: (typeof ClientGoal)[keyof typeof ClientGoal]; label: string }[] = [
    { value: ClientGoal.WeightLoss, label: 'Похудение' },
    { value: ClientGoal.MuscleGain, label: 'Набор массы' },
    { value: ClientGoal.Endurance, label: 'Выносливость' },
    { value: ClientGoal.Strength, label: 'Сила' },
  ];
  const equipmentOptions: { value: (typeof Equipment)[keyof typeof Equipment]; label: string }[] = [
    { value: Equipment.Gym, label: 'Зал' },
    { value: Equipment.Home, label: 'Дома' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
      {/* ШАПКА */}
      <ClientProfileHeader client={client} />

      {/* ТАБЫ */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as Tab)}
      />

      {/* КОНТЕНТ ТАБОВ */}
      <div className="pb-8">
        {/* ТАБ: ПЛАН */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            {/* Умный Календарь Активности */}
            {client && id && (
              <ActivityCalendar
                weeklyPlan={client.weeklyPlan}
                selfOrganizedDays={client.selfOrganizedDays ?? []}
                workoutHistory={workoutHistory}
                exercises={exercises}
                contraindications={client.contraindications ?? []}
              />
            )}

            {/* Недельный план (weeklyPlan) */}
            {client?.weeklyPlan && Object.keys(client.weeklyPlan).length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Недельный план тренировок</h3>
                <div className="space-y-3">
                  {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
                    const dayExercises = client?.weeklyPlan?.[day];
                    const isSelfOrganized = client?.selfOrganizedDays?.includes(day);
                    const dayLabels: Record<typeof day, string> = {
                      Mon: 'Понедельник',
                      Tue: 'Вторник',
                      Wed: 'Среда',
                      Thu: 'Четверг',
                      Fri: 'Пятница',
                      Sat: 'Суббота',
                      Sun: 'Воскресенье',
                    };

                    if (!dayExercises || dayExercises.length === 0) {
                      return null;
                    }

                    return (
                      <div
                        key={day}
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: 'var(--color-background-secondary)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{dayLabels[day]}</h4>
                            {isSelfOrganized && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: 'rgba(255, 193, 7, 0.2)',
                                  color: '#ffc107',
                                  border: '1px solid rgba(255, 193, 7, 0.3)',
                                }}
                                title="Клиент сам составил план на этот день"
                              >
                                ⭐ Клиент сам составил
                              </span>
                            )}
                          </div>
                          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {dayExercises.length} упражн.
                          </span>
                        </div>
                        <div className="space-y-2">
                          {dayExercises.map((planEx) => {
                            const exercise = exercises.find((ex) => ex.id === planEx.exerciseId);
                            return (
                              <div
                                key={planEx.exerciseId}
                                className="text-sm p-2 rounded"
                                style={{ backgroundColor: 'var(--color-background)' }}
                              >
                                <span className="font-medium">{exercise?.name || 'Неизвестное упражнение'}</span>
                                <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                                  {planEx.sets} × {planEx.reps}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Если нет плана вообще */}
            {(!client?.weeklyPlan || Object.keys(client.weeklyPlan).length === 0) && (
              <div className="space-y-4">
                <div className="card text-center py-12">
                  <p className="text-6xl mb-4">📋</p>
                  <h3 className="text-xl font-bold mb-2">План не создан</h3>
                  <p
                    className="mb-6"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Создайте персональный план тренировок для {client.name}
                  </p>
                  <Link
                    to={ROUTES.TRAINER.ASSIGN_WORKOUT(id || '')}
                    className="btn-primary"
                  >
                    Создать план
                  </Link>
                </div>

                <AIAssistantPanel type="plan" context={{ client }} />
              </div>
            )}
          </div>
        )}

        {/* ТАБ: ПРОГРЕСС */}
        {activeTab === 'progress' && (
          <ClientProgressSummary sessions={sessions} />
        )}

        {/* ТАБ: ИСТОРИЯ */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {workoutHistory.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-6xl mb-4">📖</p>
                <h3 className="text-xl font-bold mb-2">История пуста</h3>
                <p
                  className="mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {client.name} ещё не завершил ни одной тренировки.
                  Когда клиент начнёт тренироваться, здесь появится полная история.
                </p>
              </div>
            ) : (
              <>
                {/* Статистика */}
                <div className="card">
                  <h3 className="font-semibold mb-4">Общая статистика</h3>
                  <div className="grid gap-4 text-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 100px), 1fr))' }}>
                    <div>
                      <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                        {workoutHistory.length}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Тренировок
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                        {workoutHistory.reduce((sum, h) => sum + h.exercises.length, 0)}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Упражнений
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
                        {workoutHistory.reduce((sum, h) => 
                          sum + h.exercises.reduce((s, e) => s + parseInt(e.sets || '0'), 0), 0
                        )}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Подходов
                      </div>
                    </div>
                  </div>
                </div>

                {/* Список тренировок */}
                <div className="card">
                  <h3 className="font-semibold mb-4">Завершённые тренировки</h3>
                  <div className="space-y-3">
                    {workoutHistory.map((entry) => {
                      const date = new Date(entry.date);
                      const isExpanded = expandedHistoryIds.has(entry.id);
                      const moodInfo = entry.mood ? MOOD_CONFIG[entry.mood] : null;

                      return (
                        <div
                          key={entry.id}
                          className="rounded-lg overflow-hidden"
                          style={{
                            border: isExpanded ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-background)',
                          }}
                        >
                          {/* Заголовок */}
                          <button
                            onClick={() => {
                              setExpandedHistoryIds((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(entry.id)) {
                                  newSet.delete(entry.id);
                                } else {
                                  newSet.add(entry.id);
                                }
                                return newSet;
                              });
                            }}
                            className="w-full p-3 flex items-center justify-between text-left hover:bg-[var(--color-card-hover)] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">📅</span>
                              <div>
                                <div className="font-medium text-sm">{entry.workoutName}</div>
                                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                  {date.toLocaleDateString('ru-RU', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                  })} • {entry.exercises.length} упр.
                                  {entry.duration && ` • ${entry.duration} мин`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {moodInfo && <span title={moodInfo.label}>{moodInfo.emoji}</span>}
                              <motion.span
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                ▼
                              </motion.span>
                            </div>
                          </button>

                          {/* Развернутое содержимое */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div
                                  className="p-3 space-y-2"
                                  style={{ borderTop: '1px solid var(--color-border)' }}
                                >
                                  {entry.exercises.map((ex, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-2 rounded"
                                      style={{ backgroundColor: 'var(--color-card)' }}
                                    >
                                      <span className="text-sm">{ex.title}</span>
                                      <span
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{
                                          backgroundColor: 'rgba(255, 82, 82, 0.15)',
                                          color: 'var(--color-accent)',
                                        }}
                                      >
                                        {ex.sets} × {ex.reps}
                                        {ex.weight && ` @ ${ex.weight}кг`}
                                      </span>
                                    </div>
                                  ))}
                                  {entry.notes && (
                                    <div
                                      className="p-2 rounded text-sm"
                                      style={{ backgroundColor: 'var(--color-card)' }}
                                    >
                                      <span style={{ color: 'var(--color-text-secondary)' }}>📝 </span>
                                      {entry.notes}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ТАБ: ЗАМЕТКИ */}
        {activeTab === 'notes' && (
          <div className="card">
            <h3 className="font-semibold mb-4">Заметки о клиенте</h3>

            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesChanged(true);
              }}
              placeholder="Добавьте заметки о клиенте, его прогрессе, особенностях тренировок, целях..."
              className="w-full min-h-[300px] px-4 py-3 rounded-lg resize-y focus:outline-none"
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-accent)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
              }}
            />

            <div className="flex items-center justify-between mt-4">
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {lastSaved &&
                  `Последнее сохранение: ${lastSaved.toLocaleTimeString('ru-RU')}`}
                {!lastSaved && `Символов: ${notes.length}`}
              </p>

              {notesChanged && (
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setNotes(client.notes || '');
                      setNotesChanged(false);
                    }}
                  >
                    Отменить
                  </Button>
                  <Button
                    variant="primary"
                    onClick={saveNotes}
                    loading={isSavingNotes}
                  >
                    Сохранить заметки
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ТАБ: НАСТРОЙКИ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="card">
              <h3 className="font-semibold mb-4">Основная информация</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Имя клиента *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }));
                      setFormChanged(true);
                    }}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)';
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Возраст (опционально)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age || ''}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        age: e.target.value ? parseInt(e.target.value) : undefined,
                      }));
                      setFormChanged(true);
                    }}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border)';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Цели и уровень */}
            <div className="card">
              <h3 className="font-semibold mb-4">Цели и уровень</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Цель *
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, goal: e.target.value as (typeof ClientGoal)[keyof typeof ClientGoal] }));
                      setFormChanged(true);
                    }}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
                  >
                    {goalOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Уровень *
                  </label>
                  <div className="space-y-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map(
                      (level) => (
                        <label
                          key={level}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:opacity-70 transition-opacity"
                          style={{ backgroundColor: 'var(--color-background)' }}
                        >
                          <input
                            type="radio"
                            name="level"
                            value={level}
                            checked={formData.level === level}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                level: e.target.value as FitnessLevel,
                              }));
                              setFormChanged(true);
                            }}
                            className="w-4 h-4"
                            style={{ accentColor: 'var(--color-accent)' }}
                          />
                          <span>
                            {level === 'beginner'
                              ? 'Новичок'
                              : level === 'intermediate'
                              ? 'Средний'
                              : 'Продвинутый'}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Оборудование */}
            <div className="card">
              <h3 className="font-semibold mb-4">Оборудование</h3>
              <div className="space-y-2">
                {equipmentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <input
                      type="radio"
                      name="equipment"
                      checked={formData.equipment === opt.value}
                      onChange={() => {
                        setFormData((prev) => ({ ...prev, equipment: opt.value }));
                        setFormChanged(true);
                      }}
                      className="w-4 h-4"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Кнопки действий */}
            {formChanged && (
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setFormData({
                      name: client.name,
                      age: client.age,
                      goal: client.goal,
                      level: (client.fitnessLevel ?? client.level ?? 'beginner') as FitnessLevel,
                      equipment: (client.equipment ?? Equipment.Gym) as (typeof Equipment)[keyof typeof Equipment],
                    });
                    setFormChanged(false);
                  }}
                >
                  Отменить
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={saveSettings}
                  loading={isSavingSettings}
                >
                  Сохранить изменения
                </Button>
              </div>
            )}

            {/* Опасная зона */}
            <div className="card border-2" style={{ borderColor: 'var(--color-error)' }}>
              <div
                className="h-px mb-6"
                style={{ backgroundColor: 'var(--color-border)' }}
              />
              <h3
                className="font-semibold mb-2"
                style={{ color: 'var(--color-error)' }}
              >
                Опасная зона
              </h3>
              <p
                className="mb-4"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Удаление клиента необратимо. Все данные клиента будут удалены
                навсегда.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-error)';
                }}
              >
                Удалить клиента
              </button>
            </div>
          </div>
        )}
      </div>

      {/* МОДАЛКА УДАЛЕНИЯ */}
      {showDeleteModal && (
        <DeleteClientModal
          clientName={client.name}
          onConfirm={(confirmName) => handleDelete(confirmName)}
          onCancel={() => {
            setShowDeleteModal(false);
          }}
        />
      )}
    </div>
  );
}
