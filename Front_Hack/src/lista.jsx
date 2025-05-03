import { useEffect, useState } from 'react';
import './globals.css';

// Función para obtener la quinta imagen de la página
function getFifthImage(url) {
  return fetch(url)
    .then(response => response.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      // Obtener todas las imágenes
      const images = doc.querySelectorAll('img');
      // Si hay al menos 5 imágenes, selecciona la quinta
      return images.length >= 5 ? images[1].src : ''; // El índice 4 corresponde a la quinta imagen
    })
    .catch(() => ''); // Si hay un error, devuelve una cadena vacía
}

function ListaPrendas({ imageUrl }) {
  const [prendas, setPrendas] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    setLoading(true); // Iniciar carga
    chrome.runtime.sendMessage({ action: "cargalistaropa", imageUrl: imageUrl });

    const handleMessages = async (message) => {
      if (message.action === "listaCargada") {
        const updatedPrendas = await Promise.all(
          message.lista.map(async (prenda) => {
            const imagen = await getFifthImage(prenda.link); // Obtener la quinta imagen
            return { ...prenda, imagen }; // Añadir la imagen a la prenda
          })
        );
        setPrendas(updatedPrendas);
        setLoading(false); // Finaliza carga al recibir datos
      }
    };

    chrome.runtime.onMessage.addListener(handleMessages);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, [imageUrl]);

  return (
    <div>
      <h2>Prendas disponibles</h2>
      {loading ? (
        <div className="loader">Cargando...</div>
      ) : (
        prendas.map(prenda => (
          <div key={prenda.id} style={{ marginBottom: '1rem' }} className='card'>
            <img src={prenda.imagen} alt={prenda.nombre} style={{ width: '100px', height: 'auto' }} />
            <h3>{prenda.nombre}</h3>
            <p>Precio: €{prenda.precio.toFixed(2)}</p>
            <p>Marca: {prenda.marca}</p>
            <a href={prenda.link} target="_blank" rel="noopener noreferrer">Ver producto</a>
          </div>
        ))
      )}
    </div>
  );
}

export default ListaPrendas;
