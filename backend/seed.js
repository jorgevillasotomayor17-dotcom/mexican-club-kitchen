import 'dotenv/config';
import mongoose from 'mongoose';
import { conectarDB } from './config/db.js';
import Plato from './models/Plato.js';

// Fotos de Unsplash (licencia libre); w=800 pide una versión liviana de la imagen
const foto = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=75&auto=format&fit=crop`;

const platos = [
  {
    nombre: 'Tacos al pastor',
    descripcion: 'Tres tacos de cerdo adobado con piña, cebolla y cilantro.',
    precio: 22000,
    categoria: 'Tacos',
    imagen: foto('1687881063470-a78e6ea2590e'),
  },
  {
    nombre: 'Tacos de carnitas',
    descripcion: 'Tres tacos de cerdo confitado con cebolla y salsa verde.',
    precio: 23000,
    categoria: 'Tacos',
    imagen: foto('1648437595587-e6a8b0cdf1f9'),
  },
  {
    nombre: 'Burrito de res',
    descripcion: 'Tortilla de harina con res, arroz, frijoles y queso.',
    precio: 28000,
    categoria: 'Burritos',
    imagen: foto('1731090389603-d63060ee08a6'),
  },
  {
    nombre: 'Quesadilla de pollo',
    descripcion: 'Tortilla dorada con pollo, queso fundido y guacamole.',
    precio: 21000,
    categoria: 'Quesadillas',
    imagen: foto('1673990349292-ed2dfa7988c9'),
  },
  {
    nombre: 'Agua de horchata',
    descripcion: 'Bebida fría de arroz con canela.',
    precio: 8000,
    categoria: 'Bebidas',
    imagen: foto('1610310929634-e0fa80664a45'),
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
