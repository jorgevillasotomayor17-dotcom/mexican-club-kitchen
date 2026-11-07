import { useCarrito } from '../carrito/CarritoContext.js'
import { formatoPesos } from '../formato.js'
import { useAparecer } from '../useAparecer.js'
import './TarjetaPlato.css'

function TarjetaPlato({ plato }) {
  const [ref, visible] = useAparecer()
  const { items, agregar } = useCarrito()

  // ¿Cuántas unidades de este plato hay ya en el carrito?
  const enCarrito = items.find((item) => item._id === plato._id)?.cantidad ?? 0

  return (
    <article ref={ref} className={`tarjeta-plato revelar ${visible ? 'visible' : ''}`}>
      {plato.imagen && (
        <img src={plato.imagen} alt={plato.nombre} loading="lazy" />
      )}

      <div className="tarjeta-plato-cuerpo">
        <h4>{plato.nombre}</h4>
        <p>{plato.descripcion}</p>
        <div className="tarjeta-plato-pie">
          <p className="tarjeta-plato-precio">{formatoPesos.format(plato.precio)}</p>
          <button
            type="button"
            className="boton tarjeta-plato-agregar"
            onClick={() => agregar(plato)}
            aria-label={`Agregar ${plato.nombre} al pedido`}
          >
            Agregar
          </button>
        </div>

        {enCarrito > 0 && (
          <p className="tarjeta-plato-en-carrito">En tu pedido: {enCarrito}</p>
        )}
      </div>
    </article>
  )
}

export default TarjetaPlato
