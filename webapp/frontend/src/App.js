import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/library')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch library');
        }
        return response.json();
      })
      .then(data => {
        setLibrary(data.library || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="App">Loading...</div>;
  if (error) return <div className="App">Error: {error}</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokémon Card Library</h1>
        {library.length === 0 ? (
          <p>No cards in your library yet.</p>
        ) : (
          <div className="library">
            {library.map(card => (
              <div key={card.id} className="card-item">
                <h3>{card.name}</h3>
                <p>Set: {card.set_name}</p>
                <p>Rarity: {card.rarity}</p>
                <p>Type: {card.type}</p>
                <p>HP: {card.hp}</p>
                <p>Condition: {card.condition}</p>
                <p>Purchase Price: ${card.purchase_price}</p>
                {card.image_url && <img src={card.image_url} alt={card.name} style={{width: '100px'}} />}
              </div>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
