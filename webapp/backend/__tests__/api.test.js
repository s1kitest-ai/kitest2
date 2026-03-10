const request = require('supertest');
const express = require('express');
const db = require('../db');

// Mock the db module
jest.mock('../db', () => ({
  all: jest.fn(),
  run: jest.fn(),
  get: jest.fn(),
}));

const app = express();
app.use(express.json());

// Import routes (simplified for testing)
app.get('/api/cards', (req, res) => {
  db.all('SELECT * FROM cards', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ cards: rows });
  });
});

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
      return res.status(500).json({ error: err.message });
    }
    res.json({ library: rows });
  });
});

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/cards should return cards', async () => {
    const mockCards = [{ id: 1, name: 'Pikachu' }];
    db.all.mockImplementation((query, params, callback) => {
      callback(null, mockCards);
    });

    const response = await request(app).get('/api/cards');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ cards: mockCards });
    expect(db.all).toHaveBeenCalledWith('SELECT * FROM cards', [], expect.any(Function));
  });

  test('GET /api/library should return library', async () => {
    const mockLibrary = [{ id: 1, name: 'Pikachu', condition: 'Mint' }];
    db.all.mockImplementation((query, params, callback) => {
      callback(null, mockLibrary);
    });

    const response = await request(app).get('/api/library');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ library: mockLibrary });
  });

  test('GET /api/cards should handle errors', async () => {
    db.all.mockImplementation((query, params, callback) => {
      callback(new Error('DB Error'), null);
    });

    const response = await request(app).get('/api/cards');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'DB Error' });
  });
});