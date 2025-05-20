import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { GuardModule } from '~/guards/guard.module';
import { StoreModule } from '../store/store.module';
import { AdminController } from './admin.controller';
@Module({
  imports: [GuardModule, UserModule, StoreModule],
  controllers: [AdminController],
})
export class AdminModule {}
