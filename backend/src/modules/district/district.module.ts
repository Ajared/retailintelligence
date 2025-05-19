import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardModule } from '~/guards/guard.module';
import { DistrictService } from './district.service';
import { District } from './entities/district.entity';
import { DistrictController } from './district.controller';
import { DistrictModelAction } from './district.model-action';

@Module({
  imports: [TypeOrmModule.forFeature([District]), GuardModule],
  controllers: [DistrictController],
  providers: [DistrictService, DistrictModelAction],
  exports: [DistrictService, DistrictModelAction],
})
export class DistrictModule {}
