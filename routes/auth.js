const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();
const SECRET = 'antic_distributeur_secret_key_2026';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE nom_utilisateur = ? AND actif = "Oui"', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    const valid = bcrypt.compareSync(password, user.mot_de_passe);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });
    db.run('UPDATE users SET derniere_connexion = ? WHERE id = ?', 
      [new Date().toISOString().split('T')[0], user.id]);
    const token = jwt.sign(
      { id: user.id, username: user.nom_utilisateur, role: user.role },
      SECRET, { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.nom_utilisateur, role: user.role,
              email: user.email, telephone: user.telephone }
    });
  });
});

router.post('/change-password', (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const valid = bcrypt.compareSync(oldPassword, user.mot_de_passe);
    if (!valid) return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    const hash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET mot_de_passe = ? WHERE id = ?', [hash, userId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Mot de passe modifié' });
    });
  });
});

module.exports = router;
