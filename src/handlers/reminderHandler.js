import { getReminder, createReminder, updateReminder } from '../services/reminderService.js';

const remindHandler = (bot) => (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  getReminder(userId)
    .then((reminder) => {
      if (!reminder) {
        return createReminder(userId)
          .then(() => {
            bot.sendMessage(chatId, 'Напоминания отключены. Хотите включить? (да/нет)');
            bot.once('message', (msg) => {
              const response = msg.text.toLowerCase();
              if (response === 'да') {
                updateReminder(userId, 1, 1, '09:00')
                  .then(() => {
                    bot.sendMessage(chatId, 'Напоминания включены. Введите день месяца для напоминания (например, 1):');
                    bot.once('message', (msg) => {
                      const day = parseInt(msg.text);
                      if (isNaN(day)) {
                        bot.sendMessage(chatId, 'Пожалуйста, введите корректный день.');
                      } else {
                        bot.sendMessage(chatId, 'Теперь введите время для напоминания (например, 09:00):');
                        bot.once('message', (msg) => {
                          const time = msg.text;
                          updateReminder(userId, 1, day, time)
                            .then(() => {
                              bot.sendMessage(chatId, `Напоминания настроены на ${day} число в ${time}.`);
                            })
                            .catch(() => {
                              bot.sendMessage(chatId, 'Ошибка при сохранении времени.');
                            });
                        });
                      }
                    });
                  })
                  .catch(() => {
                    bot.sendMessage(chatId, 'Ошибка при включении напоминаний.');
                  });
              } else {
                bot.sendMessage(chatId, 'Напоминания остаются отключенными.');
              }
            });
          });
      } else {
        const status = reminder.is_enabled ? 'включены' : 'отключены';
        bot.sendMessage(chatId, `Напоминания ${status}. Хотите изменить настройки? (да/нет)`);
        bot.once('message', (msg) => {
          const response = msg.text.toLowerCase();
          if (response === 'да') {
            bot.sendMessage(chatId, 'Введите "включить" или "выключить":');
            bot.once('message', (msg) => {
              const action = msg.text.toLowerCase();
              if (action === 'включить') {
                updateReminder(userId, 1, reminder.day, reminder.time)
                  .then(() => {
                    bot.sendMessage(chatId, 'Напоминания включены.');
                  })
                  .catch(() => {
                    bot.sendMessage(chatId, 'Ошибка при включении напоминаний.');
                  });
              } else if (action === 'выключить') {
                updateReminder(userId, 0, reminder.day, reminder.time)
                  .then(() => {
                    bot.sendMessage(chatId, 'Напоминания выключены.');
                  })
                  .catch(() => {
                    bot.sendMessage(chatId, 'Ошибка при выключении напоминаний.');
                  });
              } else {
                bot.sendMessage(chatId, 'Неверная команда. Используйте "включить" или "выключить".');
              }
            });
          } else {
            bot.sendMessage(chatId, 'Настройки напоминаний не изменены.');
          }
        });
      }
    })
    .catch(() => {
      bot.sendMessage(chatId, 'Ошибка при получении настроек напоминаний.');
    });
};

export { remindHandler };