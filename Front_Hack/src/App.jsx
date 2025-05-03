import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const handleSelect = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']  // asegúrate de que está en public o build
    });
  };

  return (
    <>
      <h1>Captura</h1>
      <div className="card">
        <button onClick={handleSelect}>
          Seleccionar área de pantalla
        </button>
      </div>
    </>
  );
}

export default App;
