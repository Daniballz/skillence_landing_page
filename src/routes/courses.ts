import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { enrollSchema } from '../schemas/contact';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ courses });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const slug = String(req.params.slug);
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }
    res.json({ course });
  } catch (err) {
    next(err);
  }
});

router.post('/:slug/enroll', requireAuth, validate(enrollSchema), async (req, res, next) => {
  try {
    const slug = String(req.params.slug);
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }
    if (course.status !== 'ACTIVE') {
      res.status(409).json({ error: 'This course is not open for enrollment yet' });
      return;
    }
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.sub, courseId: course.id } },
    });
    if (existing) {
      res.status(409).json({ error: 'You are already enrolled in this course' });
      return;
    }
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user!.sub,
        courseId: course.id,
        scholarshipTier: req.body.scholarshipTier ?? 'NONE',
      },
      include: { course: true },
    });
    res.status(201).json({ enrollment });
  } catch (err) {
    next(err);
  }
});

export default router;
