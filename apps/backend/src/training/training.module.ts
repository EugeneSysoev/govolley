import { Module } from '@nestjs/common';
import { TrainingService } from './training.service.js';
import { TrainingController } from './training.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
