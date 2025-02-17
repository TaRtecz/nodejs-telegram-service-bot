// src/handlers/listHandler.js
import db from '../database/db.js';

const listHandler = (bot) => (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Запрашиваем историю показаний из базы данных
  db.all(
    'SELECT meter_type, reading, date FROM history WHERE user_id = ? ORDER BY date DESC',
    [userId],
    (err, rows) => {
      if (err) {
        bot.sendMessage(chatId, 'Ошибка при получении истории показаний.');
        return;
      }

      if (rows.length === 0) {
        // Если история пуста
        bot.sendMessage(chatId, 'Вы еще не передавали показания.');
      } else {
        // Форматируем данные в виде списка
        let historyText = '📋 Ваша история показаний:\n\n';
        rows.forEach((row, index) => {
          historyText += `🔹 ${row.meter_type}: ${row.reading} (${row.date})\n`;
        });

        // Отправляем отформатированный список пользователю
        bot.sendMessage(chatId, historyText);
      }
    }
  );
};

export { listHandler };