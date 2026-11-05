import { Router } from 'express';
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

export default router;
