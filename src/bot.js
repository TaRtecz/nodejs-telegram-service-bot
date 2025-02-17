import TelegramBot from 'node-telegram-bot-api';
import config from './config.js';
import runMigrations from './database/migrations.js';
import { startHandler } from './handlers/userHandler.js';
import { remindHandler } from './handlers/reminderHandler.js';
import { sendReminders } from './cron/reminderCron.js';
import { submitHandler } from './handlers/submitHandler.js';
import { listHandler } from './handlers/listHandler.js';

// Инициализация бота
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

// Запуск миграций
runMigrations();

// Подключение обработчиков
bot.onText(/\/start/, startHandler(bot));
bot.onText(/\/remind/, remindHandler(bot));
bot.onText(/\/submit/, submitHandler(bot));
bot.onText(/\/list/, listHandler(bot));

// Запуск планировщика напоминаний
sendReminders(bot);

console.log('Бот запущен...');