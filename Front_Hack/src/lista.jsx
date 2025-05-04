import { useEffect, useState } from 'react';
import './globals.css';

// Función para obtener la primera imagen con alt desde el servidor
async function getImageFromServer(url) {
  try {
    const response = await fetch(`http://localhost:5000/obtener_imagen?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      console.error(`Error al obtener la imagen desde el servidor: ${response.status}`);
      return '';
    }
    const data = await response.json();
    return data.src || '';
  } catch (error) {
    console.error("Error al comunicarse con la API:", error);
    return '';
  }
}

function ListaPrendas({ imageUrl }) {
  const [prendasData, setPrendasData] = useState([]); // Estado para la información básica de las prendas (sin imagen)
  const [prendasConImagen, setPrendasConImagen] = useState([]); // Estado para las prendas con la URL de la imagen cargada
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [visibleItems, setVisibleItems] = useState(5);

  useEffect(() => {
    setLoadingInicial(true);
    setVisibleItems(5);
    chrome.runtime.sendMessage({ action: "cargalistaropa", imageUrl: imageUrl });

    const handleMessages = async (message) => {
      if (message.action === "listaCargada") {
        setPrendasData(message.lista);
        setLoadingInicial(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessages);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, [imageUrl]);

  useEffect(() => {
    const cargarImagenesVisibles = async () => {
      const nuevasPrendasConImagen = [...prendasConImagen];
      const prendasACargar = prendasData
        .slice(prendasConImagen.length, visibleItems)
        .filter(prenda => !prendasConImagen.some(p => p.id === prenda.id)); // Evita cargar la misma prenda dos veces

      for (const prenda of prendasACargar) {
        const imagen = await getImageFromServer(prenda.link);
        nuevasPrendasConImagen.push({ ...prenda, imagen });
      }
      setPrendasConImagen(nuevasPrendasConImagen);
    };

    cargarImagenesVisibles();
  }, [visibleItems, prendasData]);

  const prendasParaMostrar = prendasConImagen.slice(0, visibleItems);

  const handleVerMas = () => {
    setVisibleItems(prev => Math.min(prev + 5, prendasData.length));
  };

  const handleVerMenos = () => {
    setVisibleItems(prev => Math.max(prev - 5, 5)); // Asegura que no se muestren menos de 5
  };

  return (
    <div>
      <h2>Prendas disponibles</h2>
      {loadingInicial ? (
        <div className="loader">Cargando lista de prendas...</div>
      ) : (
        <>
          {prendasParaMostrar.map(prenda => (
            <div key={prenda.id} style={{ marginBottom: '1rem' }} className='card'>
              <img src={prenda.imagen} alt={prenda.nombre} style={{ width: '100px', height: 'auto' }} />
              <h3>{prenda.nombre}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p>Precio: €{prenda.precio.toFixed(2)}</p>
                <p>Marca: {prenda.marca}</p>
              </div>
              <a href={prenda.link} target="_blank" rel="noopener noreferrer">Ver producto</a>
            </div>
          ))}
          {prendasData.length > visibleItems && (
            <button
              onClick={handleVerMas}
              className="text-blue-600 hover:underline focus:outline-none mt-2"
            >
              Ver más
            </button>
          )}
          {visibleItems > 5 && (
            <button
              onClick={handleVerMenos}
              className="text-blue-600 hover:underline focus:outline-none mt-2"
            >
              Ver menos
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default ListaPrendas;