import { formatoPesos } from '../formato.js'
import { useAparecer } from '../useAparecer.js'
import './TarjetaPlato.css'

function TarjetaPlato({ plato }) {
  const [ref, visible] = useAparecer()

  return (
    <article ref={ref} className={`tarjeta-plato revelar ${visible ? 'visible' : ''}`}>
      {plato.imagen && (
        <img src={plato.imagen} alt={plato.nombre} loading="lazy" />
      )}

      <div className="tarjeta-plato-cuerpo">
        <h4>{plato.nombre}</h4>
        <p>{plato.descripcion}</p>
        <p className="tarjeta-plato-precio">{formatoPesos.format(plato.precio)}</p>
      </div>
    </article>
  )
}

export default TarjetaPlato
