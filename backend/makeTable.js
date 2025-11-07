const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('afds.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS discounts(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customerId TEXT,
          code TEXT,
          percent INT,
          used BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  db.run(`CREATE TABLE IF NOT EXISTS security_alerts(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT,
          desc TEXT,
          resolved BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
});

console.log('Tables discounts & security_alerts created/ok');
db.close();