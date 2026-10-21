import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { UpdateUserDto } from '../common/validators/user.schema.js';
import { evaluateLevel, type Booking } from '@govolley/shared-types';
import { AvatarStorage } from './avatar-storage.service.js';
import { publicProfile } from './public-profile.js';
import { bookingState } from '../training/booking-response.js';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatars: AvatarStorage,
  ) {}
  async updateProfile(
    userId: number,
    dto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const key = file ? await this.avatars.store(file) : undefined;
    let oldKey: string | null = null;
    let updated: User;
    try {
      updated = await this.prisma.$transaction(async (tx) => {
        const rows = await tx.$queryRaw<
          User[]
        >`SELECT * FROM "User" WHERE id = ${userId} FOR UPDATE`;
        if (!rows[0]) throw new NotFoundException('Пользователь не найден');
        oldKey = rows[0].avatarKey;
        return tx.user.update({
          where: { id: userId },
          data: {
            username: dto.username,
            firstName: dto.firstName,
            lastName: dto.lastName,
            ...(key ? { avatarKey: key, image: null } : {}),
          },
        });
      });
    } catch (error) {
      if (key) {
        // An ambiguous commit/network failure must never delete a referenced avatar.
        try {
          const referenced = await this.prisma.user.count({
            where: { avatarKey: key },
          });
          if (!referenced) await this.avatars.remove(key);
        } catch {
          this.logger.warn('Avatar cleanup deferred');
        }
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Это имя пользователя уже занято');
      }
      throw error;
    }
    if (key && oldKey) {
      try {
        await this.avatars.remove(oldKey);
      } catch {
        this.logger.warn('Old avatar cleanup deferred');
      }
    }
    return publicProfile(updated);
  }
  async completeOnboarding(userId: number, answers: number[]) {
    const skillLevel = evaluateLevel(answers);
    const result = await this.prisma.user.updateMany({
      where: { id: userId, skillLevel: 'NOT_SET', isLevelVerified: false },
      data: { skillLevel },
    });
    if (!result.count)
      throw new ConflictException(
        'Анкета уже завершена или уровень подтвержден',
      );
    return this.findOne(userId);
  }
  async getUserBookings(userId: number): Promise<Booking[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: { training: true },
      orderBy: { id: 'desc' },
    });
    return bookings.map((booking) => ({
      ...bookingState(booking),
      training: {
        id: booking.training.id,
        title: booking.training.title,
        date: booking.training.date.toISOString(),
        startTime: booking.training.startTime,
        endTime: booking.training.endTime,
        location: booking.training.location,
        isActive: booking.training.isActive,
      },
    }));
  }
  async verifyLevel(userId: number, isLevelVerified: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.skillLevel === 'NOT_SET')
      throw new ConflictException('Сначала завершите анкету');
    return publicProfile(
      await this.prisma.user.update({
        where: { id: userId },
        data: { isLevelVerified },
      }),
    );
  }
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return publicProfile(user);
  }
}
