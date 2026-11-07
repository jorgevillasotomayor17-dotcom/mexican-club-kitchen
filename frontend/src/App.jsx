import ProveedorCarrito from './carrito/ProveedorCarrito.jsx'
import Brisi from './components/Brisi.jsx'
import Contacto from './components/Contacto.jsx'
import Encabezado from './components/Encabezado.jsx'
import Menu from './components/Menu.jsx'
import Nosotros from './components/Nosotros.jsx'
import PiePagina from './components/PiePagina.jsx'
import Portada from './components/Portada.jsx'

function App() {
  return (
    // Todo lo que está dentro del proveedor puede usar el carrito
    <ProveedorCarrito>
      <Encabezado />

      <main>
        <Portada />
        <Menu />
        <Nosotros />
        <Contacto />
      </main>

      <PiePagina />
      <Brisi />
    </ProveedorCarrito>
  )
}

export default App
