import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { publicProfile } from './public-profile.js';

@Injectable()
export class StaffRolesService {
  constructor(private readonly prisma: PrismaService) {}

  candidates(query: string) {
    const id = /^\d+$/.test(query) ? Number(query) : undefined;
    return this.prisma.user.findMany({
      where:
        id !== undefined
          ? { id: Number.isSafeInteger(id) && id <= 2147483647 ? id : -1 }
          : {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                {
                  username: {
                    contains: query.replace(/^@/, ''),
                    mode: 'insensitive',
                  },
                },
              ],
            },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
      },
      take: 50,
      orderBy: { id: 'asc' },
    });
  }

  changeRole(userId: number, role: 'USER' | 'COACH') {
    return this.prisma.$transaction(async (tx) => {
      // A conditional update also protects administrators during concurrent changes.
      const result = await tx.user.updateMany({
        where: { id: userId, role: { in: ['USER', 'COACH'] } },
        data: { role },
      });
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Пользователь не найден');
      if (!result.count)
        throw new ConflictException('Роль администратора здесь не изменяется');
      return publicProfile(user);
    });
  }
}
