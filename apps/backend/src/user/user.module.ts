import { AvatarStorage } from './avatar-storage.service.js';
import { Module } from '@nestjs/common';
import { UsersController } from './user.controller.js';
import { UsersService } from './users.service.js';
import { StaffRolesController } from './staff-roles.controller.js';
import { StaffRolesService } from './staff-roles.service.js';

@Module({
  controllers: [UsersController, StaffRolesController],
  providers: [UsersService, AvatarStorage, StaffRolesService],
})
export class UserModule {}
