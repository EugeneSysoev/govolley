import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
@Injectable()
export class TrainingManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<Request>();
    if (user?.role !== 'COACH' && user?.role !== 'ADMIN')
      throw new ForbiddenException('Недостаточно прав');
    return true;
  }
}
