import type { ZodSchema } from 'zod';
import { BadRequestException } from '@nestjs/common';
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success)
    throw new BadRequestException({
      message: 'Некорректные данные',
      errors: result.error.issues.map(({ path, message }) => ({
        path,
        message,
      })),
    });
  return result.data;
}
