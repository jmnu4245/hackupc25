import { useState, useEffect } from 'react';
import Inditex_logo_black from '/Inditex_logo_black.svg';
import './App.css';
import ListaPrendas from './lista.jsx';

function App() {
  const [scriptInjected, setScriptInjected] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // Función para guardar datos en chrome.storage.local
  const saveData = (key, value) => {
    chrome.storage.local.set({ [key]: value }, function() {
      console.log('Datos guardados:', key, value);
    });
  };

  // Función para recuperar datos de chrome.storage.local
  const getData = (key, callback) => {
    chrome.storage.local.get([key], function(result) {
      callback(result[key]);
    });
  };

  // Escuchar mensajes del content script
useEffect(() => {
  const handleMessages = (message, sender, sendResponse) => {
    console.log("Mensaje recibido en App.jsx:", message);
    if (message.action === "selectionConfirmed" || message.action === "selectionCancelled") {
      console.log("Selección completada o cancelada, reseteando estado");
      setScriptInjected(false);
    }
    if (message.action === "imgReady") {
      console.log("URL de la imagen actualizada:", message.url);
      setImageUrl(message.url);
      saveData('imageUrl', message.url);
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


  // Recuperar datos al montar el componente
  useEffect(() => {
    getData('imageUrl', (url) => {
      if (url) {
        setImageUrl(url);
      }
    });
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
      <div>
        <button onClick={handleSelect}>
          Seleccionar área de pantalla
        </button>
        {imageUrl && (
          <div>
            <h2>Última Imagen subida:</h2>
            <img src={imageUrl} alt="Imagen subida" />
            <ListaPrendas  imageUrl={imageUrl} />
        </div>)
    }
      </div>
    </>
  );
}

export default App;
