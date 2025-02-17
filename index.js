const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cron = require('node-cron');

// Инициализация бота
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Подключение к базе данных
const db = new sqlite3.Database('meters.db');

// Создание таблиц
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY,
      address TEXT,
      account_number TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS meters (
      user_id INTEGER,
      meter_type TEXT,
      last_reading REAL,
      FOREIGN KEY (user_id) REFERENCES users (user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      user_id INTEGER,
      meter_type TEXT,
      reading REAL,
      date TEXT,
      FOREIGN KEY (user_id) REFERENCES users (user_id)
    )
  `);
});

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
    if (row) {
      bot.sendMessage(chatId, 'Вы уже зарегистрированы. Используйте /submit для передачи показаний.');
    } else {
      bot.sendMessage(chatId, 'Привет! Давайте зарегистрируем вас. Введите ваш адрес:');
      bot.once('message', (msg) => {
        const address = msg.text;
        db.run('INSERT INTO users (user_id, address) VALUES (?, ?)', [userId, address], (err) => {
          if (err) {
            bot.sendMessage(chatId, 'Ошибка при сохранении адреса.');
          } else {
            bot.sendMessage(chatId, 'Адрес сохранен. Теперь введите ваш лицевой счет:');
            bot.once('message', (msg) => {
              const accountNumber = msg.text;
              db.run('UPDATE users SET account_number = ? WHERE user_id = ?', [accountNumber, userId], (err) => {
                if (err) {
                  bot.sendMessage(chatId, 'Ошибка при сохранении лицевого счета.');
                } else {
                  bot.sendMessage(chatId, 'Регистрация завершена! Теперь вы можете передавать показания с помощью /submit.');
                }
              });
            });
          }
        });
      });
    }
  });
});

// Команда /submit
bot.onText(/\/submit/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  bot.sendMessage(chatId, 'Введите тип счетчика (вода/газ/электричество):');
  bot.once('message', (msg) => {
    const meterType = msg.text;
    bot.sendMessage(chatId, `Введите текущие показания для ${meterType}:`);
    bot.once('message', (msg) => {
      const reading = parseFloat(msg.text);
      if (isNaN(reading)) {
        bot.sendMessage(chatId, 'Пожалуйста, введите корректное число.');
      } else {
        db.run('INSERT INTO history (user_id, meter_type, reading, date) VALUES (?, ?, ?, datetime("now"))', [userId, meterType, reading], (err) => {
          if (err) {
            bot.sendMessage(chatId, 'Ошибка при сохранении показаний.');
          } else {
            db.run('UPDATE meters SET last_reading = ? WHERE user_id = ? AND meter_type = ?', [reading, userId, meterType], (err) => {
              if (err) {
                bot.sendMessage(chatId, 'Ошибка при обновлении счетчика.');
              } else {
                bot.sendMessage(chatId, `Показания для ${meterType} успешно сохранены!`);
              }
            });
          }
        });
      }
    });
  });
});

// Команда /history
bot.onText(/\/history/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  db.all('SELECT * FROM history WHERE user_id = ?', [userId], (err, rows) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при получении истории.');
    } else if (rows.length === 0) {
      bot.sendMessage(chatId, 'История показаний пуста.');
    } else {
      let historyText = 'Ваша история показаний:\n';
      rows.forEach((row) => {
        historyText += `${row.meter_type}: ${row.reading} (${row.date})\n`;
      });
      bot.sendMessage(chatId, historyText);
    }
  });
});

// Напоминания (опционально)
cron.schedule('0 9 1 * *', () => {
  db.all('SELECT user_id FROM users', (err, rows) => {
    if (!err) {
      rows.forEach((row) => {
        bot.sendMessage(row.user_id, 'Не забудьте передать показания счетчиков!');
      });
    }
  });
});

// Запуск Express (опционально)
const app = express();
app.get('/', (req, res) => {
  res.send('Бот работает!');
});
app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});