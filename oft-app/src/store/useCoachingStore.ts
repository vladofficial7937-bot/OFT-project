/**
 * Заявки на персональные тренировки (клиент ↔ тренер)
 * Persist в localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoachingRequest, CoachingRequestStatus, TrainerProfile } from '../data/models/types';

const COACHING_STORAGE_KEY = 'oft-coaching';

interface CoachingState {
  requests: CoachingRequest[];
  trainers: TrainerProfile[];
}

interface CoachingActions {
  createRequest: (clientId: string, trainerId: string) => CoachingRequest;
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  cancelRequestForClient: (clientId: string) => void;
  addTrainer: (trainer: TrainerProfile) => void;
  getPendingForTrainer: (trainerId: string) => CoachingRequest[];
  getRequestForClient: (clientId: string) => CoachingRequest | null;
  getTrainerById: (id: string) => TrainerProfile | undefined;
  getTrainerByUsername: (username: string) => TrainerProfile | undefined;
}

function makeId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

export const useCoachingStore = create<CoachingState & CoachingActions>()(
  persist(
    (set, get) => ({
      requests: [],
      trainers: [],

      createRequest: (clientId, trainerId) => {
        const existing = get().requests.find(
          (r) => r.clientId === clientId && r.trainerId === trainerId && r.status === 'pending'
        );
        if (existing) return existing;
        const req: CoachingRequest = {
          id: makeId(),
          clientId,
          trainerId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ requests: [...s.requests, req] }));
        return req;
      },

      acceptRequest: (id) => {
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? { ...r, status: 'accepted' as CoachingRequestStatus } : r
          ),
        }));
      },

      rejectRequest: (id) => {
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? { ...r, status: 'rejected' as CoachingRequestStatus } : r
          ),
        }));
      },

      // Отмена заявки со стороны клиента: удаляем все заявки клиента
      cancelRequestForClient: (clientId) => {
        set((s) => ({ requests: s.requests.filter((r) => r.clientId !== clientId) }));
      },

      addTrainer: (trainer) => {
        set((s) => {
          const existing = s.trainers.find((t) => t.id === trainer.id);
          if (existing) return s; // Не добавляем дубликат
          return { trainers: [...s.trainers, trainer] };
        });
      },

      getPendingForTrainer: (trainerId) => {
        return get().requests.filter(
          (r) => r.trainerId === trainerId && r.status === 'pending'
        );
      },

      getRequestForClient: (clientId) => {
        const list = get().requests.filter(
          (r) => r.clientId === clientId && (r.status === 'pending' || r.status === 'accepted')
        );
        const accepted = list.find((r) => r.status === 'accepted');
        const pending = list.find((r) => r.status === 'pending');
        return accepted ?? pending ?? null;
      },

      getTrainerById: (id) => get().trainers.find((t) => t.id === id),
      getTrainerByUsername: (username) =>
        get().trainers.find((t) => t.username === username || t.id === username),
    }),
    { name: COACHING_STORAGE_KEY, partialize: (s) => ({ requests: s.requests }) }
  )
);
