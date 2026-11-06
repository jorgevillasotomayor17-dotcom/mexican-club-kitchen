import './PiePagina.css'

function PiePagina() {
  const anio = new Date().getFullYear()

  return (
    <footer className="pie-pagina">
      <p>© {anio} Mexican Club Kitchen · Barranquilla, Colombia</p>
      <a href="admin.html" className="pie-pagina-admin">
        Acceso administrador
      </a>
    </footer>
  )
}

export default PiePagina
