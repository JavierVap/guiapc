import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const placeSchema = z.object({
  nombre: z.string().trim().min(2).max(150),
  categoria: z.string().trim().min(2).max(80),
  zona: z.string().trim().min(2).max(120),
  direccion: z.string().trim().min(3).max(255),
  horario: z.string().trim().max(255).optional(),
  hasDelivery: z.boolean().optional(),
  descripcion: z.string().trim().min(5).max(2000),
  descripcionLarga: z.string().trim().max(10000).optional(),
  image: z.union([
    z.url(),
    z.string().regex(/^\/images\/[a-z0-9._-]+$/i),
  ]).optional(),
  imageCredit: z.string().trim().max(191).optional(),
  imageSource: z.url().optional(),
  imageLicense: z.string().trim().max(80).optional(),
  imageLicenseUrl: z.url().optional(),
  whatsapp: z.string().trim().max(30).optional(),
  parkingInfo: z.string().trim().max(1000).optional(),
  accessibilityInfo: z.string().trim().max(1000).optional(),
  paymentMethods: z.string().trim().max(500).optional(),
  photos: z.array(z.url()).max(8).optional(),
});

const placeUpdateSchema = placeSchema.partial();

const moderationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

router.get('/', async (_req, res) => {
  const places = await prisma.place.findMany({
    where: { status: 'APPROVED' },
    include: {
      menu: true,
      reviews: {
        where: { status: 'APPROVED' },
        select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  const withRatings = places.map((place) => ({
    ...place,
    averageRating: place.reviews.length
      ? place.reviews.reduce((total, review) => total + review.rating, 0) / place.reviews.length
      : null,
    reviewCount: place.reviews.length,
  }));
  return res.json({ places: withRatings });
});

router.get('/mine', requireAuth, requireRole('COLLABORATOR', 'ADMIN'), async (req, res) => {
  const places = await prisma.place.findMany({
    where: req.user.role === 'ADMIN' ? {} : { createdById: req.user.id },
    include: { menu: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ places });
});

router.get('/pending', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  const places = await prisma.place.findMany({
    where: { status: 'PENDING' },
    include: {
      menu: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return res.json({ places });
});

router.get('/:id/reviews', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { placeId: req.params.id, status: 'APPROVED' },
    select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ reviews });
});

router.post('/:id/reviews', requireAuth, async (req, res) => {
  const parsed = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().min(10).max(1000),
  }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'La opinión debe incluir una calificación de 1 a 5 y entre 10 y 1000 caracteres.' });
  }

  const place = await prisma.place.findFirst({ where: { id: req.params.id, status: 'APPROVED' }, select: { id: true } });
  if (!place) return res.status(404).json({ error: 'No se encontró el lugar.' });

  try {
    const review = await prisma.review.create({
      data: { ...parsed.data, userId: req.user.id, placeId: place.id },
    });
    return res.status(201).json({ review });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Ya enviaste una opinión para este lugar.' });
    }
    throw error;
  }
});

router.post('/', requireAuth, requireRole('COLLABORATOR', 'ADMIN'), async (req, res) => {
  const parsed = placeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos del negocio inválidos.', details: parsed.error.issues });
  }

  const place = await prisma.place.create({
    data: { ...parsed.data, createdById: req.user.id, status: 'PENDING' },
  });
  return res.status(201).json({ place });
});

router.patch('/:id', requireAuth, requireRole('COLLABORATOR', 'ADMIN'), async (req, res) => {
  const parsed = placeUpdateSchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    return res.status(400).json({ error: 'Incluye al menos un campo válido para actualizar.' });
  }

  const existing = await prisma.place.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: 'No se encontró el negocio.' });
  }
  if (req.user.role !== 'ADMIN' && existing.createdById !== req.user.id) {
    return res.status(403).json({ error: 'Solo puedes editar los negocios que enviaste.' });
  }

  const place = await prisma.place.update({
    where: { id: existing.id },
    data: {
      ...parsed.data,
      ...(parsed.data.image && parsed.data.image !== existing.image && !parsed.data.imageSource
        ? { imageCredit: null, imageSource: null, imageLicense: null, imageLicenseUrl: null }
        : {}),
      ...(req.user.role === 'ADMIN' ? {} : { status: 'PENDING' }),
    },
  });
  return res.json({ place });
});

router.patch('/:id/moderation', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = moderationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'El estado debe ser APPROVED o REJECTED.' });
  }

  try {
    const place = await prisma.place.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    return res.json({ place });
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'No se encontró el negocio.' });
    }
    throw error;
  }
});

export default router;
