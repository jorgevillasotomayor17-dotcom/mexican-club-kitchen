import 'dotenv/config';
import mongoose from 'mongoose';
import { conectarDB } from './config/db.js';
import Plato from './models/Plato.js';

const platos = [
  {
    nombre: 'Tacos al pastor',
    descripcion: 'Tres tacos de cerdo adobado con piña, cebolla y cilantro.',
    precio: 22000,
    categoria: 'Tacos',
  },
  {
    nombre: 'Tacos de carnitas',
    descripcion: 'Tres tacos de cerdo confitado con cebolla y salsa verde.',
    precio: 23000,
    categoria: 'Tacos',
  },
  {
    nombre: 'Burrito de res',
    descripcion: 'Tortilla de harina con res, arroz, frijoles y queso.',
    precio: 28000,
    categoria: 'Burritos',
  },
  {
    nombre: 'Quesadilla de pollo',
    descripcion: 'Tortilla dorada con pollo, queso fundido y guacamole.',
    precio: 21000,
    categoria: 'Quesadillas',
  },
  {
    nombre: 'Agua de horchata',
    descripcion: 'Bebida fría de arroz con canela.',
    precio: 8000,
    categoria: 'Bebidas',
  },
];

try {
  await conectarDB();

  const cantidad = await Plato.countDocuments();

  if (cantidad > 0) {
    console.log(`Ya hay ${cantidad} platos. No se agregó nada.`);
  } else {
    await Plato.insertMany(platos);
    console.log(`Se agregaron ${platos.length} platos de ejemplo.`);
  }
} catch (error) {
  console.error('No se pudieron agregar los platos:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
