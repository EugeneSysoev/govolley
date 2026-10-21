import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { TrainingService } from './training.service.js';
import {
  CreateTrainingSchema,
  UpdateTrainingSchema,
} from '../common/validators/training.schema.js';
import { validate } from '../common/utils/validate.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { TrainingManagerGuard } from '../auth/guards/training-manager.guard.js';
const idSchema = z.coerce
  .number()
  .int()
  .positive()
  .max(Number.MAX_SAFE_INTEGER);
const bookingSchema = z.strictObject({
  trainingId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  requestId: z.uuid(),
});
const cancellationSchema = z.strictObject({
  trainingId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  bookingId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
});
function userId(req: Request): number {
  if (!req.user) throw new UnauthorizedException();
  return req.user.id;
}
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}
  @Post()
  @UseGuards(JwtAuthGuard, TrainingManagerGuard)
  create(@Body() body: unknown) {
    return this.trainingService.create(validate(CreateTrainingSchema, body));
  }
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Req() req: Request) {
    return this.trainingService.findAll(req.user?.id);
  }
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.trainingService.findOne(validate(idSchema, id), req.user?.id);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, TrainingManagerGuard)
  update(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    return this.trainingService.update(
      validate(idSchema, id),
      validate(UpdateTrainingSchema, body),
      userId(req),
    );
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, TrainingManagerGuard)
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.trainingService.remove(validate(idSchema, id), userId(req));
  }
  @Post('book')
  @UseGuards(JwtAuthGuard)
  createBooking(@Req() req: Request, @Body() body: unknown) {
    const booking = validate(bookingSchema, body);
    return this.trainingService.createBooking(
      userId(req),
      booking.trainingId,
      booking.requestId,
    );
  }
  @Post('unbook')
  @UseGuards(JwtAuthGuard)
  cancelBooking(@Req() req: Request, @Body() body: unknown) {
    const cancellation = validate(cancellationSchema, body);
    return this.trainingService.cancelBooking(
      userId(req),
      cancellation.trainingId,
      cancellation.bookingId,
    );
  }
}
