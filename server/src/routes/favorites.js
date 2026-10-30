import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id, place: { status: 'APPROVED' } },
    select: { placeId: true },
  });
  return res.json({ favoriteIds: favorites.map((favorite) => favorite.placeId) });
});

router.put('/:placeId', async (req, res) => {
  const place = await prisma.place.findFirst({
    where: { id: req.params.placeId, status: 'APPROVED' },
    select: { id: true },
  });
  if (!place) return res.status(404).json({ error: 'No se encontró el lugar.' });

  await prisma.favorite.upsert({
    where: { userId_placeId: { userId: req.user.id, placeId: place.id } },
    create: { userId: req.user.id, placeId: place.id },
    update: {},
  });
  return res.status(204).end();
});

router.delete('/:placeId', async (req, res) => {
  await prisma.favorite.deleteMany({
    where: { userId: req.user.id, placeId: req.params.placeId },
  });
  return res.status(204).end();
});

export default router;
