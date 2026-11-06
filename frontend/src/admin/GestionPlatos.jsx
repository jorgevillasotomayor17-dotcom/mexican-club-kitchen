import { useEffect, useState } from 'react'
import { formatoPesos } from '../formato.js'
import { pedirConSesion } from './api.js'

function GestionPlatos({ onSesionVencida }) {
  const [platos, setPlatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    let activo = true

    async function cargarPlatos() {
      try {
        const datos = await pedirConSesion('/api/platos/todos')
        if (activo) setPlatos(datos)
      } catch (err) {
        if (!activo) return
        if (err.sesionVencida) onSesionVencida()
        else setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarPlatos()

    return () => {
      activo = false
    }
  }, [onSesionVencida])

  // Ejecuta una acción sobre un plato y muestra el error si algo falla
  async function ejecutar(accion) {
    setOcupado(true)
    setError('')
    try {
      await accion()
    } catch (err) {
      if (err.sesionVencida) onSesionVencida()
      else setError(err.message)
    } finally {
      setOcupado(false)
    }
  }

  function reemplazarPlato(platoActualizado) {
    setPlatos((anteriores) =>
      anteriores.map((plato) => (plato._id === platoActualizado._id ? platoActualizado : plato))
    )
  }

  function cambiarDisponible(plato) {
    ejecutar(async () => {
      const actualizado = await pedirConSesion(`/api/platos/${plato._id}`, {
        method: 'PUT',
        body: { disponible: !plato.disponible },
      })
      reemplazarPlato(actualizado)
    })
  }

  function borrar(plato) {
    const confirmado = window.confirm(
      `¿Borrar "${plato.nombre}"? Esta acción no se puede deshacer.`
    )
    if (!confirmado) return

    ejecutar(async () => {
      await pedirConSesion(`/api/platos/${plato._id}`, { method: 'DELETE' })
      setPlatos((anteriores) => anteriores.filter((p) => p._id !== plato._id))
    })
  }

  return (
    <section className="gestion">
      <div className="gestion-cabecera">
        <h2>Platos</h2>
      </div>

      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}

      {cargando && <p>Cargando platos…</p>}

      {!cargando && platos.length === 0 && !error && <p>Todavía no hay platos.</p>}

      <ul className="gestion-lista">
        {platos.map((plato) => (
          <li
            key={plato._id}
            className={plato.disponible ? 'gestion-fila' : 'gestion-fila gestion-fila-oculta'}
          >
            <div className="gestion-info">
              <strong>{plato.nombre}</strong>
              <span>
                {plato.categoria} · {formatoPesos.format(plato.precio)}
                {!plato.disponible && ' · Oculto'}
              </span>
            </div>

            <div className="gestion-acciones">
              <button
                type="button"
                className="boton-secundario"
                onClick={() => cambiarDisponible(plato)}
                disabled={ocupado}
              >
                {plato.disponible ? 'Ocultar' : 'Mostrar'}
              </button>
              <button
                type="button"
                className="boton-peligro"
                onClick={() => borrar(plato)}
                disabled={ocupado}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default GestionPlatos
