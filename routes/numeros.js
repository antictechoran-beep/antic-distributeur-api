const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM numeros', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/generate', (req, res) => {
  const { table_name } = req.body;
  db.get('SELECT * FROM numeros WHERE table_name = ?', [table_name], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Table non trouvée' });
    const nouveau = row.dernier_numero + 1;
    db.run('UPDATE numeros SET dernier_numero = ? WHERE table_name = ?', 
      [nouveau, table_name], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        const match = row.format.match(/\{(0+)\}/);
        let code;
        if (match) {
          const zeros = match[1].length;
          const numStr = String(nouveau).padStart(zeros, '0');
          code = row.prefix + row.format.replace(match[0], numStr);
        } else {
          code = row.prefix + String(nouveau).padStart(3, '0');
        }
        res.json({ code, dernier_numero: nouveau });
      });
  });
});

module.exports = router;
