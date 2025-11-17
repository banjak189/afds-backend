const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('afds.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    passwordHash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

console.log('users table ready');
db.close();