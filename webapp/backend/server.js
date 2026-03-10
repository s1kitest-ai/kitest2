const express = require('express');
const db = require('./db');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Pokémon Card Scanner Backend');
});

// Get all cards in library
app.get('/api/library', (req, res) => {
  const query = `
    SELECT ul.id, c.name, c.set_name, c.rarity, c.type, c.hp, c.image_url,
           ul.condition, ul.purchase_price, ul.purchase_date, ul.notes, ul.scanned_at
    FROM user_library ul
    JOIN cards c ON ul.card_id = c.id
    WHERE ul.user_id = 1
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ library: rows });
  });
});

// Add a card to library
app.post('/api/library', (req, res) => {
  const { name, set_name, rarity, type, hp, image_url, condition, purchase_price, purchase_date, notes } = req.body;
  // First, insert or find card
  db.run('INSERT OR IGNORE INTO cards (name, set_name, rarity, type, hp, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, set_name, rarity, type, hp, image_url], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const cardId = this.lastID || this.changes;  // For INSERT OR IGNORE, might need to get existing id
      // Actually, better to select or insert
      db.get('SELECT id FROM cards WHERE name = ? AND set_name = ?', [name, set_name], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const cardId = row.id;
        db.run('INSERT INTO user_library (card_id, condition, purchase_price, purchase_date, notes) VALUES (?, ?, ?, ?, ?)',
          [cardId, condition, purchase_price, purchase_date, notes], function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ id: this.lastID });
          });
      });
    });
});

// Get all cards (general)
=======
// Get all cards
>>>>>>> main
app.get('/api/cards', (req, res) => {
  db.all('SELECT * FROM cards', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ cards: rows });
  });
});

<<<<<<< HEAD
=======
// Add a card
app.post('/api/cards', (req, res) => {
  const { name, set_name, rarity, image_url } = req.body;
  db.run('INSERT INTO cards (name, set_name, rarity, image_url) VALUES (?, ?, ?, ?)',
    [name, set_name, rarity, image_url], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    });
});

>>>>>>> main
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});