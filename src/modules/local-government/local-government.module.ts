import { Module } from '@nestjs/common';
import { LocalGovernmentService } from './local-government.service';
import { LocalGovernmentController } from './local-government.controller';

@Module({
  controllers: [LocalGovernmentController],
  providers: [LocalGovernmentService],
})
export class LocalGovernmentModule {}
