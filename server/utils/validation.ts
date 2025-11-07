import { z } from 'zod';
import { ValidationError } from './errors';

export const AnalysisRequestSchema = z.object({
  github: z.string().regex(/^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/).optional(),
  website: z.string().url().optional(),
}).refine(data => data.github || data.website, {
  message: 'Either github or website must be provided',
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100).optional(),
});

export const UpdateLeadSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATING', 'WON', 'LOST', 'ARCHIVED']).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new ValidationError(messages.join(', '));
    }
    throw error;
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeUrl(url: string): string {
  // Remove protocol if present
  let clean = url.replace(/^(https?:\/\/)?(www\.)?/, '');
  // Remove trailing slash
  clean = clean.replace(/\/$/, '');
  return clean;
}

export function isValidGitHubRepo(repo: string): boolean {
  const pattern = /^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+$/;
  return pattern.test(repo);
}
