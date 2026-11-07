import { useCarrito } from '../carrito/CarritoContext.js'
import './Encabezado.css'

function Encabezado() {
  const { unidades, abrir } = useCarrito()

  return (
    <header className="encabezado">
      <a href="#inicio" className="logo">
        Mexican Club Kitchen
      </a>

      <nav aria-label="Principal">
        <ul className="menu-principal">
          <li><a href="#menu">Menú</a></li>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>

      <button
        type="button"
        className="encabezado-carrito"
        onClick={abrir}
        aria-label={`Ver tu pedido: ${unidades} ${unidades === 1 ? 'plato' : 'platos'}`}
      >
        <span aria-hidden="true">🛒</span> Pedido
        {unidades > 0 && (
          // key cambia con el número: React vuelve a crear la burbuja y su animación se repite
          <span key={unidades} className="encabezado-contador" aria-hidden="true">
            {unidades}
          </span>
        )}
      </button>
    </header>
  )
}

export default Encabezado
