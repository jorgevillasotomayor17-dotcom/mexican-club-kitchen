import { useEffect, useRef, useState } from 'react'
import { useCarrito } from '../carrito/CarritoContext.js'
import { API_URL } from '../config.js'
import { formatoPesos } from '../formato.js'
import './Carrito.css'

const DATOS_VACIOS = { cliente: '', telefono: '', direccion: '' }

function Carrito() {
  const { items, total, abierto, cerrar, cambiarCantidad, quitar, vaciar } = useCarrito()
  const [datos, setDatos] = useState(DATOS_VACIOS)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [pedidoHecho, setPedidoHecho] = useState(null)
  const cerrarRef = useRef(null)

  // Al abrir el panel: el foco va al botón de cerrar y la tecla Escape lo cierra
  useEffect(() => {
    if (!abierto) return

    cerrarRef.current?.focus()

    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') cerrar()
    }

    document.addEventListener('keydown', alPresionarTecla)
    return () => document.removeEventListener('keydown', alPresionarTecla)
  }, [abierto, cerrar])

  if (!abierto) return null

  function cambiarDato(evento) {
    const { name, value } = evento.target
    setDatos((anteriores) => ({ ...anteriores, [name]: value }))
  }

  function cerrarPanel() {
    setPedidoHecho(null)
    setError('')
    cerrar()
  }

  async function enviarPedido(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError('')

    try {
      const respuesta = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datos,
          // Solo se envía el id y la cantidad: el precio lo pone el servidor
          items: items.map((item) => ({ plato: item._id, cantidad: item.cantidad })),
        }),
      })
      const resultado = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'No se pudo enviar el pedido')
      }

      setPedidoHecho(resultado)
      setDatos(DATOS_VACIOS)
      vaciar()
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'No hay conexión con el restaurante. Intenta de nuevo en un momento.'
          : err.message
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="carrito-fondo" onClick={cerrarPanel}>
      <aside
        className="carrito"
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="carrito-cabecera">
          <h2 id="carrito-titulo">Tu pedido</h2>
          <button
            ref={cerrarRef}
            type="button"
            className="carrito-cerrar"
            onClick={cerrarPanel}
            aria-label="Cerrar el pedido"
          >
            ×
          </button>
        </header>

        {pedidoHecho ? (
          <div className="carrito-confirmado" role="status">
            <p className="carrito-confirmado-icono" aria-hidden="true">🎉</p>
            <h3>¡Pedido recibido!</h3>
            <p>
              Gracias, {pedidoHecho.cliente}. Te llamaremos al {pedidoHecho.telefono} para
              confirmar tu pedido de {formatoPesos.format(pedidoHecho.total)}.
            </p>
            <button type="button" className="boton" onClick={cerrarPanel}>
              Seguir mirando el menú
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="carrito-vacio">
            Tu pedido está vacío. Toca <strong>Agregar</strong> en los platos del menú.
          </p>
        ) : (
          <div className="carrito-contenido">
            <ul className="carrito-lista">
              {items.map((item) => (
                <li key={item._id} className="carrito-item">
                  <div>
                    <p className="carrito-item-nombre">{item.nombre}</p>
                    <p className="carrito-item-precio">
                      {formatoPesos.format(item.precio * item.cantidad)}
                    </p>
                  </div>

                  <div className="carrito-cantidad">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item._id, item.cantidad - 1)}
                      aria-label={`Quitar una unidad de ${item.nombre}`}
                    >
                      −
                    </button>
                    <span aria-label={`Cantidad: ${item.cantidad}`}>{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item._id, item.cantidad + 1)}
                      aria-label={`Agregar una unidad de ${item.nombre}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="carrito-quitar"
                    onClick={() => quitar(item._id)}
                    aria-label={`Quitar ${item.nombre} del pedido`}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>

            <p className="carrito-total">
              <span>Total</span>
              <strong>{formatoPesos.format(total)}</strong>
            </p>

            <form className="carrito-formulario" onSubmit={enviarPedido}>
              <h3>¿A dónde te lo llevamos?</h3>

              <label>
                Nombre
                <input
                  name="cliente"
                  value={datos.cliente}
                  onChange={cambiarDato}
                  maxLength={80}
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Teléfono
                <input
                  type="tel"
                  name="telefono"
                  value={datos.telefono}
                  onChange={cambiarDato}
                  maxLength={20}
                  autoComplete="tel"
                  required
                />
              </label>

              <label>
                Dirección
                <input
                  name="direccion"
                  value={datos.direccion}
                  onChange={cambiarDato}
                  maxLength={200}
                  autoComplete="street-address"
                  placeholder="Calle, número y barrio"
                  required
                />
              </label>

              {error && (
                <p className="carrito-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="boton" disabled={enviando}>
                {enviando ? 'Enviando…' : `Hacer pedido · ${formatoPesos.format(total)}`}
              </button>

              <p className="carrito-nota">Pagas al recibir tu pedido. Te llamaremos para confirmarlo.</p>
            </form>
          </div>
        )}
      </aside>
    </div>
  )
}

export default Carrito
