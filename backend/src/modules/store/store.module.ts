import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { Store } from './entities/store.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreController } from './store.controller';
import { StoreModelAction } from './store.model-action';

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  controllers: [StoreController],
  providers: [StoreService, StoreModelAction],
  exports: [StoreService, StoreModelAction],
})
export class StoreModule {}
