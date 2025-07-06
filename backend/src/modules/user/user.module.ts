import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StateModule } from '../state/state.module';
import { UserModelAction } from './user.model-action';

@Module({
  imports: [TypeOrmModule.forFeature([User]), StateModule],
  providers: [UserService, UserModelAction],
  exports: [UserService, UserModelAction],
})
export class UserModule {}
