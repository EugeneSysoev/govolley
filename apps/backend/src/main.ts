import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';

config({ path: '.env' });

async function bootstrap() {
  console.log('DATABASE_URL при запуске:', process.env.DATABASE_URL);

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
  console.log(`Backend запущен на http://localhost:3000`);
}

bootstrap().catch((error) => {
  console.error('Ошибка запуска:', error);
  process.exit(1);
});
