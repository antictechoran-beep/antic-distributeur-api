const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM achats ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { num_bon, code_fournisseur, nom_fournisseur, code_produit, nom_produit, 
          quantite, prix_achat, mode_paiement, responsable } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const total = (quantite || 0) * (prix_achat || 0);
  db.run(`INSERT INTO achats (num_bon, date, code_fournisseur, nom_fournisseur, code_produit, 
          nom_produit, quantite, prix_achat, total, mode_paiement, statut, responsable) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Reçu', ?)`,
    [num_bon, date, code_fournisseur, nom_fournisseur, code_produit, nom_produit,
     quantite, prix_achat, total, mode_paiement, responsable],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run('UPDATE stock SET quantite = quantite + ? WHERE code = ?', [quantite, code_produit]);
      res.json({ id: this.lastID, message: 'Achat enregistré' });
    }
  );
});

router.delete('/:num_bon', (req, res) => {
  db.run('DELETE FROM achats WHERE num_bon = ?', [req.params.num_bon], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Bon supprimé' });
  });
});

module.exports = router;
