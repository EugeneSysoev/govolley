import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard.js';
@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.headers.authorization) return true;
    return super.canActivate(context);
  }
}
