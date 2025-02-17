import db from './db.js';

const runMigrations = () => {
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

    db.run(`
      CREATE TABLE IF NOT EXISTS reminders (
        user_id INTEGER PRIMARY KEY,
        is_enabled BOOLEAN DEFAULT 0,
        day INTEGER DEFAULT 1,
        time TEXT DEFAULT '09:00',
        FOREIGN KEY (user_id) REFERENCES users (user_id)
      )
    `);
  });
};

export default runMigrations;