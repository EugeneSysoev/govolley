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
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { TrainingService } from './training.service.js';
import type {
  CreateTrainingDto,
  UpdateTrainingDto,
} from '../common/validators/training.schema.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

/** Тип пользователя из JWT токена */
type JwtUser = {
  id: string;
  role?: string;
};

/** Извлечение ID пользователя из запроса */
function getUserId(req: Request): number | undefined {
  const user = req.user as JwtUser | undefined;
  return user ? Number(user.id) : undefined;
}

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  /** Создание тренировки */
  @Post()
  create(@Body() dto: CreateTrainingDto) {
    return this.trainingService.create(dto);
  }

  /** Получение всех тренировок (опциональная авторизация) */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Req() req: Request) {
    return this.trainingService.findAll(getUserId(req));
  }

  /** Получение одной тренировки (опциональная авторизация) */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.trainingService.findOne(id, getUserId(req));
  }

  /** Обновление тренировки */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrainingDto,
  ) {
    return this.trainingService.update(id, dto);
  }

  /** Удаление тренировки (мягкое удаление) */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trainingService.remove(id);
  }

  /** Бронирование тренировки (требуется авторизация) */
  @Post('book')
  @UseGuards(JwtAuthGuard)
  createBooking(@Req() req: Request, @Body() body: { trainingId: number }) {
    const userId = getUserId(req);
    return this.trainingService.createBooking(userId!, body.trainingId);
  }

  /** Отмена бронирования (требуется авторизация) */
  @Post('unbook')
  @UseGuards(JwtAuthGuard)
  cancelBooking(@Req() req: Request, @Body() body: { trainingId: number }) {
    const userId = getUserId(req);
    return this.trainingService.cancelBooking(userId!, body.trainingId);
  }
}
