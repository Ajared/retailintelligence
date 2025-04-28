import { Module } from '@nestjs/common';
import { GuardModule } from '~/guards/guard.module';
import { StoreModule } from '../store/store.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [GuardModule, StoreModule],
  controllers: [AdminController],
})
export class AdminModule {}
