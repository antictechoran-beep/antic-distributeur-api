const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/search/:q', (req, res) => {
  const q = `%${req.params.q}%`;
  db.all(`SELECT * FROM clients WHERE nom LIKE ? OR telephone LIKE ? OR ville LIKE ?`, 
    [q, q, q], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
});

router.post('/', (req, res) => {
  const { code, nom, telephone, email, adresse, ville, wilaya, type } = req.body;
  const date = new Date().toISOString().split('T')[0];
  db.run(`INSERT INTO clients (code, nom, telephone, email, adresse, ville, wilaya, type, solde, date_ajout) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [code, nom, telephone, email, adresse, ville, wilaya, type, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Client ajouté' });
    }
  );
});

router.put('/:id', (req, res) => {
  const { nom, telephone, email, adresse, ville, wilaya, type, solde } = req.body;
  db.run(`UPDATE clients SET nom=?, telephone=?, email=?, adresse=?, ville=?, wilaya=?, type=?, solde=? WHERE id=?`,
    [nom, telephone, email, adresse, ville, wilaya, type, solde, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Client modifié' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM clients WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Client supprimé' });
  });
});

module.exports = router;
