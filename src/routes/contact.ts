import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import { contactSchema, newsletterSchema } from '../schemas/contact';

const router = Router();

router.post('/contact', validate(contactSchema), async (req, res, next) => {
  try {
    const message = await prisma.contactMessage.create({
      data: req.body,
      select: { id: true, createdAt: true },
    });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
});

router.post('/newsletter', validate(newsletterSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: {},
      select: { id: true, email: true, createdAt: true },
    });
    res.status(201).json({ subscriber });
  } catch (err) {
    next(err);
  }
});

export default router;
