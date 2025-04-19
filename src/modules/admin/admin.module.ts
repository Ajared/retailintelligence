import { Module } from '@nestjs/common';
import { GuardModule } from '~/guards/guard.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [GuardModule],
  controllers: [AdminController],
})
export class AdminModule {}
