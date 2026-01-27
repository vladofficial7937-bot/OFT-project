/**
 * Форма для ввода подходов упражнения
 */

import { useState } from 'react';
import type { SetResult } from '../../data/models';

interface SetInputFormProps {
  targetSets: number;
  targetReps: number;
  initialSets?: SetResult[];
  onSave: (sets: SetResult[]) => void;
  onCancel: () => void;
}

export default function SetInputForm({
  targetSets,
  targetReps,
  initialSets = [],
  onSave,
  onCancel,
}: SetInputFormProps) {
  // Инициализация пустыми подходами
  const [sets, setSets] = useState<SetResult[]>(
    initialSets.length > 0
      ? initialSets
      : Array(targetSets)
          .fill(null)
          .map(() => ({
            reps: targetReps,
            weight: undefined,
            completed: false,
          }))
  );

  const updateSet = (index: number, field: keyof SetResult, value: any) => {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  };

  const addSet = () => {
    setSets((prev) => [
      ...prev,
      {
        reps: targetReps,
        weight: undefined,
        completed: false,
      },
    ]);
  };

  const removeSet = (index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Валидация: хотя бы один подход выполнен
    const hasCompletedSets = sets.some((s) => s.completed);
    if (!hasCompletedSets) {
      alert('Отметьте хотя бы один выполненный подход');
      return;
    }

    onSave(sets);
  };

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
      <h4 className="font-semibold mb-3">Запишите результаты подходов:</h4>

      {/* Таблица подходов */}
      <div className="space-y-2">
        {sets.map((set, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            {/* Номер подхода */}
            <span className="text-sm font-semibold w-20">Подход {index + 1}</span>

            {/* Повторения */}
            <div className="flex-1">
              <label
                className="text-xs block mb-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Повторения
              </label>
              <input
                type="number"
                min="1"
                value={set.reps}
                onChange={(e) =>
                  updateSet(index, 'reps', parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-accent)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                }}
                placeholder={targetReps.toString()}
              />
            </div>

            {/* Вес */}
            <div className="flex-1">
              <label
                className="text-xs block mb-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Вес (кг)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={set.weight || ''}
                onChange={(e) =>
                  updateSet(
                    index,
                    'weight',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-accent)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                }}
                placeholder="—"
              />
            </div>

            {/* Чекбокс выполнения */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={set.completed}
                onChange={(e) => updateSet(index, 'completed', e.target.checked)}
                className="w-5 h-5 cursor-pointer"
                style={{ accentColor: 'var(--color-accent)' }}
              />
              <label className="text-sm whitespace-nowrap">Выполнен</label>
            </div>

            {/* Удалить подход */}
            {sets.length > 1 && (
              <button
                onClick={() => removeSet(index)}
                className="px-2 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-error)' }}
                title="Удалить подход"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Кнопка добавить подход */}
      <button onClick={addSet} className="btn-secondary w-full mt-2 text-sm">
        + Добавить ещё подход
      </button>

      {/* Кнопки сохранения */}
      <div className="flex gap-3 mt-4">
        <button onClick={handleSave} className="btn-primary flex-1">
          Сохранить
        </button>
        <button onClick={onCancel} className="btn-secondary flex-1">
          Отменить
        </button>
      </div>
    </div>
  );
}
