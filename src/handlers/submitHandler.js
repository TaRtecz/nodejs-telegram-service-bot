// src/handlers/submitHandler.js
import db from '../database/db.js';

const submitHandler = (bot) => (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Запрашиваем тип счетчика
  bot.sendMessage(chatId, 'Введите тип счетчика (вода/газ/электричество):');

  // Ожидаем ответа с типом счетчика
  bot.once('message', (msg) => {
    const meterType = msg.text.toLowerCase();

    // Запрашиваем текущие показания
    bot.sendMessage(chatId, `Введите текущие показания для ${meterType}:`);

    // Ожидаем ответа с показаниями
    bot.once('message', async (msg) => {
      const reading = parseFloat(msg.text);

      // Проверяем корректность показаний
      if (isNaN(reading)) {
        bot.sendMessage(chatId, 'Пожалуйста, введите корректное число.');
        return;
      }

      // Получаем последние показания для проверки
      db.get(
        'SELECT last_reading FROM meters WHERE user_id = ? AND meter_type = ?',
        [userId, meterType],
        (err, row) => {
          if (err) {
            bot.sendMessage(chatId, 'Ошибка при получении данных.');
            return;
          }

          // Проверяем, чтобы новые показания были больше предыдущих
          if (row && reading <= row.last_reading) {
            bot.sendMessage(chatId, 'Новые показания должны быть больше предыдущих.');
            return;
          }

          // Сохраняем показания в базу данных
          db.run(
            'INSERT INTO history (user_id, meter_type, reading, date) VALUES (?, ?, ?, datetime("now"))',
            [userId, meterType, reading],
            (err) => {
              if (err) {
                bot.sendMessage(chatId, 'Ошибка при сохранении показаний.');
              } else {
                // Обновляем последние показания в таблице meters
                db.run(
                  'INSERT OR REPLACE INTO meters (user_id, meter_type, last_reading) VALUES (?, ?, ?)',
                  [userId, meterType, reading],
                  (err) => {
                    if (err) {
                      bot.sendMessage(chatId, 'Ошибка при обновлении счетчика.');
                    } else {
                      bot.sendMessage(chatId, `Показания для ${meterType} успешно сохранены!`);
                    }
                  }
                );
              }
            }
          );
        }
      );
    });
  });
};

export { submitHandler };