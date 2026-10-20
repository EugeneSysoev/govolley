import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { validate } from '../common/utils/validate.js';
import { StaffRolesService } from './staff-roles.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StaffRolesController {
  constructor(private readonly roles: StaffRolesService) {}

  @Get('role-candidates')
  candidates(@Query() query: unknown) {
    const { q } = validate(
      z.strictObject({ q: z.string().trim().max(100).default('') }),
      query,
    );
    return this.roles.candidates(q);
  }

  @Patch(':userId/role')
  changeRole(@Param('userId') id: string, @Body() body: unknown) {
    return this.roles.changeRole(
      validate(z.coerce.number().int().positive().max(2147483647), id),
      validate(z.strictObject({ role: z.enum(['USER', 'COACH']) }), body).role,
    );
  }
}
