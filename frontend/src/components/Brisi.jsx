import { useEffect, useRef, useState } from 'react'
import { useCarrito } from '../carrito/CarritoContext.js'
import { API_URL } from '../config.js'
import { formatoPesos } from '../formato.js'
import './Brisi.css'

const SALUDO = {
  rol: 'brisi',
  texto: '¡Hola! Soy Brisi 🌮 ¿Te ayudo a escoger algo del menú?',
}
const MAX_HISTORIAL = 10

function Brisi() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([SALUDO])
  const [texto, setTexto] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [error, setError] = useState('')
  const listaRef = useRef(null)
  const campoRef = useRef(null)
  const { agregar, abrir } = useCarrito()

  // Baja hasta el último mensaje cada vez que llega uno nuevo
  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight
    }
  }, [mensajes, escribiendo, error])

  // Pone el cursor en el campo de texto al abrir el chat
  useEffect(() => {
    if (abierto) campoRef.current?.focus()
  }, [abierto])

  async function enviar(evento) {
    evento.preventDefault()
    const limpio = texto.trim()
    if (!limpio || escribiendo) return

    const conversacion = [...mensajes, { rol: 'usuario', texto: limpio }]
    setMensajes(conversacion)
    setTexto('')
    setEscribiendo(true)
    setError('')

    // Sin el saludo, solo los últimos mensajes, y empezando siempre por un mensaje de la persona
    const historial = conversacion.slice(1).slice(-MAX_HISTORIAL)
    while (historial[0]?.rol === 'brisi') historial.shift()

    try {
      const respuesta = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Al servidor solo le enviamos quién habló y qué dijo
        body: JSON.stringify({ mensajes: historial.map(({ rol, texto }) => ({ rol, texto })) }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Brisi tuvo un problema. Intenta de nuevo.')
      }

      setMensajes((anteriores) => [
        ...anteriores,
        // platos: lo que Brisi propone agregar; agregado: si la persona ya tocó el botón
        { rol: 'brisi', texto: datos.respuesta, platos: datos.platos ?? [], agregado: false },
      ])
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'No pudimos conectar con Brisi. Intenta de nuevo en unos minutos.'
          : err.message
      )
    } finally {
      setEscribiendo(false)
    }
  }

  // La persona confirma: los platos que propuso Brisi entran al carrito
  function agregarSugerencia(indice) {
    mensajes[indice].platos.forEach((plato) => agregar(plato, plato.cantidad))
    setMensajes((anteriores) =>
      anteriores.map((mensaje, i) => (i === indice ? { ...mensaje, agregado: true } : mensaje))
    )
  }

  return (
    <div className="brisi">
      {abierto && (
        <section className="brisi-ventana" aria-label="Chat con Brisi">
          <header className="brisi-cabecera">
            <div>
              <strong>Brisi</strong>
              <span>Asistente con inteligencia artificial</span>
            </div>
            <button
              type="button"
              className="brisi-cerrar"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar el chat"
            >
              ×
            </button>
          </header>

          <ol className="brisi-mensajes" ref={listaRef} aria-live="polite">
            {mensajes.map((mensaje, indice) => (
              <li key={indice} className={`brisi-burbuja brisi-burbuja-${mensaje.rol}`}>
                {mensaje.texto}

                {mensaje.platos?.length > 0 && (
                  <div className="brisi-sugerencia">
                    <ul>
                      {mensaje.platos.map((plato) => (
                        <li key={plato._id}>
                          {plato.cantidad} × {plato.nombre}
                          <span>{formatoPesos.format(plato.precio * plato.cantidad)}</span>
                        </li>
                      ))}
                    </ul>

                    {mensaje.agregado ? (
                      <button type="button" className="brisi-sugerencia-listo" onClick={abrir}>
                        ✓ Agregado · Ver pedido
                      </button>
                    ) : (
                      <button type="button" onClick={() => agregarSugerencia(indice)}>
                        Agregar al pedido
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
            {escribiendo && (
              <li className="brisi-burbuja brisi-burbuja-brisi brisi-escribiendo">
                Brisi está escribiendo…
              </li>
            )}
          </ol>

          {error && (
            <p className="brisi-error" role="alert">
              {error}
            </p>
          )}

          <form className="brisi-formulario" onSubmit={enviar}>
            <input
              ref={campoRef}
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Escribe tu pregunta…"
              maxLength={500}
              aria-label="Tu mensaje para Brisi"
            />
            <button type="submit" disabled={escribiendo || !texto.trim()}>
              Enviar
            </button>
          </form>

          <p className="brisi-aviso">
            Brisi es una IA y puede equivocarse. No compartas datos personales.
          </p>
        </section>
      )}

      <button
        type="button"
        className="brisi-boton"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
      >
        {abierto ? 'Cerrar chat' : '💬 Habla con Brisi'}
      </button>
    </div>
  )
}

export default Brisi
