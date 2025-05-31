import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardModule } from '~/guards/guard.module';
import { StateService } from './state.service';
import { State } from './entities/state.entity';
import { StateController } from './state.controller';
import { StateModelAction } from './state.model-action';

@Module({
  imports: [TypeOrmModule.forFeature([State]), GuardModule],
  controllers: [StateController],
  providers: [StateService, StateModelAction],
  exports: [StateService, StateModelAction],
})
export class StateModule {}
