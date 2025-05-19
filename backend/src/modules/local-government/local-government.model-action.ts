import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { LocalGovernment } from './entities/local-government.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from '~/database/base/base.model-action';

@Injectable()
export class LocalGovernmentModelAction extends AbstractModelAction<LocalGovernment> {
  constructor(
    @InjectRepository(LocalGovernment) repository: Repository<LocalGovernment>,
  ) {
    super(repository, LocalGovernment);
  }
}
