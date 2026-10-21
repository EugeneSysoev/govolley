import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { bookingState } from '../training/booking-response.js';
import type { ParticipantAction } from '@govolley/shared-types';
import { TrainingClock } from '../training/training-clock.js';

const identity = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
} as const;
@Injectable()
export class StaffParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: TrainingClock,
  ) {}

  async change(
    actorId: number,
    trainingId: number,
    bookingId: number,
    action: ParticipantAction,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const trainings = await tx.$queryRaw<
        { id: number }[]
      >`SELECT id FROM "Training" WHERE id=${trainingId} FOR UPDATE`;
      if (!trainings.length)
        throw new NotFoundException('Тренировка не найдена');
      // Same Training -> User order as bookings; recheck revocable authority
      // inside the transaction before writing any staff record.
      const actors = await tx.$queryRaw<
        { role: string }[]
      >`SELECT role FROM "User" WHERE id=${actorId} FOR UPDATE`;
      if (!actors.length || !['COACH', 'ADMIN'].includes(actors[0].role))
        throw new ForbiddenException('Недостаточно прав');
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, trainingId },
      });
      if (!booking) throw new NotFoundException('Запись не найдена');
      const value = String(action.value);
      const previous = await tx.bookingAudit.findUnique({
        where: { actorId_requestId: { actorId, requestId: action.requestId } },
      });
      if (previous) {
        if (
          previous.bookingId !== bookingId ||
          previous.field !== action.field ||
          previous.newValue !== value ||
          previous.reason !== action.reason
        )
          throw new ConflictException('Идентификатор действия уже использован');
        return;
      }
      const oldValue =
        action.field === 'ATTENDANCE'
          ? booking.attendanceStatus
          : booking.cashReceived === null
            ? 'UNKNOWN'
            : String(booking.cashReceived);
      if (oldValue === value)
        throw new ConflictException('Такая отметка уже сохранена');
      await tx.booking.update({
        where: { id: bookingId },
        data:
          action.field === 'ATTENDANCE'
            ? { attendanceStatus: action.value }
            : { cashReceived: action.value },
      });
      await tx.bookingAudit.create({
        data: {
          bookingId,
          actorId,
          requestId: action.requestId,
          field: action.field,
          oldValue,
          newValue: value,
          reason: action.reason,
          createdAt: new Date(this.clock.now()),
        },
      });
    });
    return (await this.list(trainingId)).find(
      (booking) => booking.id === bookingId,
    );
  }

  async list(trainingId: number) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId },
      select: { id: true },
    });
    if (!training) throw new NotFoundException('Тренировка не найдена');
    const bookings = await this.prisma.booking.findMany({
      where: { trainingId },
      orderBy: { id: 'asc' },
      include: {
        user: { select: { ...identity, skillLevel: true } },
        auditEntries: {
          orderBy: { id: 'asc' },
          include: { actor: { select: identity } },
        },
      },
    });
    return bookings.map((booking) => ({
      ...bookingState(booking),
      user: booking.user,
      history: booking.auditEntries.map((entry) => ({
        id: entry.id,
        actor: entry.actor,
        field: entry.field,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        reason: entry.reason,
        createdAt: entry.createdAt.toISOString(),
      })),
    }));
  }
}
