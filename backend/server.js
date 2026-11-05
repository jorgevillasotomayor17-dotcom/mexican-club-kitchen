import 'dotenv/config';
import express from 'express';
import { conectarDB } from './config/db.js';
import platosRouter from './routes/platos.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Mexican Club Kitchen funcionando' });
});

app.use('/api/platos', platosRouter);

try {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
}
