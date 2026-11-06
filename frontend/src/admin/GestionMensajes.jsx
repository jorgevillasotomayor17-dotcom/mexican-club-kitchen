import { useEffect, useState } from 'react'
import { formatoFecha } from '../formato.js'
import { pedirConSesion } from './api.js'

function GestionMensajes({ onSesionVencida }) {
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [idActualizando, setIdActualizando] = useState(null)

  useEffect(() => {
    let activo = true

    async function cargarMensajes() {
      try {
        const datos = await pedirConSesion('/api/mensajes')
        if (activo) setMensajes(datos)
      } catch (err) {
        if (!activo) return
        if (err.sesionVencida) onSesionVencida()
        else setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarMensajes()

    return () => {
      activo = false
    }
  }, [onSesionVencida])

  async function cambiarLeido(mensaje) {
    setIdActualizando(mensaje._id)
    setError('')

    try {
      const actualizado = await pedirConSesion(`/api/mensajes/${mensaje._id}/leido`, {
        method: 'PATCH',
        body: { leido: !mensaje.leido },
      })
      setMensajes((anteriores) =>
        anteriores.map((m) => (m._id === actualizado._id ? actualizado : m))
      )
    } catch (err) {
      if (err.sesionVencida) onSesionVencida()
      else setError(err.message)
    } finally {
      setIdActualizando(null)
    }
  }

  const sinLeer = mensajes.filter((mensaje) => !mensaje.leido).length

  return (
    <section className="gestion">
      <div className="gestion-cabecera">
        <h2>
          Mensajes {sinLeer > 0 && <span className="mensajes-contador">{sinLeer} sin leer</span>}
        </h2>
      </div>

      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}

      {cargando && <p>Cargando mensajes…</p>}

      {!cargando && mensajes.length === 0 && !error && <p>Todavía no hay mensajes.</p>}

      <ul className="gestion-lista">
        {mensajes.map((mensaje) => (
          <li key={mensaje._id} className={mensaje.leido ? 'mensaje' : 'mensaje mensaje-nuevo'}>
            <div className="pedido-cabecera">
              <strong>{mensaje.nombre}</strong>
              <span>{formatoFecha.format(new Date(mensaje.createdAt))}</span>
            </div>

            <p className="pedido-contacto">
              <a href={`mailto:${mensaje.email}`}>{mensaje.email}</a>
              {mensaje.telefono && (
                <>
                  {' · Tel: '}
                  <a href={`tel:${mensaje.telefono}`}>{mensaje.telefono}</a>
                </>
              )}
            </p>

            <p className="mensaje-texto">{mensaje.mensaje}</p>

            <div>
              <button
                type="button"
                className="boton-secundario"
                onClick={() => cambiarLeido(mensaje)}
                disabled={idActualizando === mensaje._id}
              >
                {mensaje.leido ? 'Marcar como no leído' : 'Marcar como leído'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default GestionMensajes
