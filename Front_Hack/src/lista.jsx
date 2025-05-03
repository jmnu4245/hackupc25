import { useEffect, useState } from 'react';

// Function to encode credentials for Basic Auth
function getBasicAuthHeader(clientId, clientSecret) {
  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
}

function ListaPrendas({ imageUrl }) {
  const [prendas, setPrendas] = useState([]);

  useEffect(() => {
    // Enviar mensaje al background script para cargar la lista de ropa
    chrome.runtime.sendMessage({ action: "cargalistaropa", imageUrl: imageUrl });

    // Manejar mensajes recibidos del background script
    const handleMessages = (message, sender, sendResponse) => {
      console.log("Mensaje recibido en App.jsx:", message);
      if (message.action === "listaCargada") {
        console.log("Lista recibida:", message.lista);
        setPrendas(message.lista);
      }
      return false;
    };

    // Añadir el listener para mensajes
    chrome.runtime.onMessage.addListener(handleMessages);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, [imageUrl]);

  return (
    <div>
      <h2>Prendas disponibles</h2>
      {prendas.map(prenda => (
        <div key={prenda.id} style={{ marginBottom: '1rem' }}>
          <h3>{prenda.nombre}</h3>
          <p>Precio: €{prenda.precio.toFixed(2)}</p>
          <p>Marca: {prenda.marca}</p>
          <a href={prenda.link} target="_blank" rel="noopener noreferrer">Ver producto</a>
        </div>
      ))}
    </div>
  );
}

export default ListaPrendas;
