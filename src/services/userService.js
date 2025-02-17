import db from '../database/db.js';

const getUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const createUser = (userId, address) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO users (user_id, address) VALUES (?, ?)', [userId, address], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const updateUserAccount = (userId, accountNumber) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE users SET account_number = ? WHERE user_id = ?', [accountNumber, userId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export { getUser, createUser, updateUserAccount };