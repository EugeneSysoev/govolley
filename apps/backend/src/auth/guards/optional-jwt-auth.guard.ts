import { Injectable } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

type JwtUser = {
  id: string;
  role?: string;
};

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = JwtUser | null>(
    err: unknown,
    user: JwtUser | false | null,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err) {
      throw new Error('Unauthorized');
    }
    void _info;
    void _context;
    void _status;

    return (user || null) as TUser;
  }
}
