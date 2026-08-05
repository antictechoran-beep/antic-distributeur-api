const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/:code_produit', (req, res) => {
  db.all('SELECT * FROM barcode WHERE code_produit = ?', [req.params.code_produit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/scan/:code_barre', (req, res) => {
  db.get(`SELECT b.*, s.nom, s.quantite, s.prix_vente FROM barcode b 
          JOIN stock s ON b.code_produit = s.code 
          WHERE b.code_barre = ?`, [req.params.code_barre], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { code_produit, code_barre, type } = req.body;
  const date = new Date().toISOString().split('T')[0];
  db.run('INSERT INTO barcode (code_produit, code_barre, type, date_ajout) VALUES (?, ?, ?, ?)',
    [code_produit, code_barre, type || 'EAN-13', date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Barcode ajouté' });
    }
  );
});

module.exports = router;
