import { useEffect, useState } from 'react'
import { useCarrito } from '../carrito/CarritoContext.js'
import { useSeccionActiva } from '../useSeccionActiva.js'
import './Encabezado.css'

// Fuera del componente: así el arreglo es siempre el mismo y el hook no se reinicia
const ENLACES = [
  { id: 'menu', texto: 'Menú' },
  { id: 'nosotros', texto: 'Nosotros' },
  { id: 'contacto', texto: 'Contacto' },
]
const IDS = ENLACES.map((enlace) => enlace.id)

// Desde cuántos píxeles de scroll la barra se vuelve más sólida
const UMBRAL_SCROLL = 24

function Encabezado() {
  const { unidades, abrir } = useCarrito()
  const activa = useSeccionActiva(IDS)
  const [scrollado, setScrollado] = useState(() => window.scrollY > UMBRAL_SCROLL)

  useEffect(() => {
    function revisarScroll() {
      // Si el valor no cambia, React no vuelve a dibujar el encabezado
      setScrollado(window.scrollY > UMBRAL_SCROLL)
    }

    // passive: le promete al navegador que no bloquearemos el scroll, así se mantiene fluido
    window.addEventListener('scroll', revisarScroll, { passive: true })
    return () => window.removeEventListener('scroll', revisarScroll)
  }, [])

  return (
    <header className={`encabezado ${scrollado ? 'encabezado-scrollado' : ''}`}>
      <a href="#inicio" className="logo">
        Mexican Club Kitchen
      </a>

      <nav aria-label="Principal">
        <ul className="menu-principal">
          {ENLACES.map((enlace) => (
            <li key={enlace.id}>
              <a
                href={`#${enlace.id}`}
                // aria-current le dice a los lectores de pantalla en qué sección estás
                aria-current={activa === enlace.id ? 'true' : undefined}
              >
                {enlace.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className="encabezado-carrito"
        onClick={abrir}
        aria-label={`Ver tu pedido: ${unidades} ${unidades === 1 ? 'plato' : 'platos'}`}
      >
        <span aria-hidden="true">🛒</span> Pedido
        {unidades > 0 && (
          // key cambia con el número: React vuelve a crear la burbuja y su animación se repite
          <span key={unidades} className="encabezado-contador" aria-hidden="true">
            {unidades}
          </span>
        )}
      </button>
    </header>
  )
}

export default Encabezado
