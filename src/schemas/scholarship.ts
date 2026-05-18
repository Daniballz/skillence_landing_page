import { z } from 'zod';

export const scholarshipApplySchema = z.object({
  fullName: z.string().min(2).max(120).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().max(40).trim().optional(),
  courseSlug: z.string().min(1).max(80),
  tierApplied: z.enum(['OFF_50', 'OFF_80', 'FULL_100']),
  motivation: z.string().min(20, 'Tell us at least a couple of sentences').max(4000),
});

export type ScholarshipApplyInput = z.infer<typeof scholarshipApplySchema>;
