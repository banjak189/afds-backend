require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { saveUser, findUserByEmail } = require('./db');

const express = require('express');
const cors = require('cors');
const path = require('path');
const { saveFeedback, getAllFeedback, saveDiscount, getDiscountsByCustomer, saveAlert, getAllAlerts, getFeedbackCount, getDiscountCount, getAlertCount } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
console.log('Static folder:', path.resolve(__dirname, '../public'));
app.use(express.static(path.join(__dirname,'../public')));
// ---------- root ----------
app.get('/', (_req, res) => res.json({ message: 'AFDS back-end alive' }));

// ---------- feedback ----------
app.post('/api/feedback', (req, res) => {
  const { rating, comment } = req.body;
  if (!rating) return res.status(400).json({ error: 'rating required' });
  saveFeedback(rating, comment, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true, id });
  });
});
app.get('/api/feedback', (_req, res) => {
  getAllFeedback((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------- discounts ----------
app.get('/api/discount/:customerId', (req, res) => {
  // fake generation + store
  const code = 'SAVE' + Math.floor(10 + Math.random() * 90);
  const percent = Math.floor(10 + Math.random() * 20);
  saveDiscount(req.params.customerId, code, percent, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ code, percent, id });
  });
});
app.get('/api/discounts/:customerId', (req, res) => {
  getDiscountsByCustomer(req.params.customerId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------- security alerts ----------
app.post('/api/security-alert', (req, res) => {
  const { type, desc } = req.body;
  if (!type || !desc) return res.status(400).json({ error: 'type & desc required' });
  saveAlert(type, desc, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ alertId: id, status: 'logged' });
  });
});
app.get('/api/security-alerts', (_req, res) => {
  getAllAlerts((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------- analytics ----------
app.get('/api/analytics', (_req, res) => {
  getFeedbackCount((err, fb) => {
    if (err) return res.status(500).json({ error: err.message });
    getDiscountCount((err2, dis) => {
      if (err2) return res.status(500).json({ error: err2.message });
      getAlertCount((err3, alt) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ totalFeedback: fb, discountsIssued: dis, alerts: alt });
      });
    });
  });
});

app.use((req, res, next) => {
  console.log('Static request:', req.method, req.url);
  next();
});
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  try {
    const existing = await new Promise((resolve, reject) => {
      findUserByEmail(email, (err, row) => err ? reject(err) : resolve(row));
    });
    if (existing) return res.status(409).json({ error: 'email taken' });

    const hash = await bcrypt.hash(password, 10);
    const id = await new Promise((resolve, reject) => {
      saveUser(email, hash, (err, lastID) => err ? reject(err) : resolve(lastID));
    });

    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// ---------- start ----------
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AFDS server listening on port ${PORT}`);
});
