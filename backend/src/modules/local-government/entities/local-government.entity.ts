import { Store } from '~/modules/store/entities/store.entity';
import { State } from '~/modules/state/entities/state.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import {
  Entity,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'local_governments' })
export class LocalGovernment extends AbstractBaseEntity {
  @Column()
  name: string;
  @JoinColumn({ name: 'state_id' })
  @ManyToOne(() => State, (state) => state.localGovernments)
  state: State;

  @Index()
  @Column('uuid')
  stateId: string;
  @OneToMany(() => Store, (store) => store.localGovernment)
  stores: Store[];
}
