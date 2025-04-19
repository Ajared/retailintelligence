import { Column, Entity, ManyToOne } from 'typeorm';
import { StoreType } from '../constants/store.constant';
import { User } from '~/modules/user/entities/user.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { District } from '~/modules/district/entities/district.entity';
import { LocalGovernment } from '~/modules/local-government/entities/local-government.entity';

@Entity({ name: 'stores' })
export class Store extends AbstractBaseEntity {
  @Column({ name: 'store_name' })
  storeName: string;

  @ManyToOne(() => LocalGovernment, (localGov) => localGov.stores)
  localGovernment: LocalGovernment;

  @ManyToOne(() => District, (district) => district.stores)
  district: District;

  @Column()
  address: string;

  @Column({ type: 'enum', enum: StoreType })
  storeType: StoreType;

  @Column({ type: 'text', nullable: true })
  landmarks: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @ManyToOne(() => User, (user) => user.stores)
  enumerator: User;
}
