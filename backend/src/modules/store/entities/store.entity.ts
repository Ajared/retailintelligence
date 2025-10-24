import { StoreType } from '../types/store.interface';
import { User } from '~/modules/user/entities/user.entity';
import { State } from '~/modules/state/entities/state.entity';
import { Phase } from '~/modules/phase/entities/phase.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { District } from '~/modules/district/entities/district.entity';
import { LocalGovernment } from '~/modules/local-government/entities/local-government.entity';

@Entity({ name: 'stores' })
export class Store extends AbstractBaseEntity {
  @Column()
  name: string;

  @JoinColumn({ name: 'local_government_id' })
  @ManyToOne(() => LocalGovernment, (localGov) => localGov.stores, {
    nullable: true,
  })
  localGovernment?: LocalGovernment;

  @Column({ nullable: true })
  localGovernmentId?: string;

  @JoinColumn({ name: 'state_id' })
  @ManyToOne(() => State, (state) => state.stores, { nullable: true })
  state?: State;

  @Column({ nullable: true })
  stateId?: string;

  @Column()
  address: string;

  @Column()
  storeType: StoreType;

  @Column({ type: 'text', nullable: true })
  storeTypeDescription?: string;

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

  @JoinColumn({ name: 'phase_id' })
  @ManyToOne(() => Phase, (phase) => phase.stores, { nullable: true })
  phase?: Phase;

  @Column({ nullable: true })
  phaseId?: string;

  @JoinColumn({ name: 'district_id' })
  @ManyToOne(() => District, (district) => district.stores, { nullable: true })
  district?: District;

  @Column({ nullable: true })
  districtId?: string;
}
