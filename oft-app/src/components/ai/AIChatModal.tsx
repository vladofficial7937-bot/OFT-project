/**
 * ИИ-чат модальное окно для клиента
 */

import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Эффект печатающегося текста
 */
function useTypingEffect(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}

/**
 * Генерирует совет ИИ на основе данных клиента
 */
function getAiAdvice(client: any, todayWorkout: any, completedWorkouts: any[], exercises: any[]): string {
  const clientName = client?.name || 'друг';
  
  // Анализ завершенных тренировок
  const totalWorkouts = completedWorkouts?.length || 0;
  
  // Тренировки за последние 7 дней
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const workoutsThisWeek = (completedWorkouts || []).filter((w: any) => {
    try {
      return new Date(w.date) >= weekAgo;
    } catch {
      return false;
    }
  }).length;
  
  // Анализ сегодняшней тренировки
  const hasTodayWorkout = todayWorkout && todayWorkout.length > 0;
  const todayWorkoutName = hasTodayWorkout && exercises.length > 0 
    ? exercises.find((ex: any) => ex.id === todayWorkout[0]?.exerciseId)?.name || 'тренировка'
    : null;
  
  // Формирование персонального сообщения
  let advice = '';
  
  if (totalWorkouts >= 10) {
    advice = `Привет, ${clientName}! 🔥 Твоя дисциплина впечатляет! Ты уже выполнил ${totalWorkouts} тренировок — это отличный результат! `;
    if (workoutsThisWeek >= 3) {
      advice += `За эту неделю ты провел ${workoutsThisWeek} тренировок — отличный темп! `;
    }
    advice += `Продолжай в том же духе, и ты достигнешь своих целей! 💪`;
  } else if (totalWorkouts >= 5) {
    advice = `Привет, ${clientName}! 👋 Ты уже на хорошем пути — ${totalWorkouts} завершенных тренировок это уже отличное начало! `;
    if (workoutsThisWeek > 0) {
      advice += `На этой неделе ты уже тренировался ${workoutsThisWeek} раз — молодец! `;
    }
    advice += `Главное — регулярность. Не останавливайся! 🚀`;
  } else if (totalWorkouts > 0) {
    advice = `Привет, ${clientName}! 🌟 Ты уже начал свой путь — у тебя ${totalWorkouts} завершенных тренировок. `;
    advice += `Каждая тренировка приближает тебя к цели. Помни: важно не количество, а качество и регулярность! `;
    if (workoutsThisWeek === 0) {
      advice += `Давай поднимем активность на этой неделе — самое время начать! 🔥`;
    }
  } else {
    advice = `Привет, ${clientName}! 👋 Я вижу, что ты только начинаешь свой фитнес-путь. `;
    advice += `Это здорово! Первый шаг всегда самый важный. `;
    if (hasTodayWorkout) {
      advice += `У тебя уже запланирована тренировка на сегодня — отличный старт! `;
    } else {
      advice += `Начни с малого, не торопись и главное — получай удовольствие от процесса! `;
    }
  }
  
  // Добавление информации о сегодняшней тренировке
  if (hasTodayWorkout && todayWorkoutName) {
    advice += `\n\n📅 На сегодня запланирована тренировка с упражнением "${todayWorkoutName}". Не забудь про разминку перед началом и заминку после! Разминка поможет избежать травм и улучшит результаты. `;
  }
  
  // Общие советы
  const tips = [
    'Помни: мышцы растут во время отдыха, а не на тренировке. Давай своему телу время на восстановление!',
    'Вода — твой лучший друг во время тренировок. Пей достаточно жидкости до, во время и после занятий.',
    'Сон — это не роскошь, а необходимость для роста. Стремись к 7-9 часам качественного сна.',
    'Питание составляет 70% успеха. Следи за балансом белков, углеводов и жиров.',
    'Слушай свое тело. Если чувствуешь усталость или боль — сделай перерыв.',
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  advice += `\n\n💡 Совет: ${randomTip}`;
  
  return advice;
}

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeClient = useAppStore((state) => state.activeClient);
  const clients = useAppStore((state) => state.clients || []);
  const exercises = useAppStore((state) => state.exercises || []);
  const getTodayWorkout = useAppStore((state) => state.getTodayWorkout);
  
  const client = activeClient || clients[0];
  const todayWorkout = client && client.id ? getTodayWorkout(client.id) : null;
  const completedWorkouts = client?.completedWorkouts || [];

  // Генерация приветственного сообщения при открытии
  useEffect(() => {
    if (isOpen && messages.length === 1 && messages[0].content === '') {
      setIsTyping(true);
      setTimeout(() => {
        const advice = getAiAdvice(client, todayWorkout, completedWorkouts, exercises);
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: advice,
          },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen]);

  // Скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Генерируем ответ ИИ на основе запроса пользователя
    setTimeout(() => {
      const userText = userMessage.content.toLowerCase();
      
      let aiResponse = '';
      
      if (userText.includes('прогресс') || userText.includes('результат') || userText.includes('статистика')) {
        const totalWorkouts = completedWorkouts?.length || 0;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const workoutsThisWeek = (completedWorkouts || []).filter((w: any) => {
          try {
            return new Date(w.date) >= weekAgo;
          } catch {
            return false;
          }
        }).length;
        
        aiResponse = `Твой прогресс:\n\n📊 Всего тренировок: ${totalWorkouts}\n📅 На этой неделе: ${workoutsThisWeek}\n\n`;
        if (workoutsThisWeek >= 3) {
          aiResponse += 'Отличная активность! Продолжай в том же духе! 💪';
        } else if (workoutsThisWeek > 0) {
          aiResponse += 'Хорошее начало недели! Старайся тренироваться регулярно.';
        } else {
          aiResponse += 'Самое время начать! Каждая тренировка делает тебя сильнее! 🔥';
        }
      } else if (userText.includes('план') || userText.includes('тренировка') || userText.includes('сегодня')) {
        if (todayWorkout && todayWorkout.length > 0) {
          const workoutExercises = todayWorkout.map((ex: any) => {
            const exercise = exercises.find((e: any) => e.id === ex.exerciseId);
            return exercise?.name || 'упражнение';
          }).join(', ');
          aiResponse = `На сегодня запланирована тренировка с ${todayWorkout.length} упражнениями:\n\n${workoutExercises}\n\nНе забудь про разминку и правильную технику! 🏋️‍♂️`;
        } else {
          aiResponse = 'Сегодня у тебя день отдыха по плану. Это важно для восстановления! Можешь сделать легкую растяжку или прогулку. 🧘‍♂️';
        }
      } else if (userText.includes('совет') || userText.includes('помощь') || userText.includes('рекомендация')) {
        const tips = [
          'Регулярность важнее интенсивности. Лучше тренироваться 3 раза в неделю умеренно, чем 1 раз до изнеможения.',
          'Слушай свое тело — если чувствуешь сильную усталость, дай себе дополнительный день отдыха.',
          'Пей воду до, во время и после тренировки. Обезвоживание снижает производительность.',
          'Разминка обязательна! 5-10 минут подготовят мышцы и суставы к нагрузке.',
          'Не забывай про сон — мышцы растут во время отдыха, а не на тренировке.',
          'Отслеживай прогресс — это мотивирует и помогает видеть результаты.',
        ];
        aiResponse = tips[Math.floor(Math.random() * tips.length)];
      } else {
        // Персональный ответ на основе данных
        aiResponse = getAiAdvice(client, todayWorkout, completedWorkouts, exercises);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay — тёмный + размытие */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={onClose}
      />

      {/* Modal — стекло */}
      <div
        className="relative w-full max-w-2xl h-[80vh] max-h-[700px] rounded-[20px] flex flex-col animate-scale-in"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Заголовок */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b rounded-t-[20px]"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ff5252 100%)',
              }}
            >
              ⚡
            </div>
            <div>
              <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                OFT AI Тренер
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Твой персональный фитнес-консультант
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Закрыть"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isTyping={message.id === messages[messages.length - 1].id && isTyping && message.role === 'assistant'} />
          ))}
          {isTyping && messages[messages.length - 1].role === 'user' && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-sm"
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ввод сообщения */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Спроси о прогрессе, плане или получи совет..."
              className="flex-1 px-4 py-3 rounded-lg text-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !inputValue.trim()}
              className="px-6 py-3 rounded-lg font-medium text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ff5252 100%)',
                color: 'white',
              }}
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент сообщения с эффектом печатания
 */
function MessageBubble({ message, isTyping }: { message: Message; isTyping: boolean }) {
  const { displayedText } = useTypingEffect(
    message.role === 'assistant' && isTyping ? message.content : '',
    message.role === 'assistant' && isTyping ? 30 : 0
  );

  const content = message.role === 'assistant' && isTyping ? displayedText : message.content;

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ff5252 100%)',
            color: 'white',
          }}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: 'var(--color-text-primary)',
        }}
      >
        <p className="text-sm whitespace-pre-wrap">
          {content}
          {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse">|</span>}
        </p>
      </div>
    </div>
  );
}
