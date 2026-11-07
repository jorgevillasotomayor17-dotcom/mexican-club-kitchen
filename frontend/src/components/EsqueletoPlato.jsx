import './EsqueletoPlato.css'

// Tarjeta "fantasma" con la misma forma de un plato, mientras llega el menú del servidor.
// aria-hidden: es solo visual; el aviso para lectores de pantalla lo pone el menú
function EsqueletoPlato() {
  return (
    <div className="esqueleto" aria-hidden="true">
      <div className="esqueleto-foto" />
      <div className="esqueleto-cuerpo">
        <div className="esqueleto-linea esqueleto-titulo" />
        <div className="esqueleto-linea" />
        <div className="esqueleto-linea esqueleto-corta" />
        <div className="esqueleto-pie">
          <div className="esqueleto-linea esqueleto-precio" />
          <div className="esqueleto-boton" />
        </div>
      </div>
    </div>
  )
}

export default EsqueletoPlato
