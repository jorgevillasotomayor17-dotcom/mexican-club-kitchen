import { useEffect, useState } from 'react'

// Devuelve el id de la sección que está en el centro de la pantalla ('' si ninguna)
// Importante: pasa un arreglo definido fuera del componente, para que no cambie en cada render
export function useSeccionActiva(ids) {
  const [activa, setActiva] = useState('')

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        // Primero las secciones que salen y luego las que entran, para no borrar la nueva
        const ordenadas = [...entradas].sort((a, b) => a.isIntersecting - b.isIntersecting)

        for (const entrada of ordenadas) {
          if (entrada.isIntersecting) {
            setActiva(entrada.target.id)
          } else {
            setActiva((actual) => (actual === entrada.target.id ? '' : actual))
          }
        }
      },
      // Solo cuenta una franja delgada en la mitad de la pantalla
      { rootMargin: '-45% 0px -50% 0px' }
    )

    for (const id of ids) {
      const seccion = document.getElementById(id)
      if (seccion) observador.observe(seccion)
    }

    return () => observador.disconnect()
  }, [ids])

  return activa
}
