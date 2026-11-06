import Contacto from './components/Contacto.jsx'
import Encabezado from './components/Encabezado.jsx'
import Menu from './components/Menu.jsx'
import Nosotros from './components/Nosotros.jsx'
import PiePagina from './components/PiePagina.jsx'
import Portada from './components/Portada.jsx'

function App() {
  return (
    <>
      <Encabezado />

      <main>
        <Portada />
        <Menu />
        <Nosotros />
        <Contacto />
      </main>

      <PiePagina />
    </>
  )
}

export default App
