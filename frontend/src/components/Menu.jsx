import { useEffect, useState } from 'react'
import { CATEGORIAS } from '../categorias.js'
import { API_URL } from '../config.js'
import EsqueletoPlato from './EsqueletoPlato.jsx'
import TarjetaPlato from './TarjetaPlato.jsx'
import './Menu.css'

// Cuántas tarjetas fantasma se muestran mientras carga
const ESQUELETOS = 3

function Menu() {
  const [platos, setPlatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  // Cada vez que cambia este número, el useEffect vuelve a pedir el menú
  const [intento, setIntento] = useState(0)

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
        setError('No pudimos cargar el menú. Revisa tu conexión e intenta de nuevo.')
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    cargarPlatos()

    return () => controlador.abort()
  }, [intento])

  function reintentar() {
    setError('')
    setCargando(true)
    setIntento((anterior) => anterior + 1)
  }

  const hayPlatos = platos.length > 0

  return (
    <section id="menu" className="menu">
      <h2>Nuestro menú</h2>

      {cargando && (
        <>
          {/* Los lectores de pantalla oyen el aviso; en pantalla se ven las tarjetas fantasma */}
          <p className="solo-lectores" role="status">
            Cargando el menú…
          </p>
          <ul className="menu-lista">
            {Array.from({ length: ESQUELETOS }, (_, indice) => (
              <li key={indice}>
                <EsqueletoPlato />
              </li>
            ))}
          </ul>
        </>
      )}

      {error && (
        <div className="menu-error" role="alert">
          <p>{error}</p>
          <button type="button" className="boton-vidrio" onClick={reintentar}>
            Intentar de nuevo
          </button>
        </div>
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
              {platosDeCategoria.map((plato, posicion) => (
                <li key={plato._id}>
                  <TarjetaPlato plato={plato} posicion={posicion} />
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
