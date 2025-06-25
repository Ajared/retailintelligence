import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { District } from './entities/district.entity';
import { AbstractModelAction } from '~/database/base/base.model-action';

@Injectable()
export class DistrictModelAction extends AbstractModelAction<District> {
  constructor(@InjectRepository(District) repository: Repository<District>) {
    super(repository, District);
  }
}
