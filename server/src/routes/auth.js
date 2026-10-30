import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.email().transform((email) => email.trim().toLowerCase()),
  password: z.string().min(1).max(72),
});

function createToken(user) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: '8h',
  });
}

router.post('/register', async (req, res) => {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos de registro inválidos.', details: parsed.error.issues });
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json({ token: createToken(user), user });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }
    throw error;
  }
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Correo o contraseña inválidos.' });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }

  const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  return res.json({ token: createToken(user), user: publicUser });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
