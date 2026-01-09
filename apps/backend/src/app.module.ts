import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TrainingModule } from './training/training.module.js';

@Module({
  imports: [PrismaModule, TrainingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
