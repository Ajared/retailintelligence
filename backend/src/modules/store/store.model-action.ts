import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Store } from './entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from '~/database/base/base.model-action';

const SEARCHABLE_STORE_COLUMNS: (keyof Store)[] = ['name'];
const FILTERABLE_STORE_COLUMNS: (keyof Store)[] = ['latitude', 'longitude'];

@Injectable()
export class StoreModelAction extends AbstractModelAction<Store> {
  constructor(@InjectRepository(Store) repository: Repository<Store>) {
    super(
      repository,
      Store,
      SEARCHABLE_STORE_COLUMNS,
      FILTERABLE_STORE_COLUMNS,
    );
  }
}
