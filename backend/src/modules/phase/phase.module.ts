import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { Phase } from './entities/phase.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardModule } from '~/guards/guard.module';
import { PhaseController } from './phase.controller';
import { PhaseModelAction } from './phase.model-action';

@Module({
  imports: [TypeOrmModule.forFeature([Phase]), GuardModule],
  controllers: [PhaseController],
  providers: [PhaseService, PhaseModelAction],
  exports: [PhaseService, PhaseModelAction],
})
export class PhaseModule {}
