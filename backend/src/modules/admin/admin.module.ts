import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';
import { GuardModule } from '~/guards/guard.module';
import { StoreModule } from '../store/store.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [GuardModule, UserModule, StoreModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
