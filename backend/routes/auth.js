import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
  }

  try {
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select('+password');
    const esCorrecta = admin && (await bcrypt.compare(password, admin.password));

    if (!esCorrecta) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      admin: { id: admin._id, nombre: admin.nombre, email: admin.email },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    res.status(500).json({ mensaje: 'No se pudo iniciar sesión' });
  }
});

export default router;
