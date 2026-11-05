import Encabezado from './components/Encabezado.jsx'
import Nosotros from './components/Nosotros.jsx'
import PiePagina from './components/PiePagina.jsx'
import Portada from './components/Portada.jsx'

function App() {
  return (
    <>
      <Encabezado />

      <main>
        <Portada />
        <Nosotros />
      </main>

      <PiePagina />
    </>
  )
}

export default App
