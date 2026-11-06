import { useState } from 'react'
import Login from './Login.jsx'
import { cerrarSesion, leerSesion } from './sesion.js'

function PanelAdmin() {
  const [sesion, setSesion] = useState(leerSesion)

  function salir() {
    cerrarSesion()
    setSesion(null)
  }

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
        <p>Aquí podrás manejar los platos, los pedidos y los mensajes de contacto.</p>
      </main>
    </>
  )
}

export default PanelAdmin
