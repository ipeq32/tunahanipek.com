import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    passwordConfirm: z.string().min(6),
    name: z.string().min(3),
    phone: z.string().min(10),
    address: z.string().min(10),
    website: z.string().url().optional().or(z.literal('')),
    image: z.string().url().optional().or(z.literal('')),
    bio: z.string().min(10).optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
