import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Store } from './entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from '~/database/base/base.model-action';

@Injectable()
export class StoreModelAction extends AbstractModelAction<Store> {
  constructor(@InjectRepository(Store) repository: Repository<Store>) {
    super(repository, Store, ['name'], ['latitude', 'longitude']);
  }
}
