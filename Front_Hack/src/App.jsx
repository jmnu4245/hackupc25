import { useState } from 'react'
import Inditex_logo_black from '/Inditex_logo_black.svg'
import './App.css'
import ListaPrendas from './lista.jsx'

function App() {
  const [scriptInjected, setScriptInjected] = useState(false);
  
  // Escuchar mensajes del content script
  useEffect(() => {
    const handleMessages = (message, sender, sendResponse) => {
      // Cuando la selección ha sido completada o cancelada, resetear el estado
      if (message.action === "selectionConfirmed" || message.action === "selectionCancelled") {
        console.log("Selección completada o cancelada, reseteando estado");
        setScriptInjected(false);
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
      // Siempre ejecutamos el script, ya que ahora maneja múltiples ejecuciones
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
      setScriptInjected(true);
      console.log("Script inyectado o reinicializado");
      
      // Capturar la pantalla y enviar la imagen al script de contenido
      chrome.tabs.captureVisibleTab(null, {}, async (imageUrl) => {
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