import { useCallback, useState } from 'react'
import GestionPlatos from './GestionPlatos.jsx'
import Login from './Login.jsx'
import { cerrarSesion, leerSesion } from './sesion.js'

function PanelAdmin() {
  const [sesion, setSesion] = useState(leerSesion)

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
        <GestionPlatos onSesionVencida={salir} />
      </main>
    </>
  )
}

export default PanelAdmin
