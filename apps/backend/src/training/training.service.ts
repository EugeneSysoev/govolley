import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
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
    };

    const result = await this.prisma.training.create({ data });
    return result as unknown as Training;
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
    };

    const result = await this.prisma.training.update({
      where: { id },
      data,
    });

    return result as unknown as Training;
  }

  async findAll(): Promise<Training[]> {
    const results = await this.prisma.training.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' },
    });
    return results as unknown as Training[];
  }

  async findOne(id: number): Promise<Training> {
    const training = await this.prisma.training.findUnique({ where: { id } });
    if (!training) throw new NotFoundException(`Training ${id} not found`);
    return training as unknown as Training;
  }

  async remove(id: number): Promise<Training> {
    await this.findOne(id);
    const result = await this.prisma.training.update({
      where: { id },
      data: { isActive: false },
    });
    return result as unknown as Training;
  }
}
