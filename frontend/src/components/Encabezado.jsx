import './Encabezado.css'

function Encabezado() {
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
    </header>
  )
}

export default Encabezado
