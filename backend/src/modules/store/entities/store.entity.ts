import { User } from '~/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { State } from '~/modules/state/entities/state.entity';
import { LocalGovernment } from '~/modules/local-government/entities/local-government.entity';

@Entity({ name: 'stores' })
export class Store extends AbstractBaseEntity {
  @Column()
  name: string;

  @JoinColumn({ name: 'local_government_id' })
  @ManyToOne(() => LocalGovernment, (localGov) => localGov.stores)
  localGovernment: LocalGovernment;

  @Column()
  localGovernmentId: string;

  @JoinColumn({ name: 'state_id' })
  @ManyToOne(() => State, (state) => state.stores)
  state: State;

  @Column()
  stateId: string;

  @Column()
  address: string;

  @Column()
  storeType: string;

  @Column({ type: 'text', nullable: true })
  landmarks?: string;

  @Column({ type: 'text', array: true, nullable: true })
  photos?: string[];

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @JoinColumn({ name: 'enumerator_id' })
  @ManyToOne(() => User, (user) => user.stores)
  enumerator: User;

  @Column()
  enumeratorId: string;
}
