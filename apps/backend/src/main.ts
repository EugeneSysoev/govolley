import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { ensureUploadsDir } from './common/init/upload-dir.js';

config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  ensureUploadsDir();

  // Глобальный префикс API
  app.setGlobalPrefix('api');

  // Разрешенные источники
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3001',
  ].filter((origin): origin is string => Boolean(origin));

  // Настройка CORS
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Для SSR, curl или мобильных приложений
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.ngrok-free.dev') ||
        origin.endsWith('.ngrok-free.app');

      if (isAllowed) {
        return callback(null, true);
      }

      logger.warn(`❌ CORS заблокирован: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Backend: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('❌ Ошибка запуска:', error);
  process.exit(1);
});
