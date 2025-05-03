import { useState } from 'react'
import Inditex_logo_black from '/inditex_logo_black.svg'
import './App.css'

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
      <div>
        <a href="https://www.inditex.com" target="_blank">
          <img src={Inditex_logo_black} className="logo" alt="Inditex logo" />
        </a>

      </div>
      <h1>Encarni-chaaaan</h1>
      <div className="card">
        <button onClick={handleSelect}>
          Seleccionar área de pantalla
        </button>
      </div>
    </>
  );
}

export default App;
