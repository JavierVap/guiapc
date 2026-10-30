import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import placeRoutes from './routes/places.js';
import adminRoutes from './routes/admin.js';
import eventRoutes from './routes/events.js';
import favoriteRoutes from './routes/favorites.js';
import { prisma } from './lib/prisma.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
}

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

const server = app.listen(port, () => {
  console.log(`GuiaPC API escuchando en http://localhost:${port}`);
});

function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
