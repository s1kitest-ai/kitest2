const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database
const db = new sqlite3.Database('./cards.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      set_name TEXT,
      rarity TEXT,
      image_url TEXT,
      scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Pokémon Card Scanner Backend');
});

// Get all cards
app.get('/api/cards', (req, res) => {
  db.all('SELECT * FROM cards', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ cards: rows });
  });
});

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});