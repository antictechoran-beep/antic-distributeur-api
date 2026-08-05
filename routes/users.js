const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT id, nom_utilisateur, role, email, telephone, actif, date_creation, derniere_connexion FROM users ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nom_utilisateur, mot_de_passe, role, email, telephone } = req.body;
  const hash = bcrypt.hashSync(mot_de_passe, 10);
  const date = new Date().toISOString().split('T')[0];
  db.run(`INSERT INTO users (nom_utilisateur, mot_de_passe, role, email, telephone, actif, date_creation) 
          VALUES (?, ?, ?, ?, ?, 'Oui', ?)`,
    [nom_utilisateur, hash, role, email, telephone, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Utilisateur ajouté' });
    }
  );
});

router.put('/:id', (req, res) => {
  const { nom_utilisateur, role, email, telephone, actif } = req.body;
  db.run(`UPDATE users SET nom_utilisateur=?, role=?, email=?, telephone=?, actif=? WHERE id=?`,
    [nom_utilisateur, role, email, telephone, actif, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Utilisateur modifié' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Utilisateur supprimé' });
  });
});

module.exports = router;
