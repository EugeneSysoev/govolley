import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TrainingManagerGuard } from '../auth/guards/training-manager.guard.js';
import { validate } from '../common/utils/validate.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, TrainingManagerGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}
  @Get()
  list(@Query() query: unknown) {
    const options = validate(
      z.strictObject({
        undelivered: z.enum(['true', 'false']).optional(),
        beforeId: z.coerce.number().int().positive().max(2147483647).optional(),
      }),
      query,
    );
    return this.notifications.list(
      options.undelivered === 'true',
      options.beforeId,
    );
  }
}
