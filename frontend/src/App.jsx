import Encabezado from './components/Encabezado.jsx'
import Nosotros from './components/Nosotros.jsx'
import Portada from './components/Portada.jsx'

function App() {
  return (
    <>
      <Encabezado />

      <main>
        <Portada />
        <Nosotros />
      </main>
    </>
  )
}

export default App
