const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const { vendeur, date, client } = req.query;
  let sql = 'SELECT * FROM ventes WHERE 1=1';
  const params = [];
  if (vendeur) { sql += ' AND vendeur = ?'; params.push(vendeur); }
  if (date) { sql += ' AND date = ?'; params.push(date); }
  if (client) { sql += ' AND nom_client = ?'; params.push(client); }
  sql += ' ORDER BY id DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { num_facture, code_client, nom_client, items, mode_paiement, montant_paye, vendeur } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const total = items.reduce((s, i) => s + (i.quantite * i.prix_unitaire), 0);
  const reste = Math.max(0, total - (montant_paye || 0));
  const statut = (montant_paye || 0) >= total ? 'Payée' : 'En attente';

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    items.forEach(item => {
      db.run(`INSERT INTO ventes (num_facture, date, code_client, nom_client, code_produit, 
              nom_produit, quantite, prix_unitaire, total, mode_paiement, statut, vendeur, 
              montant_paye, reste) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [num_facture, date, code_client, nom_client, item.code_produit, item.nom_produit,
         item.quantite, item.prix_unitaire, item.quantite * item.prix_unitaire, 
         mode_paiement, statut, vendeur, montant_paye, reste]
      );
      db.run('UPDATE stock SET quantite = quantite - ? WHERE code = ?', 
        [item.quantite, item.code_produit]);
    });
    db.run('COMMIT', (err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      res.json({ num_facture, total, message: 'Vente enregistrée' });
    });
  });
});

router.delete('/:num_facture', (req, res) => {
  db.run('DELETE FROM ventes WHERE num_facture = ?', [req.params.num_facture], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Facture supprimée' });
  });
});

module.exports = router;
