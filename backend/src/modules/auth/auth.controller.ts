import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SkipAuth } from '~/decorators/skip-auth.decorator';
import { Mutation } from '~/decorators/mutation.decorator';
import {
  Req,
  Post,
  Body,
  HttpCode,
  Controller,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  AuthDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  GoogleAuthDto,
  SendInviteEmailDto,
} from './dto/auth-request.dto';
import { Request } from 'express';
import { AuthGuard } from '~/guards/auth.guard';
import { RoleGuard } from '~/guards/role.guard';
import { Roles } from '~/decorators/role.decorator';
import { UserRole } from '~/modules/user/constants/user.constant';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Mutation()
  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  invite(@Body() sendInviteEmailDto: SendInviteEmailDto) {
    return this.authService.sendInviteEmail(sendInviteEmailDto);
  }

  @SkipAuth()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() authDto: AuthDto, @Req() req: Request) {
    return this.authService.register(authDto, req.headers['invite-token']);
  }

  @SkipAuth()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @SkipAuth()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @SkipAuth()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @SkipAuth()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  googleAuth(@Body() googleAuthDto: GoogleAuthDto, @Req() req: Request) {
    return this.authService.googleAuth(
      googleAuthDto,
      req.headers['invite-token'],
    );
  }
}
