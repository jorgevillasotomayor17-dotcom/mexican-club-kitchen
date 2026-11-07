import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { requiereAdmin } from '../middleware/auth.js';
import Pedido from '../models/Pedido.js';
import Plato from '../models/Plato.js';

const router = Router();

const MAX_POR_PLATO = 50;
const MAX_PLATOS_DISTINTOS = 20;

// Cada persona (por IP) puede enviar 5 pedidos por hora: evita que llenen la base de datos con pedidos falsos
const limitadorPedidos = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { mensaje: 'Ya enviaste varios pedidos. Si necesitas algo más, escríbenos en Contacto.' },
});

function esTextoConContenido(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

router.post('/', limitadorPedidos, async (req, res) => {
  const { cliente, telefono, direccion, items } = req.body ?? {};

  if (!esTextoConContenido(cliente)) {
    return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  }
  if (!esTextoConContenido(telefono)) {
    return res.status(400).json({ mensaje: 'El teléfono es obligatorio' });
  }
  if (!esTextoConContenido(direccion)) {
    return res.status(400).json({ mensaje: 'La dirección es obligatoria' });
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_PLATOS_DISTINTOS) {
    return res.status(400).json({ mensaje: 'El pedido debe tener entre 1 y 20 platos distintos' });
  }

  const itemsValidos = items.every(
    (item) =>
      typeof item?.plato === 'string' &&
      mongoose.isValidObjectId(item.plato) &&
      Number.isInteger(item.cantidad) &&
      item.cantidad >= 1 &&
      item.cantidad <= MAX_POR_PLATO
  );

  if (!itemsValidos) {
    return res.status(400).json({ mensaje: 'Hay platos o cantidades no válidos en el pedido' });
  }

  try {
    const ids = items.map((item) => item.plato);
    const platos = await Plato.find({ _id: { $in: ids }, disponible: true });
    const platosPorId = new Map(platos.map((plato) => [plato.id, plato]));

    if (ids.some((id) => !platosPorId.has(id))) {
      return res.status(400).json({ mensaje: 'Algún plato del pedido ya no está disponible' });
    }

    // El nombre y el precio salen de la base de datos, nunca de lo que envía el navegador
    const itemsPedido = items.map((item) => {
      const plato = platosPorId.get(item.plato);
      return {
        plato: plato._id,
        nombre: plato.nombre,
        precio: plato.precio,
        cantidad: item.cantidad,
      };
    });
    const total = itemsPedido.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

    const pedido = await Pedido.create({ cliente, telefono, direccion, items: itemsPedido, total });

    res.status(201).json(pedido);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Datos del pedido no válidos' });
    }
    console.error('Error al crear el pedido:', error.message);
    res.status(500).json({ mensaje: 'No se pudo crear el pedido' });
  }
});

router.get('/', requiereAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error.message);
    res.status(500).json({ mensaje: 'No se pudieron obtener los pedidos' });
  }
});

router.patch('/:id/estado', requiereAdmin, async (req, res) => {
  const { estado } = req.body ?? {};
  const estadosValidos = Pedido.schema.path('estado').enumValues;

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: 'El id del pedido no es válido' });
  }
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: `El estado debe ser: ${estadosValidos.join(', ')}` });
  }

  try {
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { returnDocument: 'after' }
    );

    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json(pedido);
  } catch (error) {
    console.error('Error al cambiar el estado del pedido:', error.message);
    res.status(500).json({ mensaje: 'No se pudo cambiar el estado' });
  }
});

export default router;
