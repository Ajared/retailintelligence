import { Entity, OneToMany, Column } from 'typeorm';
import { Store } from '~/modules/store/entities/store.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { LocalGovernment } from '~/modules/local-government/entities/local-government.entity';

@Entity({ name: 'states' })
export class State extends AbstractBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Store, (store) => store.state)
  stores: Store[];

  @OneToMany(() => LocalGovernment, (localGovernment) => localGovernment.state)
  localGovernments: LocalGovernment[];
}
