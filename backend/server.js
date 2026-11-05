import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { conectarDB } from './config/db.js';
import platosRouter from './routes/platos.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Mexican Club Kitchen funcionando' });
});

app.use('/api/platos', platosRouter);

// Responde en JSON cuando llega un cuerpo mal formado u otro error inesperado
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'Los datos enviados no son JSON válido' });
  }
  console.error('Error inesperado:', error.message);
  res.status(error.status || 500).json({ mensaje: 'Ocurrió un error en el servidor' });
});

try {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
}
