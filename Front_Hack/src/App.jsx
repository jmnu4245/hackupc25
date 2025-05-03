import { useState } from 'react'
import Inditex_logo_black from '/Inditex_logo_black.svg'
import './App.css'
import ListaPrendas from './lista.jsx'

function App() {

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

      <div>
        <h1>Catálogo de ropa</h1>
        <ListaPrendas />
      </div>

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
