import { Prisma, PrismaClient, SkillLevel } from '@prisma/client';

async function test(): Promise<boolean> {
  console.log('=== Тест Prisma с новыми полями ===');

  const prisma = new PrismaClient({
    log: ['query', 'error'],
  });

  try {
    await prisma.$connect();
    console.log('✅ Prisma подключен');

    // Создаем тренировку, используя явное приведение к Enum SkillLevel
    const training = await prisma.training.create({
      data: {
        title: 'Тест от Node ES Modules',
        date: new Date(),
        startTime: '18:00',
        endTime: '20:00',
        // Используем импортированный Enum или приведение типа 'as SkillLevel'
        targetLevel: SkillLevel.NOT_SET,
        maxParticipants: 12,
        coachName: 'Тест Тренер',
        location: 'Тест Зал',
        price: 1000,
        description: 'Тестовое описание',
        isActive: true,
      },
    });

    console.log(
      `✅ Создана тренировка: ID=${training.id}, "${training.title}"`,
    );
    console.log(
      `   Время: ${training.startTime} - ${training.endTime}, Уровень: ${training.targetLevel}`,
    );

    const trainings = await prisma.training.findMany({
      where: { isActive: true },
    });
    console.log(`Всего активных тренировок в базе: ${trainings.length}`);

    for (const t of trainings) {
      console.log(`   - [${t.id}] ${t.title} (${t.startTime})`);
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
      console.log('\n🚀 Prisma работает корректно с обновленной схемой!');
      // Не выходим из процесса сразу, если этот файл импортируется где-то еще,
      // но для отдельного скрипта это нормально.
      process.exit(0);
    } else {
      console.log('\n🔴 Тест Prisma не прошел');
      process.exit(1);
    }
  } catch (error: unknown) {
    console.error('⚠️ Критическая ошибка выполнения теста:');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

await main();
