import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  expect(await screen.findByText('Pokémon Card Library')).toBeInTheDocument();
  expect(await screen.findByText('Pikachu')).toBeInTheDocument();
});

test('renders error on fetch failure', async () => {
  fetch.mockRejectedValue(new Error('Network error'));

  render(<App />);
  await screen.findByText(/Error/i);
});

// camera-related tests

describe('camera scanning', () => {
  beforeEach(() => {
    // reset DOM permissions and devices
    delete navigator.mediaDevices;
    delete navigator.permissions;
  });

  test('shows error if camera API is unsupported', async () => {
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ library: [] }) });
    render(<App />);
    // wait for loading to finish and scan button to appear
    expect(await screen.findByText('Scan Card')).toBeInTheDocument();

    // click scan button
    await userEvent.click(await screen.findByText('Scan Card'));

    await screen.findByText(/Camera API not supported/i);
  });

  test('shows error when permission denied via permissions API', async () => {
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ library: [] }) });
    navigator.mediaDevices = { getUserMedia: jest.fn() };
    navigator.permissions = {
      query: jest.fn().mockResolvedValue({ state: 'denied' })
    };

    render(<App />);
    await screen.findByText('Scan Card');
    await userEvent.click(screen.getByText('Scan Card'));

    await screen.findByText(/Camera permission denied/i);
  });

  test('shows error when getUserMedia throws', async () => {
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ library: [] }) });
    navigator.mediaDevices = {
      getUserMedia: jest.fn().mockRejectedValue(new Error('Some error'))
    };

    render(<App />);
    await screen.findByText('Scan Card');
    await userEvent.click(screen.getByText('Scan Card'));

    await screen.findByText(/Some error/i);
  });
});
