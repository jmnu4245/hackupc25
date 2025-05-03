import { useState, useEffect } from 'react';
import Inditex_logo_black from '/Inditex_logo_black.svg';
import './App.css';
import ListaPrendas from './lista.jsx';

function App() {
  const [scriptInjected, setScriptInjected] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // Escuchar mensajes del content script
  useEffect(() => {
    const handleMessages = (message, sender, sendResponse) => {
      // Cuando la selección ha sido completada o cancelada, resetear el estado
      if (message.action === "selectionConfirmed" || message.action === "selectionCancelled") {
        console.log("Selección completada o cancelada, reseteando estado");
        setScriptInjected(false);
      }
      // Cuando la URL de la imagen está lista, actualizar el estado
      if (message.action === "imgurUrlReady") {
        setImageUrl(message.url);
      }
      return false;
    };

    // Agregar el listener de mensajes
    chrome.runtime.onMessage.addListener(handleMessages);

    // Limpiar el listener cuando el componente se desmonta
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);

  const handleSelect = async () => {
    console.log("Ejecutando handleSelect...");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      // Capturar la pantalla
      chrome.tabs.captureVisibleTab(null, {}, async (imageUrl) => {
        // Inyectar el script de contenido y enviar la imagen capturada
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
        setScriptInjected(true);
        console.log("Script inyectado o reinicializado");

        // Enviar la imagen capturada al script de contenido
        chrome.tabs.sendMessage(tab.id, { action: "enableSelection", imageUrl });
      });
    } else {
      console.error("No se encontró el tab");
    }
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
        {imageUrl && (
          <div>
            <h2>Imagen subida:</h2>
            <img src={imageUrl} alt="Imagen subida" />
            <h1>Catálogo de ropa</h1>
            <ListaPrendas />
          </div>)
    }
      </div>
    </>
  );
}

export default App;
