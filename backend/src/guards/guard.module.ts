import { RoleGuard } from './role.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module } from '@nestjs/common';
import { User } from '../modules/user/entities/user.entity';
import { UserModelAction } from '~/modules/user/user.model-action';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [RoleGuard, UserModelAction],
  exports: [RoleGuard, UserModelAction],
})
export class GuardModule {}
