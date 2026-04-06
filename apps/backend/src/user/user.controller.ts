import {
  Controller,
  Patch,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { validate } from '../common/utils/validate.js';
import {
  UpdateUserSchema,
  CompleteOnboardingSchema,
  VerifyLevelSchema,
} from '../common/validators/user.schema.js';

import type { Request } from 'express';
import 'multer';

interface RequestWithUser extends Request {
  user: {
    id: string;
    role?: string;
  };
}

/**
 * Контроллер для управления пользователями и профилями
 * @requires JwtAuthGuard для защиты маршрутов
 */

/**
 * Обновляет профиль пользователя с загрузкой изображения
 * @param req - запрос с данными пользователя
 * @param body - данные профиля
 * @param file - загруженное изображение (опционально)
 * @returns обновленный профиль пользователя
 * @throws UnauthorizedException если пользователь не авторизован
 */

/**
 * Завершает онбординг пользователя
 * @param req - запрос с данными пользователя
 * @param body - данные с результатом теста
 * @returns результат завершения онбординга
 */

/**
 * Получает список бронирований пользователя
 * @param req - запрос с данными пользователя
 * @returns массив бронирований
 */

/**
 * Проверяет и верифицирует уровень игрока
 * @param req - запрос с данными тренера/админа
 * @param targetUserId - ID пользователя для проверки
 * @param body - решение о верификации
 * @returns результат верификации уровня
 * @throws UnauthorizedException если роль не COACH или ADMIN
 */

/**
 * Получает профиль текущего пользователя
 * @param req - запрос с данными пользователя
 * @returns данные профиля пользователя
 * @throws NotFoundException если пользователь не найден
 */
/**
 * Контроллер для управления пользователями
 * @class UsersController
 */

/**
 * Обновляет профиль пользователя с загрузкой изображения
 * @param req - Request с данными авторизованного пользователя
 * @param body - Данные для обновления профиля
 * @param file - Загруженный файл изображения (опционально)
 * @returns Обновленные данные профиля
 */

/**
 * Завершает онбординг пользователя
 * @param req - Request с данными авторизованного пользователя
 * @param body - Данные онбординга с итоговым счетом
 * @returns Результат завершения онбординга
 */

/**
 * Получает все бронирования пользователя
 * @param req - Request с данными авторизованного пользователя
 * @returns Список бронирований пользователя
 */

/**
 * Проверяет уровень мастерства пользователя (только для тренеров и администраторов)
 * @param req - Request с данными авторизованного пользователя
 * @param targetUserId - ID пользователя для проверки
 * @param body - Данные с результатом проверки
 * @throws UnauthorizedException Если пользователь не имеет необходимых прав
 * @returns Результат проверки уровня
 */

/**
 * Получает профиль авторизованного пользователя
 * @param req - Request с данными авторизованного пользователя
 * @returns Данные профиля пользователя
 * @throws NotFoundException Если пользователь не найден
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() body: unknown,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const userId = Number(req.user.id);

    const data = validate(UpdateUserSchema, body);

    return this.usersService.updateProfile(userId, data, file);
  }

  @Patch('complete-onboarding')
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(@Req() req: RequestWithUser, @Body() body: unknown) {
    const userId = Number(req.user.id);

    const data = validate(CompleteOnboardingSchema, body);

    return this.usersService.completeOnboarding(userId, data.totalScore);
  }

  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  async getUserBookings(@Req() req: RequestWithUser) {
    return this.usersService.getUserBookings(Number(req.user.id));
  }

  @Patch('verify-level/:userId')
  @UseGuards(JwtAuthGuard)
  async verifyUserLevel(
    @Req() req: RequestWithUser,
    @Param('userId') targetUserId: string,
    @Body() body: unknown,
  ) {
    if (req.user.role !== 'COACH' && req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Недостаточно прав');
    }

    const data = validate(VerifyLevelSchema, body);

    return this.usersService.verifyLevel(
      Number(targetUserId),
      data.isLevelVerified,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: RequestWithUser) {
    const user = await this.usersService.findOne(Number(req.user.id));

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      image: user.image,
      role: user.role,
      balance: user.balance,
      skillLevel: user.skillLevel,
      isLevelVerified: user.isLevelVerified,
      createdAt: user.createdAt,
    };
  }
}
