import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { State } from './entities/state.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractModelAction } from '~/database/base/base.model-action';

@Injectable()
export class StateModelAction extends AbstractModelAction<State> {
  constructor(@InjectRepository(State) repository: Repository<State>) {
    super(repository, State);
  }
}
