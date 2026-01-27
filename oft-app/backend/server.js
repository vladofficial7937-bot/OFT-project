const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Supabase client (для тестирования)
const mockSupabase = {
  from: (table) => ({
    upsert: (data) => Promise.resolve({ error: null }),
    update: (data) => ({ eq: () => Promise.resolve({ error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) })
  })
};

// Supabase client (mock для тестирования)
let supabase;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_url') {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  } else {
    console.log('Using mock Supabase client');
    supabase = mockSupabase;
  }
} catch (error) {
  console.log('Supabase not configured, using mock client');
  supabase = mockSupabase;
}

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Webhook endpoint for Telegram
app.post('/webhook/telegram', async (req, res) => {
  try {
    const update = req.body;
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));

    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      console.log('Processing callback:', data);

      // Parse callback data
      const [action, clientId] = data.split('_');

      if (action === 'accept') {
        // User accepted invitation
        console.log('User accepted invitation, client ID:', clientId);

        // Update client status in database
        const { error } = await supabase
          .from('clients')
          .update({
            is_first_login: false,
            telegram_id: callbackQuery.from.id.toString()
          })
          .eq('id', clientId);

        if (error) {
          console.error('Error updating client:', error);
          await sendTelegramMessage(chatId, 'Произошла ошибка при подтверждении. Попробуйте позже.');
        } else {
          await sendTelegramMessage(chatId, '✅ Добро пожаловать в OFT! Ваш тренер уже ждёт вас в приложении.');
        }

      } else if (action === 'decline') {
        // User declined invitation
        console.log('User declined invitation, client ID:', clientId);

        // Remove client from database
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', clientId);

        if (error) {
          console.error('Error deleting client:', error);
        }

        await sendTelegramMessage(chatId, '❌ Приглашение отклонено.');
      }

      // Answer callback query
      await answerCallbackQuery(callbackQuery.id);
    }

    // Handle /start command
    if (update.message && update.message.text === '/start') {
      const chatId = update.message.chat.id;
      const username = update.message.from.username;
      const firstName = update.message.from.first_name;

      console.log('User started bot:', { chatId, username, firstName });

      // Save or update telegram user
      const { error } = await supabase
        .from('telegram_users')
        .upsert({
          chat_id: chatId.toString(),
          username: username,
          first_name: firstName,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving telegram user:', error);
      }

      await sendTelegramMessage(
        chatId,
        `Привет, ${firstName}! 👋\n\nВы успешно зарегистрированы в боте OFT.\nВаш тренер сможет добавить вас в свой список клиентов.`
      );
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Function to send message via Telegram API
async function sendTelegramMessage(chatId, text, options = {}) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      ...options
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Telegram API error:', result);
    }
    return result;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { ok: false, error: error.message };
  }
}

// Function to answer callback query
async function answerCallbackQuery(callbackQueryId) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error answering callback query:', error);
    return { ok: false, error: error.message };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Telegram webhook URL: https://your-domain.com/webhook/telegram`);
});