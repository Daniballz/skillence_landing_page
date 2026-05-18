import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  email: z.string().email().toLowerCase().trim(),
  subject: z.string().max(200).trim().optional(),
  message: z.string().min(5).max(4000).trim(),
});

export const newsletterSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const enrollSchema = z.object({
  scholarshipTier: z.enum(['NONE', 'OFF_50', 'OFF_80', 'FULL_100']).optional(),
});
