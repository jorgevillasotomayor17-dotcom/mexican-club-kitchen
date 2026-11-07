import { useState } from 'react'
import { CATEGORIAS } from '../categorias.js'

function FormularioPlato({ plato, ocupado, onGuardar, onCancelar }) {
  const esNuevo = !plato._id

  const [campos, setCampos] = useState({
    nombre: plato.nombre ?? '',
    descripcion: plato.descripcion ?? '',
    precio: plato.precio ?? '',
    categoria: plato.categoria ?? CATEGORIAS[0],
    imagen: plato.imagen ?? '',
    disponible: plato.disponible ?? true,
  })

  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target
    setCampos((anteriores) => ({ ...anteriores, [name]: type === 'checkbox' ? checked : value }))
  }

  function enviar(evento) {
    evento.preventDefault()
    onGuardar({ ...campos, precio: Number(campos.precio) })
  }

  return (
    <form className="form-plato formulario-vidrio" onSubmit={enviar}>
      <h3>{esNuevo ? 'Nuevo plato' : `Editar: ${plato.nombre}`}</h3>

      <label>
        Nombre
        <input name="nombre" value={campos.nombre} onChange={cambiarCampo} required maxLength={80} />
      </label>

      <label>
        Descripción
        <textarea
          name="descripcion"
          value={campos.descripcion}
          onChange={cambiarCampo}
          required
          maxLength={300}
          rows={3}
        />
      </label>

      <div className="form-plato-fila">
        <label>
          Precio (COP)
          <input
            type="number"
            name="precio"
            value={campos.precio}
            onChange={cambiarCampo}
            required
            min={0}
            step={100}
          />
        </label>

        <label>
          Categoría
          <select name="categoria" value={campos.categoria} onChange={cambiarCampo}>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span>
          Dirección de la foto <span className="form-plato-opcional">(opcional)</span>
        </span>
        <input
          type="url"
          name="imagen"
          value={campos.imagen}
          onChange={cambiarCampo}
          placeholder="https://..."
        />
      </label>

      <label className="form-plato-casilla">
        <input
          type="checkbox"
          name="disponible"
          checked={campos.disponible}
          onChange={cambiarCampo}
        />
        Visible en la web
      </label>

      <div className="form-plato-botones">
        <button type="submit" className="boton" disabled={ocupado} aria-busy={ocupado}>
          {ocupado ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" className="boton-secundario" onClick={onCancelar} disabled={ocupado}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioPlato
