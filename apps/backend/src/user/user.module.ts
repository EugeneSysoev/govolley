import { Module } from '@nestjs/common';
import { UsersController } from './user.controller.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}
