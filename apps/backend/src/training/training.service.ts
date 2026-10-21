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
import { schoolTimeInstant } from '@govolley/shared-types';
import { TrainingClock } from './training-clock.js';
import { randomUUID } from 'node:crypto';
type WithBookings = StoredTraining & {
  bookings: Pick<Booking, 'id' | 'userId'>[];
};
const include = {
  bookings: {
    where: { status: 'CONFIRMED' },
    select: { id: true, userId: true },
  },
};
@Injectable()
export class TrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: TrainingClock,
  ) {}
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
  async createBooking(
    userId: number,
    trainingId: number,
    requestId: string = randomUUID(),
  ): Promise<Training> {
    return this.prisma.$transaction(async (tx) => {
      const training = await this.lockTraining(tx, trainingId);
      // All new actions lock Training -> User. The user lock also serializes
      // reuse of one request identity across different training rows.
      const learners = await tx.$queryRaw<{ skillLevel: string }[]>`
        SELECT "skillLevel" FROM "User" WHERE id = ${userId} FOR UPDATE`;
      const previous = await tx.booking.findUnique({
        where: { userId_requestId: { userId, requestId } },
      });
      if (previous) {
        if (previous.trainingId !== trainingId)
          throw new ConflictException(
            'Запрос уже использован для другой тренировки',
          );
        return this.readInTransaction(tx, trainingId, userId);
      }
      if (!training.isActive)
        throw new ConflictException('Тренировка отменена');
      const existing = await tx.booking.findFirst({
        where: { userId, trainingId, status: 'CONFIRMED' },
      });
      if (existing)
        throw new ConflictException('Вы уже записаны на эту тренировку');
      if (!existing) {
        if (
          schoolTimeInstant(training.date, training.startTime).getTime() <=
          this.clock.now()
        )
          throw new ConflictException('Тренировка уже началась');
        const level = learners[0]?.skillLevel;
        if (!level || level === 'NOT_SET' || level !== training.targetLevel)
          throw new ConflictException(
            'Запись доступна только на тренировку вашего уровня. Завершите анкету',
          );
        const count = await tx.booking.count({
          where: { trainingId, status: 'CONFIRMED' },
        });
        if (count >= training.maxParticipants)
          throw new ConflictException('Нет свободных мест');
        await tx.booking.create({
          data: {
            userId,
            trainingId,
            status: 'CONFIRMED',
            paymentType: 'CASH',
            kind: 'SINGLE_CASH',
            cashPrice: 500,
            requestId,
          },
        });
      }
      return this.readInTransaction(tx, trainingId, userId);
    });
  }
  async cancelBooking(
    userId: number,
    trainingId: number,
    bookingId: number,
  ): Promise<Training> {
    return this.prisma.$transaction(async (tx) => {
      const training = await this.lockTraining(tx, trainingId);
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId, trainingId },
      });
      if (!booking)
        throw new BadRequestException('Вы не записаны на эту тренировку');
      // Retried cancellations are idempotent.
      if (booking.status !== 'CANCELLED') {
        const now = this.clock.now();
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(now),
            cancellationTiming:
              schoolTimeInstant(training.date, training.startTime).getTime() -
                now >=
              3 * 60 * 60 * 1000
                ? 'TIMELY'
                : 'LATE',
          },
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
      bookingId:
        userId === undefined
          ? null
          : (t.bookings.find((booking) => booking.userId === userId)?.id ??
            null),
      price: t.price,
      coachName: t.coachName,
      location: t.location,
      isActive: t.isActive,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }
}
