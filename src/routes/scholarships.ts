import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { attachUser } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { scholarshipApplySchema } from '../schemas/scholarship';

const router = Router();

router.post('/apply', attachUser, validate(scholarshipApplySchema), async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { slug: req.body.courseSlug } });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }
    const application = await prisma.scholarshipApplication.create({
      data: {
        userId: req.user?.sub ?? null,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        courseSlug: req.body.courseSlug,
        tierApplied: req.body.tierApplied,
        motivation: req.body.motivation,
      },
      select: { id: true, status: true, createdAt: true },
    });
    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
});

export default router;
