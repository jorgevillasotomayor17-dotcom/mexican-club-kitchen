import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { requiereAdmin } from '../middleware/auth.js';
import Mensaje from '../models/Mensaje.js';

const router = Router();

// Cada persona (por IP) puede enviar 5 mensajes por hora: evita que llenen la base de datos con mensajes falsos
const limitadorMensajes = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { mensaje: 'Ya enviaste varios mensajes. Te responderemos pronto.' },
});

router.post('/', limitadorMensajes, async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body ?? {};

  try {
    await Mensaje.create({ nombre, email, telefono, mensaje });
    res.status(201).json({ mensaje: '¡Gracias! Te responderemos pronto.' });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'Revisa los datos del formulario' });
    }
    console.error('Error al guardar el mensaje:', error.message);
    res.status(500).json({ mensaje: 'No se pudo enviar el mensaje' });
  }
});

router.get('/', requiereAdmin, async (req, res) => {
  try {
    const mensajes = await Mensaje.find().sort({ createdAt: -1 });
    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener los mensajes:', error.message);
    res.status(500).json({ mensaje: 'No se pudieron obtener los mensajes' });
  }
});

router.patch('/:id/leido', requiereAdmin, async (req, res) => {
  const { leido } = req.body ?? {};

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: 'El id del mensaje no es válido' });
  }
  if (typeof leido !== 'boolean') {
    return res.status(400).json({ mensaje: 'leido debe ser true o false' });
  }

  try {
    const encontrado = await Mensaje.findByIdAndUpdate(
      req.params.id,
      { leido },
      { returnDocument: 'after' }
    );

    if (!encontrado) {
      return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
    }

    res.json(encontrado);
  } catch (error) {
    console.error('Error al marcar el mensaje:', error.message);
    res.status(500).json({ mensaje: 'No se pudo actualizar el mensaje' });
  }
});

export default router;
