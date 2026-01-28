/**
 * Работа с таблицей profiles (Supabase).
 * Не создаём таблицу — используем существующую.
 */

import { supabase } from './supabaseClient';
import type { Client } from '../data/models/types';

export type ProfileRole = 'client' | 'trainer';

export interface Profile {
  id: string;
  role: ProfileRole;
  first_name?: string;
  username?: string;
}

/**
 * Получить профиль по id (Telegram user id).
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, username, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] fetchProfile error:', error);
    return null;
  }
  return data as Profile | null;
}

/**
 * Создать запись в profiles (выбор роли при первом входе).
 */
export async function insertProfile(params: {
  id: string;
  role: ProfileRole;
  first_name?: string;
  username?: string;
}): Promise<{ success: boolean; error?: string }> {
  const data = {
    id: params.id,
    role: params.role,
    first_name: params.first_name ?? null,
    username: params.username ?? null,
  };
  console.log("Данные для отправки:", data);
  const { error } = await supabase.from('profiles').upsert(data, { onConflict: 'id' });

  if (error) {
    console.error('[Supabase] insertProfile error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Получить клиентов для тренера (предполагается таблица clients с полем trainer_id).
 * В будущем заменить на реальную таблицу Supabase.
 */
export async function fetchClientsForTrainer(trainerId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('assigned_trainer_id', trainerId);

  if (error) {
    console.error('[Supabase] fetchClientsForTrainer error:', error);
    return [];
  }
  return (data as Client[]) || [];
}

/**
 * Сохранить клиента в Supabase.
 */
export async function saveClient(client: Client): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('clients').upsert({
    id: client.id,
    name: client.name,
    age: client.age,
    goal: client.goal,
    equipment: client.equipment,
    current_plan_id: client.currentPlanId,
    weekly_plan: client.weeklyPlan,
    photo_url: client.photoUrl,
    completed_workouts: client.completedWorkouts,
    workout_history: client.workoutHistory,
    telegram_id: client.telegramId,
    telegram_username: client.telegramUsername,
    is_telegram_linked: client.isTelegramLinked,
    contraindications: client.contraindications,
    self_organized_days: client.selfOrganizedDays,
    is_first_login: client.isFirstLogin,
    fitness_level: client.fitnessLevel,
    created_at: client.createdAt,
    notes: client.notes,
    workout_days_per_week: client.workoutDaysPerWeek,
    workout_duration_minutes: client.workoutDurationMinutes,
    assigned_trainer_id: client.assignedTrainerId,
  });

  if (error) {
    console.error('[Supabase] saveClient error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Получить chat_id по username из таблицы telegram_users.
 */
export async function fetchChatIdByUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('telegram_users')
    .select('chat_id')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] fetchChatIdByUsername error:', error);
    return null;
  }
  return data?.chat_id || null;
}

/**
 * Удалить клиента из Supabase.
 */
export async function deleteClientFromSupabase(clientId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from('clients').delete().eq('id', clientId);

  if (error) {
    console.error('[Supabase] deleteClientFromSupabase error:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Получить клиента по telegram username.
 */
export async function fetchClientByUsername(username: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('telegram_username', username)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] fetchClientByUsername error:', error);
    return null;
  }
  return data as Client | null;
}
