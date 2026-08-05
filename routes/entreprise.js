const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM info_entreprise', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.put('/', (req, res) => {
  const data = req.body;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    Object.entries(data).forEach(([champ, valeur]) => {
      db.run('INSERT OR REPLACE INTO info_entreprise (champ, valeur) VALUES (?, ?)', [champ, valeur]);
    });
    db.run('COMMIT', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Informations entreprise mises à jour' });
    });
  });
});

module.exports = router;
