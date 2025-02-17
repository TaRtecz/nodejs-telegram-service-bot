import db from '../database/db.js';

const getReminder = (userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM reminders WHERE user_id = ?', [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const createReminder = (userId) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO reminders (user_id) VALUES (?)', [userId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const updateReminder = (userId, isEnabled, day, time) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE reminders SET is_enabled = ?, day = ?, time = ? WHERE user_id = ?',
      [isEnabled, day, time, userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export { getReminder, createReminder, updateReminder };