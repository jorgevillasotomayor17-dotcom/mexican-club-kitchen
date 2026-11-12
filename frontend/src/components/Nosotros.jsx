import { useAparecer } from '../useAparecer.js'
import './Nosotros.css'

const puntosFuertes = [
  {
    titulo: 'Recetas tradicionales',
    texto: 'Cada plato sale de recetas de la cocina mexicana de siempre, con su toque picante.',
  },
  {
    titulo: 'Ingredientes frescos',
    texto: 'Tortillas, carnes y salsas preparadas el mismo día. Nada recalentado.',
  },
  {
    titulo: 'Directo a tu puerta',
    texto: 'Sin mesas y sin filas: tu pedido llega caliente a cualquier barrio de Barranquilla.',
  },
]

function Nosotros() {
  const [ref, visible] = useAparecer()

  return (
    <section id="nosotros" className="nosotros">
      <h2>Quiénes somos</h2>
      <p className="nosotros-intro">
        Mexican Club Kitchen nació para traer a Barranquilla comida mexicana de verdad.
        Cocinamos para compartir en familia, con amigos o para darte tú solo un antojo real de
        México.
      </p>

      <ul ref={ref} className={`nosotros-lista revelar-grupo ${visible ? 'visible' : ''}`}>
        {puntosFuertes.map((punto) => (
          // El <li> se encarga de aparecer en cascada y el <div>, del efecto al pasar el mouse
          <li key={punto.titulo}>
            <div className="nosotros-tarjeta">
              <h3>{punto.titulo}</h3>
              <p>{punto.texto}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="nosotros-lema">Únete al Club. Vive el sabor.</p>
    </section>
  )
}

export default Nosotros
