import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { TokenModule } from '../token/token.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [UserModule, TokenModule, MailModule, NotificationModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
