import { useEffect, useState } from 'react'
import { formatoFecha, formatoPesos } from '../formato.js'
import { pedirConSesion } from './api.js'

// Deben coincidir con el enum del modelo Pedido en el backend
const ESTADOS = ['pendiente', 'preparando', 'en camino', 'entregado', 'cancelado']

function GestionPedidos({ onSesionVencida }) {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [idActualizando, setIdActualizando] = useState(null)

  useEffect(() => {
    let activo = true

    async function cargarPedidos() {
      try {
        const datos = await pedirConSesion('/api/pedidos')
        if (activo) setPedidos(datos)
      } catch (err) {
        if (!activo) return
        if (err.sesionVencida) onSesionVencida()
        else setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarPedidos()

    return () => {
      activo = false
    }
  }, [onSesionVencida])

  async function cambiarEstado(pedido, estado) {
    setIdActualizando(pedido._id)
    setError('')

    try {
      const actualizado = await pedirConSesion(`/api/pedidos/${pedido._id}/estado`, {
        method: 'PATCH',
        body: { estado },
      })
      setPedidos((anteriores) =>
        anteriores.map((p) => (p._id === actualizado._id ? actualizado : p))
      )
    } catch (err) {
      if (err.sesionVencida) onSesionVencida()
      else setError(err.message)
    } finally {
      setIdActualizando(null)
    }
  }

  return (
    <section className="gestion">
      <div className="gestion-cabecera">
        <h2>Pedidos</h2>
      </div>

      {error && (
        <p className="panel-error" role="alert">
          {error}
        </p>
      )}

      {cargando && <p>Cargando pedidos…</p>}

      {!cargando && pedidos.length === 0 && !error && <p>Todavía no hay pedidos.</p>}

      <ul className="gestion-lista">
        {pedidos.map((pedido) => (
          <li key={pedido._id} className={`pedido pedido-${pedido.estado.replace(' ', '-')}`}>
            <div className="pedido-cabecera">
              <strong>{pedido.cliente}</strong>
              <span>{formatoFecha.format(new Date(pedido.createdAt))}</span>
            </div>

            <p className="pedido-contacto">
              Tel: <a href={`tel:${pedido.telefono}`}>{pedido.telefono}</a>
              <br />
              Dirección: {pedido.direccion}
            </p>

            <ul className="pedido-items">
              {pedido.items.map((item, indice) => (
                <li key={`${item.plato}-${indice}`}>
                  {item.cantidad} × {item.nombre}
                  <span>{formatoPesos.format(item.precio * item.cantidad)}</span>
                </li>
              ))}
            </ul>

            <div className="pedido-pie">
              <strong>Total: {formatoPesos.format(pedido.total)}</strong>

              <label className="pedido-estado">
                Estado
                <select
                  value={pedido.estado}
                  onChange={(evento) => cambiarEstado(pedido, evento.target.value)}
                  disabled={idActualizando === pedido._id}
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default GestionPedidos
