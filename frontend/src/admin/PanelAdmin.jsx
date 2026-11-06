import { useCallback, useState } from 'react'
import GestionMensajes from './GestionMensajes.jsx'
import GestionPedidos from './GestionPedidos.jsx'
import GestionPlatos from './GestionPlatos.jsx'
import Login from './Login.jsx'
import { cerrarSesion, leerSesion } from './sesion.js'

const SECCIONES = [
  { id: 'platos', nombre: 'Platos' },
  { id: 'pedidos', nombre: 'Pedidos' },
  { id: 'mensajes', nombre: 'Mensajes' },
]

function PanelAdmin() {
  const [sesion, setSesion] = useState(leerSesion)
  const [seccion, setSeccion] = useState('platos')

  // useCallback mantiene la misma función entre dibujos, para no repetir la carga de datos
  const salir = useCallback(() => {
    cerrarSesion()
    setSesion(null)
  }, [])

  if (!sesion) {
    return <Login onEntrar={setSesion} />
  }

  return (
    <>
      <header className="panel-barra">
        <a href="./" className="panel-marca">
          Mexican Club Kitchen
        </a>
        <div className="panel-usuario">
          <span>Hola, {sesion.admin.nombre}</span>
          <button type="button" className="panel-salir" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="panel">
        <h1>Panel de administración</h1>

        <nav className="panel-pestanas" aria-label="Secciones del panel">
          {SECCIONES.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className="panel-pestana"
              aria-pressed={seccion === opcion.id}
              onClick={() => setSeccion(opcion.id)}
            >
              {opcion.nombre}
            </button>
          ))}
        </nav>

        {seccion === 'platos' && <GestionPlatos onSesionVencida={salir} />}
        {seccion === 'pedidos' && <GestionPedidos onSesionVencida={salir} />}
        {seccion === 'mensajes' && <GestionMensajes onSesionVencida={salir} />}
      </main>
    </>
  )
}

export default PanelAdmin
