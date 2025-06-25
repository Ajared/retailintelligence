import {
  Entity,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Store } from '~/modules/store/entities/store.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { District } from '~/modules/district/entities/district.entity';
import { State } from '~/modules/state/entities/state.entity';

@Entity({ name: 'phases' })
export class Phase extends AbstractBaseEntity {
  @Column()
  name: string;

  @JoinColumn({ name: 'state_id' })
  @ManyToOne(() => State, (state) => state.phases)
  state: State;

  @Index()
  @Column('uuid')
  stateId: string;

  @OneToMany(() => Store, (store) => store.phase)
  stores: Store[];

  @OneToMany(() => District, (district) => district.phase)
  districts: District[];
}
