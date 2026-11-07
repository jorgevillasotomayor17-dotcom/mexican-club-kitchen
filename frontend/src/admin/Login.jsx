import { useState } from 'react'
import { API_URL } from '../config.js'
import { guardarSesion } from './sesion.js'

function Login({ onEntrar }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function entrar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError('')

    try {
      const respuesta = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo iniciar sesión')
      }

      guardarSesion(datos)
      onEntrar(datos)
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.'
          : err.message
      )
      setEnviando(false)
    }
  }

  return (
    <main className="login">
      <form className="login-formulario formulario-vidrio" onSubmit={entrar}>
        <h1>Panel de administración</h1>

        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
            autoComplete="username"
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="boton" disabled={enviando} aria-busy={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </main>
  )
}

export default Login
