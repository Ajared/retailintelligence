import { StoreType } from '../constants/store.constant';
import { User } from '~/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { District } from '~/modules/district/entities/district.entity';
import { LocalGovernment } from '~/modules/local-government/entities/local-government.entity';

@Entity({ name: 'stores' })
export class Store extends AbstractBaseEntity {
  @Column({ name: 'store_name' })
  storeName: string;

  @JoinColumn({ name: 'local_government_id' })
  @ManyToOne(() => LocalGovernment, (localGov) => localGov.stores)
  localGovernment: LocalGovernment;

  @Column()
  localGovernmentId: string;

  @JoinColumn({ name: 'district_id' })
  @ManyToOne(() => District, (district) => district.stores)
  district: District;

  @Column()
  districtId: string;

  @Column()
  address: string;

  @Column({ type: 'enum', enum: StoreType })
  storeType: StoreType;

  @Column({ type: 'text', nullable: true })
  landmarks?: string;

  @Column({ name: 'photos', type: 'jsonb', nullable: true })
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
