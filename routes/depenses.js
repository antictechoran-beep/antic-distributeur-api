const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM depenses ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { num_depense, date, categorie, description, montant, mode_paiement, beneficiaire, responsable } = req.body;
  db.run(`INSERT INTO depenses (num_depense, date, categorie, description, montant, mode_paiement, 
          beneficiaire, justificatif, statut, responsable) VALUES (?, ?, ?, ?, ?, ?, ?, 'Oui', 'Payée', ?)`,
    [num_depense, date, categorie, description, montant, mode_paiement, beneficiaire, responsable],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Dépense ajoutée' });
    }
  );
});

router.put('/:id', (req, res) => {
  const { categorie, description, montant, mode_paiement, beneficiaire, statut } = req.body;
  db.run(`UPDATE depenses SET categorie=?, description=?, montant=?, mode_paiement=?, beneficiaire=?, statut=? WHERE id=?`,
    [categorie, description, montant, mode_paiement, beneficiaire, statut, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Dépense modifiée' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM depenses WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dépense supprimée' });
  });
});

module.exports = router;
