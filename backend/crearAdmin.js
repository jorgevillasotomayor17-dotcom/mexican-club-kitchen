import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { conectarDB } from './config/db.js';
import Admin from './models/Admin.js';

const nombre = process.env.ADMIN_NOMBRE?.trim();
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

try {
  if (!nombre || !email || !password) {
    throw new Error('Faltan ADMIN_NOMBRE, ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env');
  }
  // bcrypt solo tiene en cuenta los primeros 72 bytes de la contraseña
  if (password.length < 8 || Buffer.byteLength(password) > 72) {
    throw new Error('ADMIN_PASSWORD debe tener entre 8 y 72 caracteres');
  }

  await conectarDB();

  const existe = await Admin.exists({ email });

  if (existe) {
    console.log(`Ya existe un administrador con el correo ${email}. No se cambió nada.`);
  } else {
    const hash = await bcrypt.hash(password, 10);
    await Admin.create({ nombre, email, password: hash });
    console.log(`Administrador ${email} creado.`);
  }
} catch (error) {
  console.error('No se pudo crear el administrador:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
