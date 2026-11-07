import { useEffect, useRef, useState } from 'react'
import { useCarrito } from '../carrito/CarritoContext.js'
import { formatoPesos } from '../formato.js'
import { useAparecer } from '../useAparecer.js'
import './TarjetaPlato.css'

// Cuánto tiempo se ve el "✓ Agregado" después de tocar el botón
const DURACION_CONFIRMACION = 1200
// Pausa entre una tarjeta y la siguiente al aparecer en cascada
const PAUSA_CASCADA = 90

function TarjetaPlato({ plato, posicion = 0 }) {
  const [ref, visible] = useAparecer()
  const { items, agregar } = useCarrito()
  const [recienAgregado, setRecienAgregado] = useState(false)
  const temporizador = useRef(null)

  // Si la tarjeta desaparece, se cancela el temporizador pendiente
  useEffect(() => () => clearTimeout(temporizador.current), [])

  // ¿Cuántas unidades de este plato hay ya en el carrito?
  const enCarrito = items.find((item) => item._id === plato._id)?.cantidad ?? 0

  function alAgregar() {
    agregar(plato)
    setRecienAgregado(true)
    // Si tocan varias veces seguidas, el "✓" dura desde el último toque
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setRecienAgregado(false), DURACION_CONFIRMACION)
  }

  return (
    // El contenedor se encarga de aparecer; la tarjeta, de reaccionar al mouse.
    // Separados, la pausa de la cascada no retrasa el efecto al pasar el mouse
    <div
      ref={ref}
      className={`tarjeta-plato-aparecer revelar ${visible ? 'visible' : ''}`}
      style={{ '--retraso': `${Math.min(posicion, 4) * PAUSA_CASCADA}ms` }}
    >
      <article className="tarjeta-plato">
        {plato.imagen && (
          <div className="tarjeta-plato-foto">
            <img src={plato.imagen} alt={plato.nombre} loading="lazy" />
          </div>
        )}

        <div className="tarjeta-plato-cuerpo">
          <h4>{plato.nombre}</h4>
          <p className="tarjeta-plato-descripcion">{plato.descripcion}</p>
          <div className="tarjeta-plato-pie">
            <p className="tarjeta-plato-precio">{formatoPesos.format(plato.precio)}</p>
            <button
              type="button"
              className={`boton tarjeta-plato-agregar ${recienAgregado ? 'agregado' : ''}`}
              onClick={alAgregar}
              aria-label={`Agregar ${plato.nombre} al pedido`}
            >
              {/* key: al cambiar el texto, React lo vuelve a crear y repite su animación */}
              <span key={recienAgregado ? 'si' : 'no'}>
                {recienAgregado ? '✓ Agregado' : 'Agregar'}
              </span>
            </button>
          </div>

          {enCarrito > 0 && (
            <p className="tarjeta-plato-en-carrito">En tu pedido: {enCarrito}</p>
          )}
        </div>
      </article>
    </div>
  )
}

export default TarjetaPlato
