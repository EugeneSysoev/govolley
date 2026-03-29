import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, SkillLevel } from '@prisma/client';
import type { Training } from '@prisma/client';
import type { CreateTrainingDto } from './dto/create-training.dto.js';
import type { UpdateTrainingDto } from './dto/update-training.dto.js';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTrainingDto): Promise<Training> {
    if (!dto) throw new Error('DTO is missing');

    const data: Prisma.TrainingCreateInput = {
      title: dto.title,
      description: dto.description ?? null,
      date: new Date(dto.date),
      maxParticipants: dto.maxParticipants ?? 0,
      price: dto.price ?? null,
      coachName: dto.coachName ?? null,
      location: dto.location ?? null,
      currentParticipants: 0,
      isActive: true,
      startTime: dto.startTime,
      endTime: dto.endTime,
      targetLevel: dto.targetLevel as SkillLevel,
    };

    const result = await this.prisma.training.create({ data });
    return result;
  }

  async update(id: number, dto: UpdateTrainingDto): Promise<Training> {
    await this.findOne(id);

    const data: Prisma.TrainingUpdateInput = {
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
      targetLevel: dto.targetLevel as SkillLevel,
    };

    const result = await this.prisma.training.update({
      where: { id },
      data,
    });

    return result;
  }

  async findAll(): Promise<Training[]> {
    return this.prisma.training.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number): Promise<Training> {
    const training = await this.prisma.training.findUnique({ where: { id } });
    if (!training) throw new NotFoundException(`Training ${id} not found`);
    return training;
  }

  async remove(id: number): Promise<Training> {
    await this.findOne(id);
    return this.prisma.training.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
