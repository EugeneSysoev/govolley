import { Injectable } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });

    this.pool = pool;

    console.log('PrismaService создан с адаптером');
  }

  async onModuleInit() {
    try {
      console.log('PrismaService: подключаюсь к базе...');
      console.log('DATABASE_URL:', process.env.DATABASE_URL);

      await this.$connect();
      console.log('PrismaService: успешно подключен к базе данных');

      // Тестовый запрос
      try {
        const count = await this.training.count();
        console.log(`PrismaService: в базе ${count} тренировок`);
      } catch (queryError: unknown) {
        const error = queryError as Error;
        console.warn(
          'PrismaService: не удалось выполнить тестовый запрос:',
          error.message,
        );
      }
    } catch (error: unknown) {
      const err = error as Error & { code?: string };
      console.error('PrismaService: ошибка подключения:', err.message);
      console.error('Код ошибки:', err.code);
      throw err;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    console.log('PrismaService: отключен от базы');
  }
}
