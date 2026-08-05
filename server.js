const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// تقديم ملفات public (CSS, JS, HTML...)
app.use(express.static(path.join(__dirname, 'public')));

const authMiddleware = require('./middleware/auth');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/stock', authMiddleware, require('./routes/stock'));
app.use('/api/clients', authMiddleware, require('./routes/clients'));
app.use('/api/ventes', authMiddleware, require('./routes/ventes'));
app.use('/api/achats', authMiddleware, require('./routes/achats'));
app.use('/api/fournisseurs', authMiddleware, require('./routes/fournisseurs'));
app.use('/api/depenses', authMiddleware, require('./routes/depenses'));
app.use('/api/users', authMiddleware, require('./routes/users'));
app.use('/api/barcode', authMiddleware, require('./routes/barcode'));
app.use('/api/entreprise', authMiddleware, require('./routes/entreprise'));
app.use('/api/numeros', authMiddleware, require('./routes/numeros'));

// الصفحة الرئيسية - إعادة توجيه إلى app.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.get('/app.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📱 Accès réseau local: http://<IP_LOCAL>:${PORT}`);
});
