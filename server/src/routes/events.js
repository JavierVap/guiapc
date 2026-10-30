import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const eventSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(3000),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime().optional(),
  venue: z.string().trim().min(2).max(150),
  address: z.string().trim().min(3).max(255),
  priceInfo: z.string().trim().max(191).optional(),
  image: z.url().optional(),
});

router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({
    where: { status: 'APPROVED', startsAt: { gte: new Date() } },
    orderBy: [{ isFeatured: 'desc' }, { startsAt: 'asc' }],
  });
  return res.json({ events });
});

router.get('/mine', requireAuth, requireRole('COLLABORATOR', 'ADMIN'), async (req, res) => {
  const events = await prisma.event.findMany({
    where: req.user.role === 'ADMIN' ? {} : { createdById: req.user.id },
    orderBy: { startsAt: 'asc' },
  });
  return res.json({ events });
});

router.get('/pending', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  const events = await prisma.event.findMany({
    where: { status: 'PENDING' },
    include: { createdBy: { select: { name: true, email: true } } },
    orderBy: { startsAt: 'asc' },
  });
  return res.json({ events });
});

router.post('/', requireAuth, requireRole('COLLABORATOR', 'ADMIN'), async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Revisa los datos del evento.', details: parsed.error.issues });
  if (parsed.data.endsAt && new Date(parsed.data.endsAt) < new Date(parsed.data.startsAt)) {
    return res.status(400).json({ error: 'La fecha de cierre debe ser posterior al inicio.' });
  }

  const event = await prisma.event.create({
    data: { ...parsed.data, startsAt: new Date(parsed.data.startsAt), endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null, createdById: req.user.id },
  });
  return res.status(201).json({ event });
});

router.patch('/:id', requireAuth, requireRole('COLLABORATOR', 'ADMIN'), async (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success || !Object.keys(parsed.data ?? {}).length) return res.status(400).json({ error: 'Incluye campos válidos para editar el evento.' });

  const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'No se encontró el evento.' });
  if (req.user.role !== 'ADMIN' && existing.createdById !== req.user.id) return res.status(403).json({ error: 'No puedes editar este evento.' });

  const startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : existing.startsAt;
  const endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : existing.endsAt;
  if (endsAt && endsAt < startsAt) return res.status(400).json({ error: 'La fecha de cierre debe ser posterior al inicio.' });

  const event = await prisma.event.update({
    where: { id: existing.id },
    data: { ...parsed.data, ...(parsed.data.startsAt ? { startsAt } : {}), ...(parsed.data.endsAt ? { endsAt } : {}), ...(req.user.role === 'ADMIN' ? {} : { status: 'PENDING', isFeatured: false }) },
  });
  return res.json({ event });
});

router.patch('/:id/moderation', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = z.object({ status: z.enum(['APPROVED', 'REJECTED']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Estado de revisión inválido.' });
  try {
    const event = await prisma.event.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
    return res.json({ event });
  } catch (error) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'No se encontró el evento.' });
    throw error;
  }
});

router.patch('/:id/featured', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = z.object({ isFeatured: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'El valor destacado debe ser verdadero o falso.' });
  const existing = await prisma.event.findUnique({ where: { id: req.params.id }, select: { status: true } });
  if (!existing) return res.status(404).json({ error: 'No se encontró el evento.' });
  if (existing.status !== 'APPROVED') return res.status(409).json({ error: 'Solo se pueden destacar eventos aprobados.' });
  try {
    const event = await prisma.event.update({ where: { id: req.params.id }, data: parsed.data });
    return res.json({ event });
  } catch (error) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'No se encontró el evento.' });
    throw error;
  }
});

export default router;
