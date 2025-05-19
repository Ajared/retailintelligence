import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardModule } from '~/guards/guard.module';
import { LocalGovernmentService } from './local-government.service';
import { LocalGovernment } from './entities/local-government.entity';
import { LocalGovernmentController } from './local-government.controller';
import { LocalGovernmentModelAction } from './local-government.model-action';

@Module({
  imports: [TypeOrmModule.forFeature([LocalGovernment]), GuardModule],
  controllers: [LocalGovernmentController],
  providers: [LocalGovernmentService, LocalGovernmentModelAction],
  exports: [LocalGovernmentService, LocalGovernmentModelAction],
})
export class LocalGovernmentModule {}
