import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const roleSchema = z.object({
  role: z.enum(['CLIENT', 'COLLABORATOR']),
});

router.get('/users', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ users });
});

router.get('/reviews/pending', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  const reviews = await prisma.review.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { name: true, email: true } },
      place: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return res.json({ reviews });
});

router.patch('/reviews/:id/moderation', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = z.object({ status: z.enum(['APPROVED', 'REJECTED']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Estado de revisión inválido.' });
  try {
    const review = await prisma.review.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
    return res.json({ review });
  } catch (error) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'No se encontró la opinión.' });
    throw error;
  }
});

router.patch('/places/:id/featured', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = z.object({ isFeatured: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'El valor destacado debe ser verdadero o falso.' });
  const existing = await prisma.place.findUnique({ where: { id: req.params.id }, select: { status: true } });
  if (!existing) return res.status(404).json({ error: 'No se encontró el lugar.' });
  if (existing.status !== 'APPROVED') return res.status(409).json({ error: 'Solo se pueden destacar lugares aprobados.' });
  try {
    const place = await prisma.place.update({
      where: { id: req.params.id },
      data: { isFeatured: parsed.data.isFeatured },
    });
    return res.json({ place });
  } catch (error) {
    if (error?.code === 'P2025') return res.status(404).json({ error: 'No se encontró el lugar.' });
    throw error;
  }
});

router.patch('/users/:id/role', requireAuth, requireRole('ADMIN'), async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'No puedes cambiar tu propio rol.' });
  }

  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'El rol debe ser CLIENT o COLLABORATOR.' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.json({ user });
  } catch (error) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'No se encontró el usuario.' });
    }
    throw error;
  }
});

export default router;
