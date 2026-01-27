import type { Client, WorkoutPlan, WorkoutSession } from '../../data/models';

// Диагностика клиента
export interface ClientAssessment {
  summary: string;
  recommendations: string[];
  warnings: string[];
  suggestedLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedCalories: number;
}

// Генерация плана
export interface GeneratePlanRequest {
  client: Client;
  daysPerWeek: number;
  sessionDuration: number; // минуты
  preferences?: string[];
}

export interface GeneratedPlan {
  plan: WorkoutPlan;
  explanation: string;
  alternatives?: string[];
}

// Анализ техники
export interface FormAnalysis {
  score: number; // 0-100
  issues: FormIssue[];
  suggestions: string[];
  videoTimestamps?: { time: number; comment: string }[];
}

export interface FormIssue {
  severity: 'critical' | 'warning' | 'info';
  description: string;
  fix: string;
}

// Рекомендации по нагрузке
export interface ProgressionSuggestion {
  exerciseId: string;
  currentWeight?: number;
  suggestedWeight?: number;
  currentReps?: number;
  suggestedReps?: number;
  reasoning: string;
  confidence: number; // 0-1
}

// Персональные советы
export interface PersonalizedTip {
  category: 'nutrition' | 'recovery' | 'technique' | 'motivation' | 'progress';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

// Чат с ИИ-тренером
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatContext {
  client: Client;
  recentSessions: WorkoutSession[];
  currentPlan?: WorkoutPlan;
}
