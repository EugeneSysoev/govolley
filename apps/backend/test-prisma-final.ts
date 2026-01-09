import { Prisma, PrismaClient } from '@prisma/client';

async function test(): Promise<boolean> {
  console.log('=== Тест Prisma ===');

  const prisma = new PrismaClient({
    log: ['query', 'error'],
  });

  try {
    await prisma.$connect();
    console.log('✅ Prisma подключен');

    const training = await prisma.training.create({
      data: {
        title: 'Тест от Node ES Modules',
        date: new Date(),
        maxParticipants: 10,
        coachName: 'Тест Тренер',
        location: 'Тест Зал',
      },
    });

    console.log(`✅ Создана: ID=${training.id}, "${training.title}"`);

    const trainings = await prisma.training.findMany();
    console.log(`✅ Всего тренировок: ${trainings.length}`);

    for (const t of trainings) {
      console.log(`  - ${t.id}: "${t.title}"`);
    }

    return true;
  } catch (error: unknown) {
    console.error('❌ Ошибка Prisma:');

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Код:', error.code);
      console.error('Мета:', error.meta);
    } else if (error instanceof Error) {
      console.error('Сообщение:', error.message);
    } else {
      console.error('Неизвестная ошибка:', error);
    }

    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  try {
    const success = await test();

    if (success) {
      console.log('\n🎉 Prisma работает корректно!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Prisma не работает');
      process.exit(1);
    }
  } catch (error: unknown) {
    console.error('❌ Критическая ошибка:');

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

await main();
