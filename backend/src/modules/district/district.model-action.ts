import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { District } from './entities/district.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from '~/database/base/base.model-action';

@Injectable()
export class DistrictModelAction extends AbstractModelAction<District> {
  constructor(@InjectRepository(District) repository: Repository<District>) {
    super(repository, District);
  }
}
