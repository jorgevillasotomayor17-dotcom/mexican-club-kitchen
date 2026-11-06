import { useEffect, useState } from 'react'
import { API_URL } from '../config.js'
import TarjetaPlato from './TarjetaPlato.jsx'
import './Menu.css'

const CATEGORIAS = ['Tacos', 'Burritos', 'Quesadillas', 'Bebidas']

function Menu() {
  const [platos, setPlatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controlador = new AbortController()

    async function cargarPlatos() {
      try {
        const respuesta = await fetch(`${API_URL}/api/platos`, {
          signal: controlador.signal,
        })

        if (!respuesta.ok) {
          throw new Error(`El servidor respondió ${respuesta.status}`)
        }

        setPlatos(await respuesta.json())
      } catch (err) {
        if (err.name === 'AbortError') return
        setError('No pudimos cargar el menú. Intenta de nuevo en unos minutos.')
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    cargarPlatos()

    return () => controlador.abort()
  }, [])

  const hayPlatos = platos.length > 0

  return (
    <section id="menu" className="menu">
      <h2>Nuestro menú</h2>

      {cargando && <p className="menu-aviso">Cargando el menú…</p>}

      {error && (
        <p className="menu-aviso menu-error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && !hayPlatos && (
        <p className="menu-aviso">Pronto tendremos platos disponibles.</p>
      )}

      {CATEGORIAS.map((categoria) => {
        const platosDeCategoria = platos.filter((plato) => plato.categoria === categoria)

        if (platosDeCategoria.length === 0) return null

        return (
          <div key={categoria} className="menu-categoria">
            <h3>{categoria}</h3>
            <ul className="menu-lista">
              {platosDeCategoria.map((plato) => (
                <li key={plato._id}>
                  <TarjetaPlato plato={plato} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

export default Menu
