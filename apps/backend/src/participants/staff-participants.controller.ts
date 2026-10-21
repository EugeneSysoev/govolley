import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Body,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ParticipantActionSchema } from '@govolley/shared-types';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TrainingManagerGuard } from '../auth/guards/training-manager.guard.js';
import { validate } from '../common/utils/validate.js';
import { StaffParticipantsService } from './staff-participants.service.js';
const id = z.coerce.number().int().positive().max(2147483647);
@Controller('training/:trainingId/participants')
@UseGuards(JwtAuthGuard, TrainingManagerGuard)
export class StaffParticipantsController {
  constructor(private readonly participants: StaffParticipantsService) {}
  @Get()
  list(@Param('trainingId') trainingId: string) {
    return this.participants.list(validate(id, trainingId));
  }
  @Patch(':bookingId')
  change(
    @Param('trainingId') trainingId: string,
    @Param('bookingId') bookingId: string,
    @Body() body: unknown,
    @Req() req: Request & { user: Express.User },
  ) {
    return this.participants.change(
      req.user.id,
      validate(id, trainingId),
      validate(id, bookingId),
      validate(ParticipantActionSchema, body),
    );
  }
}
