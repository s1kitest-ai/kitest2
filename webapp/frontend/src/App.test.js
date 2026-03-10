import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch
global.fetch = jest.fn();

test('renders loading initially', () => {
  fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
  render(<App />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

test('renders library when data is loaded', async () => {
  const mockData = {
    library: [
      { id: 1, name: 'Pikachu', set_name: 'Base Set', rarity: 'Common', type: 'Electric', hp: 40, condition: 'Mint', purchase_price: 10.00 }
    ]
  };
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData)
  });

  render(<App />);
  await waitFor(() => expect(screen.getByText('Pokémon Card Library')).toBeInTheDocument());
  expect(screen.getByText('Pikachu')).toBeInTheDocument();
});

test('renders error on fetch failure', async () => {
  fetch.mockRejectedValue(new Error('Network error'));

  render(<App />);
  await waitFor(() => expect(screen.getByText(/Error/i)).toBeInTheDocument());
});
