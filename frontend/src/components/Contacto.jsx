import { useState } from 'react'
import { API_URL } from '../config.js'
import './Contacto.css'

const FORMULARIO_VACIO = { nombre: '', email: '', telefono: '', mensaje: '' }

function Contacto() {
  const [campos, setCampos] = useState(FORMULARIO_VACIO)
  const [estado, setEstado] = useState('inactivo')
  const [aviso, setAviso] = useState('')

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    setCampos((anteriores) => ({ ...anteriores, [name]: value }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setEstado('enviando')
    setAviso('')

    try {
      const respuesta = await fetch(`${API_URL}/api/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campos),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo enviar el mensaje')
      }

      setEstado('enviado')
      setAviso(datos.mensaje)
      setCampos(FORMULARIO_VACIO)
    } catch (error) {
      setEstado('error')
      setAviso(
        error instanceof TypeError
          ? 'No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.'
          : error.message
      )
    }
  }

  const enviando = estado === 'enviando'

  return (
    <section id="contacto" className="contacto">
      <h2>Contáctanos</h2>
      <p className="contacto-intro">
        ¿Tienes una pregunta o quieres hacer un pedido especial? Escríbenos.
      </p>

      <form className="contacto-formulario" onSubmit={enviar}>
        <label>
          Nombre
          <input
            name="nombre"
            value={campos.nombre}
            onChange={cambiarCampo}
            required
            maxLength={80}
            autoComplete="name"
          />
        </label>

        <label>
          Correo electrónico
          <input
            type="email"
            name="email"
            value={campos.email}
            onChange={cambiarCampo}
            required
            maxLength={120}
            autoComplete="email"
          />
        </label>

        <label>
          <span>
            Teléfono <span className="contacto-opcional">(opcional)</span>
          </span>
          <input
            type="tel"
            name="telefono"
            value={campos.telefono}
            onChange={cambiarCampo}
            maxLength={20}
            autoComplete="tel"
          />
        </label>

        <label>
          Mensaje
          <textarea
            name="mensaje"
            value={campos.mensaje}
            onChange={cambiarCampo}
            required
            maxLength={1000}
            rows={5}
          />
        </label>

        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar mensaje'}
        </button>

        {aviso && (
          <p
            className={`contacto-aviso contacto-aviso-${estado}`}
            role={estado === 'error' ? 'alert' : 'status'}
          >
            {aviso}
          </p>
        )}
      </form>
    </section>
  )
}

export default Contacto
