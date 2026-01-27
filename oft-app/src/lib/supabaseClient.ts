/**
 * Supabase client для авторизации и таблицы profiles.
 * Таблица profiles создана вручную — не создаём её кодом.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://eltpsahzydrxxikbhonv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdHBzYWh6eWRyeHhpa2Job252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzk4NDEsImV4cCI6MjA4NDkxNTg0MX0.BEkGdNVGay9gtg-DwcsTdMMdFzZc1JgZInoKA1EDWVo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
