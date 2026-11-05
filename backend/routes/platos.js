import { Router } from 'express';
import Plato from '../models/Plato.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const platos = await Plato.find({ disponible: true }).sort({ categoria: 1, nombre: 1 });
    res.json(platos);
  } catch (error) {
    console.error('Error al obtener los platos:', error.message);
    res.status(500).json({ mensaje: 'No se pudieron obtener los platos' });
  }
});

export default router;
