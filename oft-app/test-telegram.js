/**
 * Тестовый скрипт для проверки Telegram интеграции
 * Запуск: node test-telegram.js
 */

const { sendTelegramMessage } = require('./config/telegram');

// Тестовая функция
async function testTelegramIntegration() {
  console.log('🧪 Тестирование Telegram интеграции...\n');

  // Проверяем переменные окружения
  console.log('📋 Проверка переменных окружения:');
  console.log('BOT_TOKEN:', process.env.VITE_TELEGRAM_BOT_TOKEN ? '✅ Настроен' : '❌ Отсутствует');
  console.log('BOT_USERNAME:', process.env.VITE_TELEGRAM_BOT_USERNAME || '❌ Отсутствует');
  console.log('');

  // Тест отправки сообщения (если токен настроен)
  if (process.env.VITE_TELEGRAM_BOT_TOKEN) {
    console.log('📤 Тест отправки сообщения...');

    try {
      // Замените на реальный chat_id для тестирования
      const testChatId = '123456789'; // Ваш Telegram chat ID
      const result = await sendTelegramMessage(testChatId, '🧪 Тестовое сообщение от OFT');

      if (result.ok) {
        console.log('✅ Сообщение отправлено успешно');
      } else {
        console.log('❌ Ошибка отправки:', result.error);
      }
    } catch (error) {
      console.log('❌ Ошибка:', error.message);
    }
  } else {
    console.log('⚠️  Пропускаем тест отправки - токен не настроен');
    console.log('   Настройте VITE_TELEGRAM_BOT_TOKEN в .env файле');
  }

  console.log('\n📚 Следующие шаги:');
  console.log('1. Создайте бота через @BotFather');
  console.log('2. Добавьте токен в .env');
  console.log('3. Создайте таблицу telegram_users в Supabase');
  console.log('4. Запустите backend: npm run backend');
  console.log('5. Настройте webhook в BotFather');
}

// Запуск теста
testTelegramIntegration().catch(console.error);