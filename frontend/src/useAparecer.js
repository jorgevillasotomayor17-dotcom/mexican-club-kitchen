import { useEffect, useRef, useState } from 'react'

// Avisa cuando un elemento entra en la pantalla, para animarlo en ese momento
export function useAparecer() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    // IntersectionObserver vigila si el elemento se ve en la ventana del navegador
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect() // Solo se anima la primera vez
        }
      },
      { threshold: 0.15 } // Cuando se ve al menos el 15% del elemento
    )

    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return [ref, visible]
}
