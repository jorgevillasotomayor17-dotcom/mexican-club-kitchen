import { useAparecer } from '../useAparecer.js'
import './Nosotros.css'

const puntosFuertes = [
  {
    titulo: 'Recetas tradicionales',
    texto: 'Preparamos cada plato con recetas inspiradas en la cocina mexicana de siempre.',
  },
  {
    titulo: 'Ingredientes frescos',
    texto: 'Tortillas, carnes y salsas preparadas el mismo día.',
  },
  {
    titulo: 'Entrega a domicilio',
    texto: 'Llevamos tu pedido caliente a cualquier barrio de Barranquilla.',
  },
]

function Nosotros() {
  const [ref, visible] = useAparecer()

  return (
    <section id="nosotros" className="nosotros">
      <h2>Quiénes somos</h2>
      <p className="nosotros-intro">
        Mexican Club Kitchen nació para traer el sabor de México a Barranquilla.
        Cocinamos con cariño y te lo llevamos hasta la puerta de tu casa.
      </p>

      <ul ref={ref} className={`nosotros-lista revelar-grupo ${visible ? 'visible' : ''}`}>
        {puntosFuertes.map((punto) => (
          <li key={punto.titulo} className="nosotros-tarjeta">
            <h3>{punto.titulo}</h3>
            <p>{punto.texto}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Nosotros
