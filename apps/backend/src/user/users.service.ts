import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateUserDto } from '../common/validators/user.schema.js';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import { SkillLevel } from '@prisma/client';
import 'multer';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(
    userId: number,
    dto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    // Получение текущего пользователя
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Сохранение существующего изображения по умолчанию
    let imagePath = currentUser.image;

    if (dto.image !== undefined) {
      imagePath = dto.image;
    }

    if (file) {
      const uploadDir = join(process.cwd(), 'public', 'uploads');

      // Удаление старого изображения при загрузке нового
      if (currentUser.image?.startsWith('/uploads/')) {
        const oldFilePath = join(process.cwd(), 'public', currentUser.image);
        await fs.unlink(oldFilePath).catch(() => {});
      }

      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Генерация уникального имени файла
      const fileExt = file.originalname.split('.').pop();
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
      const fullPath = join(uploadDir, fileName);

      await fs.writeFile(fullPath, file.buffer);

      imagePath = `/uploads/${fileName}`;
    }

    // Обновление профиля пользователя
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        skillLevel: dto.skillLevel,
        image: imagePath,
      },
    });
  }

  // Завершение онбординга с определением уровня навыков
  async completeOnboarding(userId: number, totalScore: number) {
    let skillLevel: SkillLevel = SkillLevel.BEGINNER;

    if (totalScore >= 25) {
      skillLevel = SkillLevel.ADVANCED;
    } else if (totalScore >= 15) {
      skillLevel = SkillLevel.INTERMEDIATE;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { skillLevel },
    });
  }

  // Получение всех бронирований пользователя
  async getUserBookings(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: { training: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Обновление статуса верификации уровня
  async verifyLevel(userId: number, isVerified: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isLevelVerified: isVerified },
    });
  }

  // Поиск пользователя по ID
  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
