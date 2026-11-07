import './Portada.css'

// Foto real de uno de los platos del menú (la misma que tiene en la base de datos)
const FOTO_PLATO =
  'https://images.unsplash.com/photo-1687881063470-a78e6ea2590e?w=800&q=75&auto=format&fit=crop'

function Portada() {
  return (
    <section id="inicio" className="portada">
      {/* Luces que flotan detrás: son solo decoración, por eso aria-hidden */}
      <div className="portada-luces" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="portada-contenido">
        <p className="portada-etiqueta">Barranquilla · Comida a domicilio</p>
        <h1>Mexican Club Kitchen</h1>
        <p className="portada-texto">
          Tacos, burritos y quesadillas con sabor mexicano, directo a tu puerta.
        </p>
        <div className="portada-acciones">
          <a href="#menu" className="boton">
            Ver el menú
          </a>
          <a href="#nosotros" className="boton-vidrio">
            Conócenos
          </a>
        </div>
      </div>

      <figure className="portada-plato">
        <div className="portada-plato-marco">
          <img
            src={FOTO_PLATO}
            alt="Plato con tres tacos al pastor con cebolla morada y cilantro"
            width="800"
            height="600"
            fetchPriority="high"
          />
          <figcaption>Tacos al pastor</figcaption>
        </div>
      </figure>
    </section>
  )
}

export default Portada
