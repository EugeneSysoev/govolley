import {
  Controller,
  Patch,
  Body,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SkillLevel } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('complete-onboarding')
  async completeOnboarding(
    @Body() body: { userId: unknown; totalScore: number },
  ) {
    console.log('RECEIVED PATCH REQUEST:', body);

    const numericId = Number(body.userId);
    const score = Number(body.totalScore);

    if (isNaN(numericId)) {
      throw new BadRequestException('Некорректный ID пользователя');
    }

    try {
      let finalLevel: SkillLevel = SkillLevel.BEGINNER;

      if (score >= 16) {
        finalLevel = SkillLevel.ADVANCED;
      } else if (score >= 10) {
        finalLevel = SkillLevel.INTERMEDIATE;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: numericId },
        data: {
          skillLevel: finalLevel,
          isLevelVerified: false,
        },
      });

      return {
        success: true,
        message: 'Onboarding completed',
        level: updatedUser.skillLevel,
      };
    } catch (error: unknown) {
      console.error('Onboarding Error:', error);

      // БЕЗОПАСНАЯ ПРОВЕРКА ОШИБКИ (Удовлетворяет ESLint)
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new BadRequestException('Пользователь не найден');
      }

      throw new InternalServerErrorException(
        'Не удалось сохранить результаты теста',
      );
    }
  }
}
