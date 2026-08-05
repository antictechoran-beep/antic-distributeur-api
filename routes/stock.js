const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM stock ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/search/:q', (req, res) => {
  const q = `%${req.params.q}%`;
  db.all(`SELECT * FROM stock WHERE nom LIKE ? OR code LIKE ? OR categorie LIKE ?`, 
    [q, q, q], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM stock WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { code, nom, categorie, quantite, prix_achat, prix_vente, seuil_alert, 
          fournisseur, emplacement, image_url, notes } = req.body;
  const date = new Date().toISOString().split('T')[0];
  db.run(`INSERT INTO stock (code, nom, categorie, quantite, prix_achat, prix_vente, 
          seuil_alert, date_ajout, fournisseur, emplacement, image_url, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, nom, categorie, quantite || 0, prix_achat || 0, prix_vente || 0, 
     seuil_alert || 0, date, fournisseur, emplacement, image_url, notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Produit ajouté' });
    }
  );
});

router.put('/:id', (req, res) => {
  const { nom, categorie, quantite, prix_achat, prix_vente, seuil_alert, 
          fournisseur, emplacement, image_url, notes } = req.body;
  db.run(`UPDATE stock SET nom=?, categorie=?, quantite=?, prix_achat=?, prix_vente=?, 
          seuil_alert=?, fournisseur=?, emplacement=?, image_url=?, notes=? WHERE id=?`,
    [nom, categorie, quantite, prix_achat, prix_vente, seuil_alert, 
     fournisseur, emplacement, image_url, notes, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Produit modifié' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM stock WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produit supprimé' });
  });
});

module.exports = router;
