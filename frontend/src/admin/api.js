import { API_URL } from '../config.js'
import { leerSesion } from './sesion.js'

function crearErrorDeSesion() {
  const error = new Error('Tu sesión terminó. Inicia sesión de nuevo.')
  error.sesionVencida = true
  return error
}

// Hace una petición al backend con el token del admin y devuelve los datos de la respuesta
export async function pedirConSesion(ruta, { method = 'GET', body } = {}) {
  const sesion = leerSesion()

  if (!sesion) {
    throw crearErrorDeSesion()
  }

  const encabezados = { Authorization: `Bearer ${sesion.token}` }
  if (body !== undefined) {
    encabezados['Content-Type'] = 'application/json'
  }

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers: encabezados,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.')
  }

  if (respuesta.status === 401) {
    throw crearErrorDeSesion()
  }

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'Ocurrió un error. Intenta de nuevo.')
  }

  return datos
}
