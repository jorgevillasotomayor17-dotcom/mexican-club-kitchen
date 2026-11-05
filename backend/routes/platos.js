import { Router } from 'express';
import mongoose from 'mongoose';
import { requiereAdmin } from '../middleware/auth.js';
import Plato from '../models/Plato.js';

const router = Router();

const CAMPOS_PERMITIDOS = ['nombre', 'descripcion', 'precio', 'categoria', 'imagen', 'disponible'];

// Toma del cuerpo solo los campos que el admin puede cambiar
function elegirCampos(body) {
  const datos = {};
  for (const campo of CAMPOS_PERMITIDOS) {
    if (body?.[campo] !== undefined) {
      datos[campo] = body[campo];
    }
  }
  return datos;
}

router.get('/', async (req, res) => {
  try {
    const platos = await Plato.find({ disponible: true }).sort({ categoria: 1, nombre: 1 });
    res.json(platos);
  } catch (error) {
    console.error('Error al obtener los platos:', error.message);
    res.status(500).json({ mensaje: 'No se pudieron obtener los platos' });
  }
});

router.get('/todos', requiereAdmin, async (req, res) => {
  try {
    const platos = await Plato.find().sort({ categoria: 1, nombre: 1 });
    res.json(platos);
  } catch (error) {
    console.error('Error al obtener todos los platos:', error.message);
    res.status(500).json({ mensaje: 'No se pudieron obtener los platos' });
  }
});

router.post('/', requiereAdmin, async (req, res) => {
  try {
    const plato = await Plato.create(elegirCampos(req.body));
    res.status(201).json(plato);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Datos del plato no válidos' });
    }
    console.error('Error al crear el plato:', error.message);
    res.status(500).json({ mensaje: 'No se pudo crear el plato' });
  }
});

router.put('/:id', requiereAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: 'El id del plato no es válido' });
  }

  try {
    const plato = await Plato.findByIdAndUpdate(req.params.id, elegirCampos(req.body), {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!plato) {
      return res.status(404).json({ mensaje: 'Plato no encontrado' });
    }

    res.json(plato);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'Datos del plato no válidos' });
    }
    console.error('Error al editar el plato:', error.message);
    res.status(500).json({ mensaje: 'No se pudo editar el plato' });
  }
});

router.delete('/:id', requiereAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: 'El id del plato no es válido' });
  }

  try {
    const plato = await Plato.findByIdAndDelete(req.params.id);

    if (!plato) {
      return res.status(404).json({ mensaje: 'Plato no encontrado' });
    }

    res.json({ mensaje: 'Plato eliminado' });
  } catch (error) {
    console.error('Error al eliminar el plato:', error.message);
    res.status(500).json({ mensaje: 'No se pudo eliminar el plato' });
  }
});

export default router;
