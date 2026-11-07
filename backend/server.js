import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { conectarDB } from './config/db.js';
import authRouter from './routes/auth.js';
import chatRouter from './routes/chat.js';
import mensajesRouter from './routes/mensajes.js';
import pedidosRouter from './routes/pedidos.js';
import platosRouter from './routes/platos.js';

const app = express();
const PORT = process.env.PORT || 3000;

// En Render las peticiones llegan a través de un proxy: así se lee la IP real de cada visitante
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Mexican Club Kitchen funcionando' });
});

app.use('/api/auth', authRouter);
app.use('/api/platos', platosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/mensajes', mensajesRouter);
app.use('/api/chat', chatRouter);

// Responde en JSON cuando llega un cuerpo mal formado u otro error inesperado
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'Los datos enviados no son JSON válido' });
  }
  console.error('Error inesperado:', error.message);
  res.status(error.status || 500).json({ mensaje: 'Ocurrió un error en el servidor' });
});

try {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en el archivo .env');
  }

  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exit(1);
}
