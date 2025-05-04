import { useEffect, useState } from 'react';
import './globals.css';

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
  const [prendasData, setPrendasData] = useState([]);
  const [prendasConImagen, setPrendasConImagen] = useState([]);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [visibleItems, setVisibleItems] = useState(2);

  useEffect(() => {
    setLoadingInicial(true);
    setVisibleItems(2);
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
      if (!Array.isArray(prendasData)) return;

      const nuevasPrendasConImagen = [...prendasConImagen];
      if (prendasConImagen.length >= visibleItems) return;

      const prendasACargar = prendasData
        .slice(prendasConImagen.length, visibleItems)
        .filter(prenda => !prendasConImagen.some(p => p.id === prenda.id));

      for (const prenda of prendasACargar) {
        const imagen = await getImageFromServer(prenda.link);
        nuevasPrendasConImagen.push({ ...prenda, imagen });
      }
      setPrendasConImagen(nuevasPrendasConImagen);
    };

    cargarImagenesVisibles();
  }, [visibleItems, prendasData]);

  const handleVerMas = () => {
    setVisibleItems(prev => Math.min(prev + 2, prendasData.length));
  };

  const handleVerMenos = () => {
    setVisibleItems(prev => Math.max(prev - 2, 2));
  };

  return (
    <div>
      <h2>Prendas disponibles</h2>
      {loadingInicial ? (
        <div className="loader">Cargando lista de prendas...</div>
      ) : (
        <>
          {Array.isArray(prendasData) && prendasData.slice(0, visibleItems).map(prenda => {
            const prendaConImagen = prendasConImagen.find(p => p.id === prenda.id);
            return (
              <a
                key={prenda.id}
                href={prenda.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    border: '1px solid #ccc',
                    padding: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={prendaConImagen?.imagen || ''}
                    alt={prenda.nombre}
                    style={{
                      width: '100px',
                      height: 'auto',
                      marginRight: '1rem',
                      backgroundColor: '#eee'
                    }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <h3>{prenda.nombre}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <div><strong>Marca:</strong> {prenda.marca}</div>
                      <div><strong>Precio:</strong> €{prenda.precio.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
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