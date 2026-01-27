/**
 * Генератор тренировок (Workout Builder)
 * Цель → Где ты сегодня? → Создать → Карточки с «Заменить» → Начать эту тренировку
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import type { GenerateWorkoutPreferences, GeneratorEquipment } from '../../store/useAppStore';
import type { WorkoutPlanExercise } from '../../data/models/types';
import { MuscleGroup } from '../../data/models/types';
import type { DayOfWeek } from '../../data/models/types';
import { ROUTES } from '../../router/routes';

const BASIC_MUSCLES: Array<{ value: MuscleGroup; label: string; icon: string; color: string }> = [
  { value: MuscleGroup.Chest, label: 'Грудь', icon: '🫁', color: '#ff4444' },
  { value: MuscleGroup.Back, label: 'Спина', icon: '🔙', color: '#3b82f6' },
  { value: MuscleGroup.Legs, label: 'Ноги', icon: '🦵', color: '#22c55e' },
  { value: MuscleGroup.Shoulders, label: 'Плечи', icon: '💪', color: '#f59e0b' },
  { value: MuscleGroup.Arms, label: 'Руки', icon: '🤳', color: '#a855f7' },
  { value: MuscleGroup.Core, label: 'Пресс', icon: '🎯', color: '#06b6d4' },
];

const EQUIPMENT_OPTIONS: Array<{ value: GeneratorEquipment; label: string; icon: string }> = [
  { value: 'gym', label: 'Зал', icon: '🏋️' },
  { value: 'home', label: 'Дом', icon: '🏠' },
  { value: 'pullup_only', label: 'Улица', icon: '🏃' },
];

const glassCard = {
  background: 'var(--color-card-glass)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid var(--color-border)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
};

export default function WorkoutGenerator() {
  const navigate = useNavigate();
  const activeClient = useAppStore((s) => s.activeClient);
  const clients = useAppStore((s) => s.clients || []);
  const exercises = useAppStore((s) => s.exercises || []);
  const generateWorkout = useAppStore((s) => s.generateWorkout);
  const pickAlternativeForSlot = useAppStore((s) => s.pickAlternativeForSlot);
  const updateWeeklyPlan = useAppStore((s) => s.updateWeeklyPlan);
  const addToast = useAppStore((s) => s.addToast);

  const client = activeClient || clients[0];
  const defaultDuration = client?.workoutDurationMinutes ?? 45;
  const levelLabel = client?.fitnessLevel === 'beginner' ? 'Новичок' : client?.fitnessLevel === 'advanced' ? 'Профи' : 'Средний';

  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<GeneratorEquipment>('gym');
  const [duration, setDuration] = useState(defaultDuration);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<WorkoutPlanExercise[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const toggleMuscle = useCallback((mg: MuscleGroup) => {
    setSelectedMuscles((prev) =>
      prev.includes(mg) ? prev.filter((m) => m !== mg) : [...prev, mg]
    );
  }, []);

  const prefs: GenerateWorkoutPreferences = {
    muscleGroups: selectedMuscles,
    durationMinutes: duration,
    equipment,
  };

  const handleGenerate = useCallback(() => {
    if (selectedMuscles.length === 0) return;
    setIsGenerating(true);
    setResult(null);
    setTimeout(() => {
      const generated = generateWorkout(prefs);
      setResult(generated);
      setIsGenerating(false);
    }, 1200);
  }, [selectedMuscles, duration, equipment, generateWorkout]);

  const getExerciseMuscleGroup = useCallback(
    (id: string) => exercises.find((e) => e.id === id)?.muscleGroup,
    [exercises]
  );

  const handleReplace = useCallback(
    (index: number) => {
      if (!result || result.length <= index) return;
      const item = result[index];
      const mg = getExerciseMuscleGroup(item.exerciseId);
      if (!mg) return;
      const prefsForReplace: GenerateWorkoutPreferences = {
        muscleGroups: selectedMuscles,
        durationMinutes: duration,
        equipment,
      };
      setReplacingIndex(index);
      const alt = pickAlternativeForSlot(prefsForReplace, item.exerciseId, mg);
      setReplacingIndex(null);
      if (alt) {
        const next = [...result];
        next[index] = alt;
        setResult(next);
        addToast({ type: 'info', message: 'Упражнение заменено' });
      } else {
        addToast({ type: 'warning', message: 'Нет подходящей замены для этой группы' });
      }
    },
    [result, selectedMuscles, duration, equipment, getExerciseMuscleGroup, pickAlternativeForSlot, addToast]
  );

  const handleStartWorkout = useCallback(() => {
    if (!client || !result || result.length === 0) return;
    const today = new Date();
    const dayMap: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayMap[today.getDay()];
    updateWeeklyPlan(client.id, currentDay, result, true);
    setSaved(true);
    addToast({ type: 'success', message: 'Тренировка записана на сегодня! Можно начинать.' });
  }, [client, result, updateWeeklyPlan, addToast]);

  const getExerciseName = (id: string) => exercises.find((e) => e.id === id)?.name ?? id;

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center py-6 px-4 sm:px-6">
        <div className="rounded-2xl p-8 text-center max-w-md" style={glassCard}>
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold mb-2">Клиент не найден</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Войдите в аккаунт или пройдите онбординг
          </p>
          <button onClick={() => navigate(ROUTES.HOME)} className="btn-primary">
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 pb-28 safe-area-bottom min-w-0">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 break-words">Генератор тренировок</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Выбери цель и место — подберём упражнения под твой уровень
        </p>
      </div>

      {/* Информационный блок: уровень из анкеты */}
      <div
        className="rounded-2xl p-4 mb-6 flex items-center gap-3"
        style={glassCard}
      >
        <span className="text-2xl">📋</span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-tertiary)' }}>
            Твой уровень
          </p>
          <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {levelLabel}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Система подбирает упражнения по анкете
          </p>
        </div>
      </div>

      {!result ? (
        <>
          {/* Секция «Цель» */}
          <div className="rounded-2xl p-5 mb-5" style={glassCard}>
            <h2 className="text-lg font-bold mb-1">Цель</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Выбери группы мышц (можно несколько)
            </p>
            <div className="flex flex-wrap gap-2">
              {BASIC_MUSCLES.map((m) => {
                const active = selectedMuscles.includes(m.value);
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => toggleMuscle(m.value)}
                    className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2"
                    style={{
                      backgroundColor: active ? `${m.color}22` : 'rgba(255,255,255,0.06)',
                      color: active ? m.color : 'var(--color-text-primary)',
                      border: `2px solid ${active ? m.color : 'var(--color-border)'}`,
                    }}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Секция «Где ты сегодня?» */}
          <div className="rounded-2xl p-5 mb-6" style={glassCard}>
            <h2 className="text-lg font-bold mb-1">Где ты сегодня?</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Фильтр по оборудованию
            </p>
            <div className="flex flex-wrap gap-3">
              {EQUIPMENT_OPTIONS.map((opt) => {
                const active = equipment === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEquipment(opt.value)}
                    className="flex-1 min-w-[100px] p-4 rounded-xl text-center transition-all"
                    style={{
                      backgroundColor: active ? 'rgba(255, 82, 82, 0.15)' : 'rgba(255,255,255,0.06)',
                      border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      color: active ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    }}
                  >
                    <span className="text-2xl block mb-1">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Длительность (мин)
              </label>
              <div className="flex flex-wrap gap-2">
                {[30, 45, 60, 75].map((d) => {
                  const active = duration === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)',
                        color: active ? '#fff' : 'var(--color-text-primary)',
                        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Кнопка генерации — яркая, акцентная */}
          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || selectedMuscles.length === 0}
            className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(255, 68, 68, 0.4), 0 0 40px rgba(255, 68, 68, 0.15)',
              border: 'none',
            }}
            whileHover={!isGenerating && selectedMuscles.length > 0 ? { scale: 1.02 } : {}}
            whileTap={!isGenerating && selectedMuscles.length > 0 ? { scale: 0.98 } : {}}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                ИИ подбирает упражнения...
              </>
            ) : (
              <>
                <span>✨</span>
                Создать тренировку
              </>
            )}
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <h2 className="text-xl font-bold">Подобранная тренировка</h2>

          {result.map((item, idx) => (
            <div
              key={`${item.exerciseId}-${idx}`}
              className="rounded-2xl p-4 flex items-center justify-between gap-4"
              style={glassCard}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg font-bold shrink-0" style={{ color: 'var(--color-accent)' }}>
                  {idx + 1}.
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{getExerciseName(item.exerciseId)}</p>
                  <p className="text-sm tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.sets} × {item.reps}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleReplace(idx)}
                disabled={replacingIndex === idx}
                className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(255, 82, 82, 0.15)',
                  border: '1px solid rgba(255, 82, 82, 0.4)',
                  color: 'var(--color-accent)',
                }}
              >
                {replacingIndex === idx ? '…' : 'Заменить'}
              </button>
            </div>
          ))}

          <div className="flex flex-col gap-3 pt-2">
            <motion.button
              type="button"
              onClick={handleStartWorkout}
              disabled={saved}
              className="w-full py-4 rounded-2xl font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.35)',
                border: 'none',
              }}
              whileHover={!saved ? { scale: 1.02 } : {}}
              whileTap={!saved ? { scale: 0.98 } : {}}
            >
              {saved ? '✓ Записано на сегодня' : '▶ Начать эту тренировку'}
            </motion.button>
            <button
              type="button"
              onClick={() => { setResult(null); setSaved(false); }}
              className="w-full py-3 rounded-xl font-medium"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              Создать другую
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.CLIENT.TODAY)}
              className="text-sm font-medium py-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Перейти к «Сегодня» →
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
