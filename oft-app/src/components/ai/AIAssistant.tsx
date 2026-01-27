/**
 * ИИ-помощник - плавающая кнопка с чатом
 */

import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

// Массив полезных советов по фитнесу
const FITNESS_TIPS = [
  'Помни о важности восстановления между тренировками — мышцы растут во время отдыха!',
  'Пей достаточно воды — обезвоживание может снизить твою производительность на 10-15%.',
  'Разминка перед тренировкой снижает риск травм и улучшает результаты.',
  'Сон 7-9 часов критически важен для восстановления и роста мышц.',
  'Не пропускай растяжку после тренировки — это улучшит гибкость и уменьшит болезненность мышц.',
  'Питание составляет 70% успеха в фитнесе — следи за белком и углеводами.',
  'Тренировки должны быть регулярными, но не изнуряющими — слушай свое тело.',
  'Добавь кардио 2-3 раза в неделю для улучшения выносливости и здоровья сердца.',
  'Веди дневник тренировок — это поможет отслеживать прогресс и мотивирует.',
  'Постепенно увеличивай нагрузку — прогрессия весов и повторений ключ к росту.',
];

/**
 * Генерирует ответ ИИ на основе сообщения пользователя
 */
function generateAIResponse(
  userMessage: string,
  isTrainerMode: boolean,
  getStoreData: () => {
    client: any;
    clients: any[];
    todayWorkout: any;
    completedWorkouts: any[];
  }
): string {
  const message = userMessage.toLowerCase().trim();
  const storeData = getStoreData();

  // Для режима тренера
  if (isTrainerMode) {
    // Анализ клиентов
    if (
      message.includes('анализ') ||
      message.includes('клиент') ||
      message.includes('статус') ||
      message.includes('обзор')
    ) {
      const { clients } = storeData;
      
      if (clients.length === 0) {
        return 'У вас пока нет клиентов. Добавьте первого клиента, чтобы начать анализировать их прогресс.';
      }

      const analysis = clients.map((client: any) => {
        const completedWorkouts = client.completedWorkouts || [];
        const weeklyPlan = client.weeklyPlan || {};
        
        // Тренировки за последние 7 дней
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentWorkouts = completedWorkouts.filter((w: any) => {
          try {
            return new Date(w.date) >= weekAgo;
          } catch {
            return false;
          }
        }).length;
        
        // Назначенные тренировки
        const assignedWorkouts = Object.values(weeklyPlan).filter(
          (day: any) => day && day.length > 0
        ).length;
        
        // Последняя тренировка
        const lastWorkout = completedWorkouts
          .map((w: any) => ({ date: new Date(w.date), workout: w }))
          .filter((w: any) => !isNaN(w.date.getTime()))
          .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())[0];
        
        let status = '';
        if (recentWorkouts >= assignedWorkouts * 0.8) {
          status = 'отличный темп';
        } else if (recentWorkouts >= assignedWorkouts * 0.5) {
          status = 'хороший прогресс';
        } else if (lastWorkout) {
          const daysAgo = Math.floor(
            (new Date().getTime() - lastWorkout.date.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysAgo > 5) {
            status = `пропустил ${daysAgo} дней, нужно внимание`;
          } else {
            status = 'средняя активность';
          }
        } else {
          status = 'нет тренировок, требуется мотивация';
        }
        
        return `${client.name}: ${status} (${recentWorkouts} из ${assignedWorkouts} тренировок за неделю)`;
      }).join('. ');

      return `Анализ ваших клиентов:\n\n${analysis}.\n\nРекомендация: Обратите внимание на клиентов с низкой активностью и отправьте им мотивирующее сообщение.`;
    }
    
    // Общие вопросы тренера
    return 'Я могу помочь вам проанализировать прогресс клиентов, дать советы по планированию тренировок и мотивации. Что вас интересует?';
  }

  const { todayWorkout, completedWorkouts } = storeData;

  // Вопросы про прогресс
  if (
    message.includes('прогресс') ||
    message.includes('результат') ||
    message.includes('статистика') ||
    message.includes('сколько тренировок')
  ) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const workoutsThisWeek = (completedWorkouts || []).filter((w: any) => {
      try {
        return new Date(w.date) >= weekAgo;
      } catch {
        return false;
      }
    }).length;
    
    const totalWorkouts = (completedWorkouts || []).length;
    
    if (workoutsThisWeek > 0) {
      return `Отличный темп! Ты выполнил ${workoutsThisWeek} тренировок на этой неделе. Всего у тебя ${totalWorkouts} завершенных тренировок. Продолжай в том же духе! 💪`;
    } else {
      return `У тебя ${totalWorkouts} завершенных тренировок. На этой неделе тренировок еще не было — самое время начать! 🔥`;
    }
  }

  // Вопросы про план тренировок
  if (
    message.includes('план') ||
    message.includes('тренировка') ||
    message.includes('сегодня') ||
    message.includes('упражнения')
  ) {
    if (todayWorkout && todayWorkout.length > 0) {
      return `Твой тренер назначил на сегодня тренировку с ${todayWorkout.length} упражнениями. Готов начать? Помни о правильной технике и не забудь разминку! 🏋️‍♂️`;
    } else {
      return 'Сегодня у тебя день отдыха по плану. Это важно для восстановления! Можешь сделать легкую растяжку или прогулку. 🧘‍♂️';
    }
  }

  // Вопросы про мотивацию
  if (
    message.includes('мотивация') ||
    message.includes('лень') ||
    message.includes('не хочу') ||
    message.includes('устал')
  ) {
    const tips = [
      'Каждая тренировка приближает тебя к цели. Даже 20 минут лучше, чем ничего!',
      'Помни: ты уже сделал первый шаг, начав тренироваться. Не останавливайся!',
      'Большие результаты складываются из маленьких ежедневных усилий.',
      'Сегодняшний ты будет благодарен вчерашнему за каждую тренировку.',
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // Общие вопросы - случайный совет
  const randomTip = FITNESS_TIPS[Math.floor(Math.random() * FITNESS_TIPS.length)];
  return randomTip;
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

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я твой ИИ-помощник по фитнесу. Спроси меня о прогрессе, плане тренировок или получи полезный совет! 💪',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isTrainerMode = location.pathname.startsWith('/trainer');

  const activeClient = useAppStore((state) => state.activeClient);
  const clients = useAppStore((state) => state.clients || []);
  const getTodayWorkout = useAppStore((state) => state.getTodayWorkout);

  const client = activeClient || clients[0];
  const todayWorkout = client && client.id ? getTodayWorkout(client.id) : null;
  const completedWorkouts = client?.completedWorkouts || [];

  // Функция для получения данных из стора
  const getStoreData = () => ({
    client,
    clients,
    todayWorkout,
    completedWorkouts,
  });

  // Скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Генерируем ответ ИИ
    const aiResponse = generateAIResponse(inputValue.trim(), isTrainerMode, getStoreData);

    // Добавляем сообщение ассистента с эффектом печатания
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Плавающая кнопка (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-xl transition-all duration-300 hover:scale-110 animate-scale-in bottom-[calc(5.5rem+var(--safe-area-inset-bottom))] md:bottom-4"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.5), 0 4px 12px -2px rgba(139, 92, 246, 0.4)',
        }}
        aria-label="Открыть ИИ-помощник"
      >
        ✨
      </button>

      {/* Панель чата */}
      {isOpen && (
        <div
          className="fixed right-2 left-2 sm:left-auto sm:right-6 z-50 w-auto sm:w-96 h-[70vh] sm:h-[600px] rounded-2xl shadow-2xl flex flex-col animate-fade-in bottom-[calc(5.5rem+var(--safe-area-inset-bottom))] md:bottom-6"
          style={{
            background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.98) 0%, rgba(30, 27, 45, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 20px 60px -12px rgba(99, 102, 241, 0.5)',
          }}
        >
          {/* Заголовок */}
          <div
            className="px-4 py-3 flex items-center justify-between border-b rounded-t-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  ИИ-помощник
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {isTrainerMode ? 'Анализ клиентов' : 'Твой фитнес-консультант'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isTrainerMode={isTrainerMode}
                isNewMessage={index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Ввод сообщения */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isTrainerMode ? 'Спроси про клиентов...' : 'Спроси про прогресс...'}
                className="flex-1 px-4 py-2 rounded-lg text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                }}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Компонент сообщения с эффектом печатания
 */
function MessageBubble({ 
  message, 
  isTrainerMode: _isTrainerMode,
  isNewMessage = false 
}: { 
  message: Message; 
  isTrainerMode: boolean;
  isNewMessage?: boolean;
}) {
  // Для новых сообщений ассистента используем эффект печатания
  const shouldType = message.role === 'assistant' && isNewMessage;
  const { displayedText, isTyping } = useTypingEffect(
    shouldType ? message.content : '',
    shouldType ? 30 : 0
  );

  const content = shouldType ? displayedText : message.content;
  const showTyping = shouldType && isTyping;

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] px-4 py-2 rounded-2xl rounded-br-sm"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
        className="max-w-[80%] px-4 py-2 rounded-2xl rounded-bl-sm"
        style={{
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: 'var(--color-text-primary)',
        }}
      >
        <p className="text-sm whitespace-pre-wrap">
          {content}
          {showTyping && <span className="inline-block w-2 h-4 ml-1 bg-white/50 animate-pulse">|</span>}
        </p>
      </div>
    </div>
  );
}
