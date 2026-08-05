const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM fournisseurs ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { code, nom, telephone, email, adresse, ville, wilaya, type } = req.body;
  const date = new Date().toISOString().split('T')[0];
  db.run(`INSERT INTO fournisseurs (code, nom, telephone, email, adresse, ville, wilaya, type, solde, date_ajout) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [code, nom, telephone, email, adresse, ville, wilaya, type, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Fournisseur ajouté' });
    }
  );
});

router.put('/:id', (req, res) => {
  const { nom, telephone, email, adresse, ville, wilaya, type, solde } = req.body;
  db.run(`UPDATE fournisseurs SET nom=?, telephone=?, email=?, adresse=?, ville=?, wilaya=?, type=?, solde=? WHERE id=?`,
    [nom, telephone, email, adresse, ville, wilaya, type, solde, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Fournisseur modifié' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM fournisseurs WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Fournisseur supprimé' });
  });
});

module.exports = router;
