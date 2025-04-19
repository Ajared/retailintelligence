import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { UserService } from '~/modules/user/user.service';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [UserService],
})
export class AdminModule {}
