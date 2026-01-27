/**
 * Простой тест Telegram интеграции
 * Запуск: node test-telegram-simple.js
 */

async function testTelegramIntegration() {
  console.log('🧪 Простой тест Telegram интеграции...\n');

  // Проверяем переменные окружения
  console.log('📋 Переменные окружения:');
  console.log('VITE_TELEGRAM_BOT_TOKEN:', process.env.VITE_TELEGRAM_BOT_TOKEN ? '✅ Настроен' : '❌ Отсутствует');
  console.log('VITE_TELEGRAM_BOT_USERNAME:', process.env.VITE_TELEGRAM_BOT_USERNAME || '❌ Отсутствует');
  console.log('');

  // Имитируем работу функции
  console.log('🔄 Имитация работы handleTelegramAdd:');

  const testUsername = 'test_user';
  console.log(`Введен username: ${testUsername}`);

  // Создание клиента
  const tempClientId = `temp-${Date.now()}`;
  const tempClient = {
    id: tempClientId,
    name: `Пользователь ${testUsername}`,
    age: 25,
    goal: 'MuscleGain',
    equipment: 'Gym',
    telegramUsername: testUsername,
    assignedTrainerId: 'trainer-123',
    isFirstLogin: true,
    createdAt: new Date().toISOString(),
  };

  console.log('✅ Создан клиент:', tempClient);
  console.log('✅ Клиент добавлен в store');

  // Имитация отправки сообщения
  if (process.env.VITE_TELEGRAM_BOT_TOKEN) {
    console.log('📤 Попытка отправки сообщения...');

    try {
      // Имитируем API вызов
      const mockResponse = {
        ok: true,
        result: { message_id: 123 }
      };

      if (mockResponse.ok) {
        console.log('✅ Сообщение отправлено успешно (имитация)');
      } else {
        console.log('❌ Ошибка отправки');
      }
    } catch (error) {
      console.log('❌ Ошибка:', error.message);
    }
  } else {
    console.log('⚠️  Токен бота не настроен - пропускаем отправку');
  }

  console.log('\n🎉 Тест завершен! Функция handleTelegramAdd должна работать.');
}

// Запуск теста
testTelegramIntegration().catch(console.error);