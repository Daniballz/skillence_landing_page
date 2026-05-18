import { Router } from 'express';
import { prisma } from '../lib/prisma';
import {
  clearAuthCookie,
  hashPassword,
  setAuthCookie,
  signToken,
  verifyPassword,
} from '../lib/auth';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/requireAuth';
import { loginSchema, registerSchema } from '../schemas/auth';

const router = Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) {
      clearAuthCookie(res);
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
