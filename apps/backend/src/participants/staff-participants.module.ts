import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StaffParticipantsService } from './staff-participants.service.js';
import { StaffParticipantsController } from './staff-participants.controller.js';
import { TrainingClock } from '../training/training-clock.js';
@Module({
  imports: [PrismaModule],
  providers: [StaffParticipantsService, TrainingClock],
  controllers: [StaffParticipantsController],
})
export class StaffParticipantsModule {}
