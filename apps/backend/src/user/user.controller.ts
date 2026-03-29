import {
  Controller,
  Patch,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SkillLevel } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Сохранение результатов теста и присвоение уровня
   */
  @Patch('complete-onboarding')
  async completeOnboarding(
    @Body() body: { userId: number; totalScore: number },
  ) {
    console.log('RECEIVED PATCH REQUEST:', body);
    try {
      let finalLevel: SkillLevel = SkillLevel.BEGINNER;

      // Логика баллов согласно твоему плану:
      // 5-9: BEGINNER, 10-15: INTERMEDIATE, 16-20: ADVANCED
      if (body.totalScore >= 16) {
        finalLevel = SkillLevel.ADVANCED;
      } else if (body.totalScore >= 10) {
        finalLevel = SkillLevel.INTERMEDIATE;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: body.userId },
        data: {
          skillLevel: finalLevel,
          isLevelVerified: false, // Всегда false до проверки тренером
        },
      });

      return {
        message: 'Onboarding completed',
        level: updatedUser.skillLevel,
      };
    } catch (error) {
      console.error('Onboarding Error:', error);
      throw new InternalServerErrorException(
        'Не удалось сохранить результаты теста',
      );
    }
  }
}
