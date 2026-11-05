import './Portada.css'

function Portada() {
  return (
    <section id="inicio" className="portada">
      <p className="portada-etiqueta">Barranquilla · Comida a domicilio</p>
      <h1>Mexican Club Kitchen</h1>
      <p className="portada-texto">
        Tacos, burritos y quesadillas con sabor mexicano, directo a tu puerta.
      </p>
      <a href="#menu" className="boton">
        Ver el menú
      </a>
    </section>
  )
}

export default Portada
