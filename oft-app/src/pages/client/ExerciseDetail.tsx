/**
 * Страница деталей упражнения
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { MuscleGroup } from '../../data/models/types';
import { ROUTES } from '../../router/routes';
import Button from '../../components/ui/Button';

export default function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const exercises = useAppStore((state) => state.exercises || []);
  const activeClient = useAppStore((state) => state.activeClient);
  const clients = useAppStore((state) => state.clients || []);
  const getTodayWorkout = useAppStore((state) => state.getTodayWorkout);

  // Находим упражнение
  const exercise = exercises.find((ex) => ex.id === id);
  const client = activeClient || clients[0];
  const todayWorkout = client && client.id ? getTodayWorkout(client.id) : null;
  
  // Проверяем, есть ли это упражнение в плане на сегодня
  const isInTodayPlan = todayWorkout?.some((ex) => ex.exerciseId === exercise?.id) || false;

  // Если упражнение не найдено
  if (!exercise) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 safe-area-bottom min-w-0">
        <div className="card text-center py-16 animate-fade-in">
          <div className="text-7xl mb-6">❌</div>
          <h2 className="text-2xl font-bold mb-3">Упражнение не найдено</h2>
          <p className="mb-8 text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Упражнение с таким ID не существует
          </p>
          <Button onClick={() => navigate(ROUTES.CLIENT.EXERCISES)}>
            ← Вернуться к каталогу
          </Button>
        </div>
      </div>
    );
  }

  // Название группы мышц
  const getMuscleGroupName = (muscleGroup: MuscleGroup): string => {
    const names: Record<MuscleGroup, string> = {
      [MuscleGroup.Chest]: 'Грудь',
      [MuscleGroup.Back]: 'Спина',
      [MuscleGroup.Legs]: 'Ноги',
      [MuscleGroup.Shoulders]: 'Плечи',
      [MuscleGroup.Arms]: 'Руки',
      [MuscleGroup.Core]: 'Кор',
    };
    return names[muscleGroup] || muscleGroup;
  };

  // Цвет для группы мышц
  const getMuscleGroupColor = (muscleGroup: MuscleGroup): string => {
    const colors: Record<MuscleGroup, string> = {
      [MuscleGroup.Chest]: '#ff4444',
      [MuscleGroup.Back]: '#3b82f6',
      [MuscleGroup.Legs]: '#22c55e',
      [MuscleGroup.Shoulders]: '#f59e0b',
      [MuscleGroup.Arms]: '#a855f7',
      [MuscleGroup.Core]: '#06b6d4',
    };
    return colors[muscleGroup] || 'var(--color-accent)';
  };

  // Генерация инструкций на основе группы мышц и названия упражнения
  const generateInstructions = () => {
    const muscleGroup = exercise.muscleGroup;
    const name = exercise.name.toLowerCase();
    
    // Базовые инструкции для каждой группы мышц
    const baseInstructions: Record<MuscleGroup, string[]> = {
      [MuscleGroup.Chest]: [
        'Займите исходное положение: лягте на скамью, упор стопами в пол',
        'Возьмите штангу/гантели прямым хватом, руки на ширине плеч',
        'Медленно опустите вес к груди, контролируя движение',
        'Выжмите вес вверх, выдыхая на усилии',
        'В верхней точке не выпрямляйте руки полностью, сохраняйте напряжение',
      ],
      [MuscleGroup.Back]: [
        'Займите устойчивую позицию, ноги на ширине плеч',
        'Возьмите снаряд широким/средним хватом',
        'Сведите лопатки вместе перед началом движения',
        'Подтяните вес к корпусу, ведя локти назад',
        'Медленно вернитесь в исходное положение, чувствуя растяжение мышц',
      ],
      [MuscleGroup.Legs]: [
        'Встаньте прямо, ноги на ширине плеч, стопы параллельно',
        'Держите спину прямой, корпус слегка наклонен вперед',
        'Начните движение, сгибая колени и отводя таз назад',
        'Опуститесь до параллели бедер с полом или ниже',
        'Вернитесь в исходное положение, выталкивая себя через пятки',
      ],
      [MuscleGroup.Shoulders]: [
        'Встаньте прямо, ноги на ширине плеч',
        'Возьмите вес на уровне плеч или ниже',
        'Выжмите вес вверх по дуге, не отклоняясь назад',
        'В верхней точке не поднимайте вес слишком высоко',
        'Контролируемо опустите вес в исходное положение',
      ],
      [MuscleGroup.Arms]: [
        'Займите устойчивую позицию, локти зафиксированы',
        'Возьмите вес удобным хватом',
        'Сгибайте руки в локтевых суставах',
        'Поднимите вес до полного сокращения мышц',
        'Медленно вернитесь в исходное положение',
      ],
      [MuscleGroup.Core]: [
        'Займите правильную позицию: прямая спина, нейтральный таз',
        'Напрягите мышцы пресса перед началом движения',
        'Выполняйте движение медленно и контролируемо',
        'Дышите ритмично, не задерживайте дыхание',
        'Сохраняйте напряжение в мышцах кора на протяжении всего подхода',
      ],
    };

    // Адаптируем инструкции под конкретные упражнения
    let instructions = baseInstructions[muscleGroup] || baseInstructions[MuscleGroup.Chest];
    
    if (name.includes('отжимания')) {
      instructions = [
        'Примите упор лежа: руки на ширине плеч, тело прямое',
        'Опуститесь вниз, сгибая локти до угла 90 градусов',
        'Коснитесь грудью пола или почти коснитесь',
        'Выжмите себя вверх, возвращаясь в исходное положение',
        'Держите корпус прямым на протяжении всего движения',
      ];
    } else if (name.includes('приседания')) {
      instructions = [
        'Встаньте прямо, ноги на ширине плеч, носки слегка разведены',
        'Руки вытяните перед собой или держите за головой',
        'Начните движение, отводя таз назад и сгибая колени',
        'Опуститесь до параллели или ниже, колени не должны выходить за носки',
        'Вернитесь в исходное, выталкивая себя через пятки',
      ];
    } else if (name.includes('планка')) {
      instructions = [
        'Примите упор лежа на предплечьях',
        'Выровняйте тело в прямую линию от головы до пяток',
        'Напрягите мышцы пресса, ягодиц и ног',
        'Дышите равномерно, не задерживайте дыхание',
        'Удерживайте позицию, не прогибаясь в пояснице',
      ];
    }

    return instructions;
  };

  // Генерация советов
  const generateTips = () => {
    const muscleGroup = exercise.muscleGroup;
    const name = exercise.name.toLowerCase();
    
    const baseTips: Record<MuscleGroup, string[]> = {
      [MuscleGroup.Chest]: [
        'Не используйте инерцию — контролируйте каждое движение',
        'Не разводите локти слишком широко — это может травмировать плечи',
        'Дышите правильно: вдох при опускании, выдох при подъеме',
        'Разминка обязательна перед тяжелыми подходами',
      ],
      [MuscleGroup.Back]: [
        'Акцент на технике важнее веса',
        'Не тяните руками — работайте спиной и лопатками',
        'Полное растяжение мышц в нижней точке',
        'Избегайте раскачивания корпуса',
      ],
      [MuscleGroup.Legs]: [
        'Колени не должны выходить за носки',
        'Приседайте глубоко, но без боли',
        'Равномерно распределяйте вес на всю стопу',
        'Не скругляйте спину в нижней точке',
      ],
      [MuscleGroup.Shoulders]: [
        'Не жертвуйте амплитудой ради веса',
        'Избегайте рывков в начале движения',
        'Контролируйте опускание веса',
        'Разминайте плечевые суставы перед тренировкой',
      ],
      [MuscleGroup.Arms]: [
        'Фиксируйте локти — работают только предплечья',
        'Полная амплитуда движения',
        'Не помогайте себе корпусом',
        'Не разгибайте руки полностью в нижней точке',
      ],
      [MuscleGroup.Core]: [
        'Качество важнее количества повторений',
        'Не задерживайте дыхание',
        'Напрягайте мышцы пресса, а не просто держите позицию',
        'Сочетайте статические и динамические упражнения',
      ],
    };

    let tips = baseTips[muscleGroup] || baseTips[MuscleGroup.Chest];
    
    if (name.includes('отжимания')) {
      tips = [
        'Держите корпус прямым — как доска',
        'Не опускайте голову — смотрите перед собой',
        'Если сложно, начните с колен или наклонных отжиманий',
        'Увеличивайте нагрузку постепенно',
      ];
    } else if (name.includes('приседания')) {
      tips = [
        'Колени не должны "гулять" внутрь или наружу',
        'Держите вес на пятках, не переносите на носки',
        'Глубина приседания зависит от гибкости — не переусердствуйте',
        'При проблемах с коленями используйте частичную амплитуду',
      ];
    } else if (name.includes('планка')) {
      tips = [
        'Начните с 20-30 секунд и постепенно увеличивайте время',
        'Если трясутся руки — это нормально, значит работает',
        'Не прогибайтесь в пояснице — это опасно',
        'Если сложно, делайте на прямых руках вместо предплечий',
      ];
    }

    return tips;
  };

  const instructions = generateInstructions();
  const tips = generateTips();
  const muscleColor = getMuscleGroupColor(exercise.muscleGroup);

  // Обработка YouTube URL
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // Извлекаем ID из различных форматов YouTube URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return null;
  };

  const youtubeEmbedUrl = exercise.videoUrl ? getYouTubeEmbedUrl(exercise.videoUrl) : null;

  const handleStartExercise = () => {
    navigate(ROUTES.CLIENT.TODAY);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 safe-area-bottom">
      {/* Кнопка "Назад" и заголовок */}
      <div className="mb-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span>←</span>
          <span>Назад</span>
        </button>
        
        <div className="flex items-start gap-4">
          <h1 className="text-2xl sm:text-4xl font-bold flex-1 break-words min-w-0">{exercise.name}</h1>
          <span
            className="px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${muscleColor} 0%, ${muscleColor}dd 100%)`,
              boxShadow: `0 2px 8px ${muscleColor}40`,
            }}
          >
            {getMuscleGroupName(exercise.muscleGroup)}
          </span>
        </div>
      </div>

      {/* Видео блок */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {youtubeEmbedUrl ? (
          <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={youtubeEmbedUrl}
              title={exercise.name}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>
        ) : (
          <div
            className="aspect-video w-full rounded-2xl overflow-hidden relative flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${muscleColor}20 0%, var(--color-card-hover) 100%)`,
              border: `2px solid ${muscleColor}40`,
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="text-8xl mb-4 opacity-50">📹</div>
              <p
                className="text-xl font-semibold px-6 py-3 rounded-2xl backdrop-blur-md"
                style={{
                  background: 'rgba(24, 24, 27, 0.8)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                Видео скоро появится
              </p>
            </div>
            {/* Декоративные элементы */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${muscleColor}40 0%, transparent 70%)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Описание */}
      <div
        className="card mb-8 animate-fade-in"
        style={{
          animationDelay: '0.2s',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2 className="text-2xl font-bold mb-4">Описание</h2>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {exercise.description}
        </p>
      </div>

      {/* Техника выполнения */}
      <div
        className="card mb-8 animate-fade-in"
        style={{
          animationDelay: '0.3s',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2 className="text-2xl font-bold mb-4">Техника выполнения</h2>
        <ol className="space-y-3">
          {instructions.map((instruction, index) => (
            <li key={index} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${muscleColor} 0%, ${muscleColor}dd 100%)`,
                }}
              >
                {index + 1}
              </span>
              <span className="text-base leading-relaxed pt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {instruction}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* На что обратить внимание */}
      <div
        className="card mb-8 animate-fade-in"
        style={{
          animationDelay: '0.4s',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2 className="text-2xl font-bold mb-4">На что обратить внимание</h2>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <span className="text-base leading-relaxed pt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Работающие мышцы */}
      <div
        className="card mb-8 animate-fade-in"
        style={{
          animationDelay: '0.5s',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2 className="text-2xl font-bold mb-4">Работающие мышцы</h2>
        <div className="flex flex-wrap gap-3">
          <span
            className="px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${muscleColor} 0%, ${muscleColor}dd 100%)`,
              boxShadow: `0 2px 8px ${muscleColor}40`,
            }}
          >
            {getMuscleGroupName(exercise.muscleGroup)}
          </span>
          {/* Можно добавить дополнительные мышцы в зависимости от упражнения */}
        </div>
      </div>

      {/* Кнопка "Начать это упражнение" */}
      {isInTodayPlan && (
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button
            onClick={handleStartExercise}
            variant="primary"
            className="w-full py-4 text-lg font-semibold"
            style={{
              background: 'linear-gradient(135deg, #ff5252 0%, #ff6b6b 100%)',
              boxShadow: '0 8px 24px -4px rgba(255, 82, 82, 0.4)',
            }}
          >
            🏋️ Начать это упражнение
          </Button>
        </div>
      )}
    </div>
  );
}
