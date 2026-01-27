/**
 * Модальное окно подтверждения удаления клиента
 */

import { useState } from 'react';

interface DeleteClientModalProps {
  clientName: string;
  onConfirm: (confirmName: string) => void;
  onCancel: () => void;
}

export default function DeleteClientModal({
  clientName,
  onConfirm,
  onCancel,
}: DeleteClientModalProps) {
  const [confirmName, setConfirmName] = useState('');

  const isValid = confirmName === clientName;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onCancel}
    >
      <div
        className="card max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
          Удалить клиента?
        </h2>

        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Это действие необратимо. Все данные клиента{' '}
          <strong>{clientName}</strong> будут удалены навсегда.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
            Введите имя клиента для подтверждения:
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={clientName}
            className="input-field w-full"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Отменить
          </button>
          <button
            onClick={() => onConfirm(confirmName)}
            disabled={!isValid}
            className="flex-1 font-semibold py-3 px-6 rounded-[20px] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
            style={{
              backgroundColor: isValid ? 'var(--color-error)' : 'rgba(255,255,255,0.1)',
              boxShadow: isValid ? '0 0 15px #FF0000' : 'none',
            }}
            onMouseEnter={(e) => {
              if (isValid) {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.boxShadow = '0 0 15px #FF0000';
              }
            }}
            onMouseLeave={(e) => {
              if (isValid) {
                e.currentTarget.style.backgroundColor = 'var(--color-error)';
                e.currentTarget.style.boxShadow = '0 0 15px #FF0000';
              }
            }}
          >
            Да, удалить
          </button>
        </div>
      </div>
    </div>
  );
}
