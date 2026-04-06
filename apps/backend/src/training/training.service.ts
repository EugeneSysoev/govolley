import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Training, Booking } from '@prisma/client';
import type {
  CreateTrainingDto,
  UpdateTrainingDto,
} from '../common/validators/training.schema.js';

/** Training с подтвержденными бронями (только userId) */
type TrainingWithBookings = Training & {
  bookings: Pick<Booking, 'userId'>[];
};

/** Ответ API: Training + вычисляемые поля */
type TrainingWithMeta = Omit<Training, 'bookings'> & {
  currentParticipants: number;
  isBooked: boolean;
};

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTrainingDto): Promise<Training> {
    return this.prisma.training.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        date: new Date(dto.date),
        maxParticipants: dto.maxParticipants,
        price: dto.price ?? null,
        coachName: dto.coachName ?? null,
        location: dto.location ?? null,
        isActive: true,
        startTime: dto.startTime,
        endTime: dto.endTime,
        targetLevel: dto.targetLevel,
      },
    });
  }

  async update(id: number, dto: UpdateTrainingDto): Promise<Training> {
    await this.ensureExists(id);
    return this.prisma.training.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        coachName: dto.coachName,
        price: dto.price,
        maxParticipants: dto.maxParticipants,
        isActive: dto.isActive,
        date: dto.date ? new Date(dto.date) : undefined,
        startTime: dto.startTime,
        endTime: dto.endTime,
        targetLevel: dto.targetLevel,
      },
    });
  }

  async findAll(userId?: number): Promise<TrainingWithMeta[]> {
    const trainings = await this.prisma.training.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { userId: true },
        },
      },
    });
    return trainings.map((t) => this.transformTraining(t, userId));
  }

  async findOne(id: number, userId?: number): Promise<TrainingWithMeta> {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { userId: true },
        },
      },
    });
    if (!training) {
      throw new NotFoundException(`Training ${id} not found`);
    }
    return this.transformTraining(training, userId);
  }

  /** Мягкое удаление */
  async remove(id: number): Promise<Training> {
    await this.ensureExists(id);
    return this.prisma.training.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createBooking(
    userId: number,
    trainingId: number,
  ): Promise<TrainingWithMeta> {
    const training = await this.ensureExists(trainingId);

    // Проверка доступности мест на уровне БД
    const confirmedCount = await this.prisma.booking.count({
      where: { trainingId, status: 'CONFIRMED' },
    });
    if (confirmedCount >= training.maxParticipants) {
      throw new BadRequestException('Нет свободных мест');
    }

    const existing = await this.prisma.booking.findUnique({
      where: { userId_trainingId: { userId, trainingId } },
    });

    // Если уже записан – возвращаем текущее состояние
    if (existing?.status === 'CONFIRMED') {
      return this.findOne(trainingId, userId);
    }

    // Создание или восстановление записи
    await this.prisma.$transaction(async (tx) => {
      if (existing?.status === 'CANCELLED') {
        await tx.booking.update({
          where: { id: existing.id },
          data: { status: 'CONFIRMED' },
        });
      } else {
        await tx.booking.create({
          data: {
            userId,
            trainingId,
            status: 'CONFIRMED',
            paymentType: 'BALANCE',
          },
        });
      }
    });

    return this.findOne(trainingId, userId);
  }

  async cancelBooking(
    userId: number,
    trainingId: number,
  ): Promise<TrainingWithMeta> {
    const booking = await this.prisma.booking.findUnique({
      where: { userId_trainingId: { userId, trainingId } },
    });
    if (!booking) {
      throw new BadRequestException('Вы не записаны на эту тренировку');
    }
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Запись уже отменена');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
      });
    });

    return this.findOne(trainingId, userId);
  }

  private async ensureExists(id: number): Promise<Training> {
    const training = await this.prisma.training.findUnique({
      where: { id },
    });
    if (!training) {
      throw new NotFoundException(`Training ${id} not found`);
    }
    return training;
  }

  private transformTraining(
    training: TrainingWithBookings,
    userId?: number,
  ): TrainingWithMeta {
    const confirmedBookings = training.bookings ?? [];
    const currentParticipants = confirmedBookings.length;
    const isBooked =
      userId !== undefined &&
      confirmedBookings.some((b) => b.userId === userId);

    // Исключаем bookings из ответа
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bookings, ...rest } = training;

    return {
      ...rest,
      currentParticipants,
      isBooked,
    };
  }
}
