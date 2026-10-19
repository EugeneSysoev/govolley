import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  Prisma,
  Training as StoredTraining,
  Booking,
} from '@prisma/client';
import type {
  Training,
  CreateTrainingDto,
  UpdateTrainingDto,
} from '@govolley/shared-types';
type WithBookings = StoredTraining & { bookings: Pick<Booking, 'userId'>[] };
const include = {
  bookings: { where: { status: 'CONFIRMED' }, select: { userId: true } },
};
@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateTrainingDto): Promise<Training> {
    const training = await this.prisma.training.create({
      data: { ...dto, date: new Date(dto.date) },
      include,
    });
    return this.response(training);
  }
  async findAll(userId?: number): Promise<Training[]> {
    const list = await this.prisma.training.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' },
      include,
    });
    return list.map((training) => this.response(training, userId));
  }
  async findOne(id: number, userId?: number): Promise<Training> {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include,
    });
    if (!training) throw new NotFoundException('Тренировка не найдена');
    return this.response(training, userId);
  }
  async update(
    id: number,
    dto: UpdateTrainingDto,
    userId?: number,
  ): Promise<Training> {
    return this.prisma.$transaction(async (tx) => {
      const current = await this.lockTraining(tx, id);
      if (
        (dto.endTime ?? current.endTime) <= (dto.startTime ?? current.startTime)
      ) {
        throw new BadRequestException('Окончание должно быть позже начала');
      }
      if (dto.maxParticipants !== undefined) {
        const count = await tx.booking.count({
          where: { trainingId: id, status: 'CONFIRMED' },
        });
        if (dto.maxParticipants < count)
          throw new ConflictException('Лимит меньше числа существующих броней');
      }
      const training = await tx.training.update({
        where: { id },
        data: {
          ...dto,
          date: dto.date === undefined ? undefined : new Date(dto.date),
        },
        include,
      });
      return this.response(training, userId);
    });
  }
  async remove(id: number, userId?: number): Promise<Training> {
    // Existing bookings remain visible and cancellable after soft deletion.
    return this.update(id, { isActive: false }, userId);
  }
  async createBooking(userId: number, trainingId: number): Promise<Training> {
    return this.prisma.$transaction(async (tx) => {
      const training = await this.lockTraining(tx, trainingId);
      if (!training.isActive)
        throw new ConflictException('Тренировка отменена');
      const existing = await tx.booking.findUnique({
        where: { userId_trainingId: { userId, trainingId } },
      });
      if (existing?.status !== 'CONFIRMED') {
        const count = await tx.booking.count({
          where: { trainingId, status: 'CONFIRMED' },
        });
        if (count >= training.maxParticipants)
          throw new ConflictException('Нет свободных мест');
        await tx.booking.upsert({
          where: { userId_trainingId: { userId, trainingId } },
          update: { status: 'CONFIRMED' },
          create: {
            userId,
            trainingId,
            status: 'CONFIRMED',
            paymentType: 'BALANCE',
          },
        });
      }
      return this.readInTransaction(tx, trainingId, userId);
    });
  }
  async cancelBooking(userId: number, trainingId: number): Promise<Training> {
    return this.prisma.$transaction(async (tx) => {
      await this.lockTraining(tx, trainingId);
      const booking = await tx.booking.findUnique({
        where: { userId_trainingId: { userId, trainingId } },
      });
      if (!booking)
        throw new BadRequestException('Вы не записаны на эту тренировку');
      // Retried cancellations are idempotent.
      if (booking.status !== 'CANCELLED') {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });
      }
      return this.readInTransaction(tx, trainingId, userId);
    });
  }
  private async lockTraining(
    tx: Prisma.TransactionClient,
    id: number,
  ): Promise<StoredTraining> {
    // Every capacity/status/booking writer takes this same row lock before reading.
    const rows = await tx.$queryRaw<
      StoredTraining[]
    >`SELECT * FROM "Training" WHERE id = ${id} FOR UPDATE`;
    if (!rows[0]) throw new NotFoundException('Тренировка не найдена');
    return rows[0];
  }
  private async readInTransaction(
    tx: Prisma.TransactionClient,
    id: number,
    userId: number,
  ): Promise<Training> {
    const training = await tx.training.findUniqueOrThrow({
      where: { id },
      include,
    });
    return this.response(training, userId);
  }
  private response(t: WithBookings, userId?: number): Training {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      date: t.date.toISOString(),
      startTime: t.startTime,
      endTime: t.endTime,
      targetLevel: t.targetLevel,
      maxParticipants: t.maxParticipants,
      currentParticipants: t.bookings.length,
      isBooked:
        userId !== undefined &&
        t.bookings.some((booking) => booking.userId === userId),
      price: t.price,
      coachName: t.coachName,
      location: t.location,
      isActive: t.isActive,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }
}
