import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = () => {
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
  };

  const startScanning = async () => {
    setScanning(true);
    setError(null); // Clear any previous error

    // reset any previous video stream
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }

    try {
      // unify getUserMedia across browsers (including legacy WebKit on iOS)
      const hasNative = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
      const legacyGetUserMedia =
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      if (!hasNative && !legacyGetUserMedia) {
        throw new Error('Camera API not supported by this browser.');
      }

      // Check camera permission first if possible
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' });
        if (permission.state === 'denied') {
          throw new Error('Camera permission denied. Please enable camera permissions in your browser settings.');
        }
      }

      // obtain stream using whichever API is available
      let stream;
      if (hasNative) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } else {
        // legacy callback-style API
        stream = await new Promise((resolve, reject) => {
          legacyGetUserMedia.call(
            navigator,
            { video: true },
            resolve,
            reject
          );
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const msg = err.message || 'Unknown camera error';
      setError(msg);
      setScanning(false);
      // make sure no lingering stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageDataUrl);
      // Stop camera
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setScanning(false);
    }
  };

  const addCard = (cardData) => {
    fetch('http://localhost:3001/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData)
    })
    .then(response => response.json())
    .then(() => {
      setCapturedImage(null);
      fetchLibrary();
    })
    .catch(err => setError(err.message));
  };

  const clearError = () => {
    setError(null);
  };

  if (loading) return <div className="App">Loading...</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokémon Card Library</h1>
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={clearError}>Dismiss</button>
          </div>
        )}
        <button onClick={startScanning} disabled={scanning}>Scan Card</button>
        {scanning && (
          <div>
            <video ref={videoRef} autoPlay style={{width: '300px'}} />
            <button onClick={captureImage}>Capture</button>
          </div>
        )}
        <canvas ref={canvasRef} style={{display: 'none'}} />
        {capturedImage && (
          <div>
            <h3>Captured Image</h3>
            <img src={capturedImage} alt="Captured card" style={{width: '200px'}} />
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addCard({
                name: formData.get('name'),
                set_name: formData.get('set_name'),
                rarity: formData.get('rarity'),
                type: formData.get('type'),
                hp: parseInt(formData.get('hp')),
                image_url: capturedImage, // Use the captured image
                condition: formData.get('condition'),
                purchase_price: parseFloat(formData.get('purchase_price')),
                purchase_date: formData.get('purchase_date'),
                notes: formData.get('notes')
              });
            }}>
              <input name="name" placeholder="Card Name" required />
              <input name="set_name" placeholder="Set Name" required />
              <input name="rarity" placeholder="Rarity" />
              <input name="type" placeholder="Type" />
              <input name="hp" type="number" placeholder="HP" />
              <input name="condition" placeholder="Condition" />
              <input name="purchase_price" type="number" step="0.01" placeholder="Purchase Price" />
              <input name="purchase_date" type="date" />
              <textarea name="notes" placeholder="Notes" />
              <button type="submit">Add to Library</button>
            </form>
          </div>
        )}
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
