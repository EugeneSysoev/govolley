import { Module } from '@nestjs/common';
import { TrainingService } from './training.service.js';
import { TrainingController } from './training.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TrainingClock } from './training-clock.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [TrainingController],
  providers: [TrainingService, TrainingClock],
})
export class TrainingModule {}
