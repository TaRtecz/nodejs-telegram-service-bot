import cron from 'node-cron';
import db from '../database/db.js';

const sendReminders = (bot) => {
  db.all('SELECT * FROM reminders WHERE is_enabled = 1', (err, rows) => {
    if (!err) {
      rows.forEach((row) => {
        const cronTime = `0 ${row.time.split(':')[1]} ${row.time.split(':')[0]} ${row.day} * *`;
        cron.schedule(cronTime, () => {
          bot.sendMessage(row.user_id, 'Не забудьте передать показания счетчиков!');
        });
      });
    }
  });
};

export { sendReminders };