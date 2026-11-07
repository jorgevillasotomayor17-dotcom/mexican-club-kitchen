import { useEffect, useState } from 'react'
import { CarritoContext, MAX_PLATOS_DISTINTOS, MAX_POR_PLATO } from './CarritoContext.js'

const CLAVE = 'mck-carrito'

// Recupera el carrito guardado en el navegador; si algo está dañado, empieza vacío
function leerGuardado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE))
    if (!Array.isArray(guardado)) return []

    return guardado.filter(
      (item) =>
        typeof item?._id === 'string' &&
        typeof item.nombre === 'string' &&
        Number.isFinite(item.precio) &&
        Number.isInteger(item.cantidad) &&
        item.cantidad >= 1 &&
        item.cantidad <= MAX_POR_PLATO
    )
  } catch {
    return []
  }
}

function ProveedorCarrito({ children }) {
  const [items, setItems] = useState(leerGuardado)
  const [abierto, setAbierto] = useState(false)

  // Cada vez que cambia el carrito, se guarda para no perderlo al recargar la página
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items))
    } catch {
      // Navegación privada o almacenamiento bloqueado: el carrito sigue funcionando sin guardarse
    }
  }, [items])

  function agregar(plato, cantidad = 1) {
    setItems((anteriores) => {
      const existente = anteriores.find((item) => item._id === plato._id)

      if (existente) {
        return anteriores.map((item) =>
          item._id === plato._id
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, MAX_POR_PLATO) }
            : item
        )
      }

      if (anteriores.length >= MAX_PLATOS_DISTINTOS) return anteriores

      const nuevo = {
        _id: plato._id,
        nombre: plato.nombre,
        precio: plato.precio,
        cantidad: Math.min(cantidad, MAX_POR_PLATO),
      }
      return [...anteriores, nuevo]
    })
  }

  // Si la cantidad llega a 0, el plato sale del carrito
  function cambiarCantidad(id, cantidad) {
    setItems((anteriores) =>
      anteriores
        .map((item) =>
          item._id === id ? { ...item, cantidad: Math.min(cantidad, MAX_POR_PLATO) } : item
        )
        .filter((item) => item.cantidad > 0)
    )
  }

  function quitar(id) {
    setItems((anteriores) => anteriores.filter((item) => item._id !== id))
  }

  function vaciar() {
    setItems([])
  }

  // Valores calculados a partir de los items: no se guardan aparte
  const unidades = items.reduce((suma, item) => suma + item.cantidad, 0)
  const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0)

  const valor = {
    items,
    unidades,
    total,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    abierto,
    abrir: () => setAbierto(true),
    cerrar: () => setAbierto(false),
  }

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

export default ProveedorCarrito
