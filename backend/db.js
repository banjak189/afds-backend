const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'afds.db'));

// ---------- feedback ----------
function saveFeedback(rating, comment, cb) {
  db.run(`INSERT INTO feedback (rating, comment) VALUES (?, ?)`, [rating, comment], function (err) { cb(err, this?.lastID); });
}
function getAllFeedback(cb) {
  db.all(`SELECT * FROM feedback ORDER BY created_at DESC`, cb);
}

// ---------- discounts ----------
function saveDiscount(customerId, code, percent, cb) {
  db.run(`INSERT INTO discounts (customerId, code, percent) VALUES (?, ?, ?)`, [customerId, code, percent], function (err) { cb(err, this?.lastID); });
}
function getDiscountsByCustomer(customerId, cb) {
  db.all(`SELECT * FROM discounts WHERE customerId = ? ORDER BY created_at DESC`, [customerId], cb);
}

// ---------- security alerts ----------
function saveAlert(type, desc, cb) {
  db.run(`INSERT INTO security_alerts (type, desc) VALUES (?, ?)`, [type, desc], function (err) { cb(err, this?.lastID); });
}
function getAllAlerts(cb) {
  db.all(`SELECT * FROM security_alerts ORDER BY created_at DESC`, cb);
}
// real-time counts
function getFeedbackCount(cb) {
  db.get(`SELECT COUNT(*) AS c FROM feedback`, (err, row) => cb(err, row?.c || 0));
}
function getDiscountCount(cb) {
  db.get(`SELECT COUNT(*) AS c FROM discounts`, (err, row) => cb(err, row?.c || 0));
}
function getAlertCount(cb) {
  db.get(`SELECT COUNT(*) AS c FROM security_alerts`, (err, row) => cb(err, row?.c || 0));
}
function saveUser(email, passwordHash, cb) {
  db.run(`INSERT INTO users (email, passwordHash) VALUES (?, ?)`, [email, passwordHash], function (err) { cb(err, this?.lastID); });
}
function findUserByEmail(email, cb) {
  db.get(`SELECT * FROM users WHERE email = ?`, [email], cb);
}
module.exports = {
  saveFeedback, getAllFeedback,
  saveDiscount, getDiscountsByCustomer,
  saveAlert, getAllAlerts,
  getFeedbackCount, getDiscountCount, getAlertCount,
  saveUser, findUserByEmail
};
