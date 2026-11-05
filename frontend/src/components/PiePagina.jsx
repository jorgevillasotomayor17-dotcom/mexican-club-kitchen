import './PiePagina.css'

function PiePagina() {
  const anio = new Date().getFullYear()

  return (
    <footer className="pie-pagina">
      <p>© {anio} Mexican Club Kitchen · Barranquilla, Colombia</p>
    </footer>
  )
}

export default PiePagina
