import { getUser, createUser, updateUserAccount } from '../services/userService.js';

const startHandler = (bot) => (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  getUser(userId)
    .then((user) => {
      if (user) {
        bot.sendMessage(chatId, 'Вы уже зарегистрированы. Используйте /submit для передачи показаний.');
      } else {
        bot.sendMessage(chatId, 'Привет! Давайте зарегистрируем вас. Введите ваш адрес:');
        bot.once('message', (msg) => {
          const address = msg.text;
          createUser(userId, address)
            .then(() => {
              bot.sendMessage(chatId, 'Адрес сохранен. Теперь введите ваш лицевой счет:');
              bot.once('message', (msg) => {
                const accountNumber = msg.text;
                updateUserAccount(userId, accountNumber)
                  .then(() => {
                    bot.sendMessage(chatId, 'Регистрация завершена! Теперь вы можете передавать показания с помощью /submit.');
                  })
                  .catch(() => {
                    bot.sendMessage(chatId, 'Ошибка при сохранении лицевого счета.');
                  });
              });
            })
            .catch(() => {
              bot.sendMessage(chatId, 'Ошибка при сохранении адреса.');
            });
        });
      }
    })
    .catch(() => {
      bot.sendMessage(chatId, 'Ошибка при получении данных пользователя.');
    });
};

export { startHandler };