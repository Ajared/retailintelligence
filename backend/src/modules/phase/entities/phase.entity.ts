import {
  Entity,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '~/modules/user/entities/user.entity';
import { Store } from '~/modules/store/entities/store.entity';
import { State } from '~/modules/state/entities/state.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { District } from '~/modules/district/entities/district.entity';

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

  @OneToMany(() => User, (user) => user.assignedPhase, { nullable: true })
  users?: User[];
}
