import './PiePagina.css'

function PiePagina() {
  const anio = new Date().getFullYear()

  return (
    <footer className="pie-pagina">
      <p className="pie-pagina-marca">Mexican Club Kitchen</p>

      <nav aria-label="Pie de página">
        <ul className="pie-pagina-enlaces">
          <li><a href="#menu">Menú</a></li>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>

      <p>© {anio} Mexican Club Kitchen · Barranquilla, Colombia</p>
      <a href="admin.html" className="pie-pagina-admin">
        Acceso administrador
      </a>
    </footer>
  )
}

export default PiePagina
