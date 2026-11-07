import { createContext, useContext } from 'react'

// Los mismos límites que revisa el backend al recibir un pedido
export const MAX_POR_PLATO = 50
export const MAX_PLATOS_DISTINTOS = 20

// La "caja" donde vive el carrito para que cualquier componente pueda usarlo
export const CarritoContext = createContext(null)

// Atajo para leer el carrito desde cualquier componente
export function useCarrito() {
  const carrito = useContext(CarritoContext)
  if (!carrito) {
    throw new Error('useCarrito debe usarse dentro de <ProveedorCarrito>')
  }
  return carrito
}
