import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.get('/enrollments', requireAuth, async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.sub },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ enrollments });
  } catch (err) {
    next(err);
  }
});

router.get('/scholarship-applications', requireAuth, async (req, res, next) => {
  try {
    const applications = await prisma.scholarshipApplication.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

export default router;
