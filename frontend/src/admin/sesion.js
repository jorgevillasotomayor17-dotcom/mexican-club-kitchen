const CLAVE = 'mck-sesion-admin'

export function guardarSesion({ token, admin }) {
  localStorage.setItem(CLAVE, JSON.stringify({ token, admin }))
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE)
}

// Lee la fecha de vencimiento que viene dentro del token (no verifica la firma: eso lo hace el backend)
function tokenVencido(token) {
  try {
    const parteCentral = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const datos = JSON.parse(atob(parteCentral))
    return Date.now() >= datos.exp * 1000
  } catch {
    return true
  }
}

export function leerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE))

    if (!sesion?.token || tokenVencido(sesion.token)) {
      cerrarSesion()
      return null
    }

    return sesion
  } catch {
    cerrarSesion()
    return null
  }
}
