import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Phase } from './entities/phase.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from '~/database/base/base.model-action';

@Injectable()
export class PhaseModelAction extends AbstractModelAction<Phase> {
  constructor(@InjectRepository(Phase) repository: Repository<Phase>) {
    super(repository, Phase);
  }
}
