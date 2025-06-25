import {
  Entity,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Phase } from '~/modules/phase/entities/phase.entity';
import { Store } from '~/modules/store/entities/store.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';

@Entity({ name: 'districts' })
export class District extends AbstractBaseEntity {
  @Column()
  name: string;

  @JoinColumn({ name: 'phase_id' })
  @ManyToOne(() => Phase, (phase) => phase.districts)
  phase: Phase;

  @Index()
  @Column('uuid')
  phaseId: string;

  @OneToMany(() => Store, (store) => store.district)
  stores: Store[];
}
