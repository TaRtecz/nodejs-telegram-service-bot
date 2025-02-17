import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('meters.db', (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
  } else {
    console.log('Подключение к базе данных успешно установлено.');
  }
});

export default db;