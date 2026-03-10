const sqlite3 = require('sqlite3').verbose();

// Open database
const db = new sqlite3.Database('./cards.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create tables
db.serialize(() => {
  // Users table (for future multi-user support)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Cards table (general card info)
  db.run(`CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    set_name TEXT,
    rarity TEXT,
    type TEXT,
    hp INTEGER,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // User library table (junction for user's collection)
  db.run(`CREATE TABLE IF NOT EXISTS user_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,  -- Default to user 1 for single user
    card_id INTEGER,
    condition TEXT,  -- e.g., Mint, Near Mint, etc.
    purchase_price REAL,
    purchase_date DATE,
    notes TEXT,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (card_id) REFERENCES cards (id)
  )`);

  console.log('Database schema initialized.');
});

module.exports = db;