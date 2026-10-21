import type { Role } from '@prisma/client';
declare global {
  namespace Express {
    interface User {
      id: number;
      role: Role;
    }
  }
}
export {};
