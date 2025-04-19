import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module } from '@nestjs/common';
import { SuperAdminGuard } from './super-admin.guard';
import { User } from '../modules/user/entities/user.entity';
import { UserModelAction } from '../modules/user/user.model-action';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SuperAdminGuard, UserModelAction],
  exports: [SuperAdminGuard, UserModelAction],
})
export class GuardModule {}
