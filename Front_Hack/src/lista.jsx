import { useEffect, useState } from 'react';

function ListaPrendas() {
  const [prendas, setPrendas] = useState([]);

  useEffect(() => {
    fetch('/resultados.json') // Aquí está el cambio
      .then(response => response.json())
      .then(data => {
        const formateadas = data.map(prenda => ({
          id: prenda.id,
          nombre: prenda.name,
          precio: prenda.price.value.current,
          link: prenda.link,
          marca: prenda.brand,
        }));
        setPrendas(formateadas);
      })
      .catch(error => console.error('Error al cargar prendas:', error));
  }, []);

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
