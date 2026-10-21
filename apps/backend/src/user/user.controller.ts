import {
  Controller,
  Patch,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TrainingManagerGuard } from '../auth/guards/training-manager.guard.js';
import { validate } from '../common/utils/validate.js';
import {
  UpdateUserSchema,
  CompleteOnboardingSchema,
  VerifyLevelSchema,
} from '../common/validators/user.schema.js';
type AuthenticatedRequest = Request & { user: Express.User };
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Patch('profile')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 3,
        parts: 4,
        fieldSize: 1024,
        fieldNameSize: 100,
      },
    }),
  )
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^image\/(png|jpeg|webp)$/,
            overrideMimeType: true,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(
      req.user.id,
      validate(UpdateUserSchema, body),
      file,
    );
  }
  @Patch('complete-onboarding')
  completeOnboarding(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    return this.usersService.completeOnboarding(
      req.user.id,
      validate(CompleteOnboardingSchema, body).answers,
    );
  }
  @Get('bookings')
  getUserBookings(@Req() req: AuthenticatedRequest) {
    return this.usersService.getUserBookings(req.user.id);
  }
  @Patch('verify-level/:userId')
  @UseGuards(TrainingManagerGuard)
  verifyUserLevel(@Param('userId') id: string, @Body() body: unknown) {
    return this.usersService.verifyLevel(
      validate(z.coerce.number().int().positive(), id),
      validate(VerifyLevelSchema, body).isLevelVerified,
    );
  }
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.id);
  }
}
