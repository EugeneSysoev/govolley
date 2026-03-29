import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, Logger } from '@nestjs/common';
import { config } from 'dotenv';

config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Установка глобального префикса для всех маршрутов API
  app.setGlobalPrefix('api');

  // Конфигурация CORS для допуска запросов с разрешённых источников
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://spathose-julie-unbreakable.ngrok-free.dev',
      /\.ngrok-free\.app$/,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Глобальная валидация входных данных
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаление неопределённых свойств
      transform: true, // Автоматическое преобразование типов
      forbidNonWhitelisted: true, // Ошибка при наличии неизвестных полей
    }),
  );

  const port = process.env.PORT || 3000;
  // Запуск сервера на адресе 0.0.0.0 для совместимости с ngrok
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Backend запущен: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('❌ Критическая ошибка при запуске:', error);
  process.exit(1);
});
