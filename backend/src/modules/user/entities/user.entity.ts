import { Entity, Column, OneToMany } from 'typeorm';
import { Store } from '~/modules/store/entities/store.entity';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { AuthProvider } from '~/modules/auth/constants/auth.constant';
import { UserRole, UserStatus } from '~/modules/user/constants/user.constant';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true })
  assignedStateId?: string;

  @Column({ nullable: true })
  assignedLocalGovernmentId?: string;

  @Column({ nullable: true })
  assignedPhaseId?: string;

  @Column({ nullable: true })
  assignedDistrictId?: string;

  @OneToMany(() => Store, (store) => store.enumerator)
  stores: Store[];
}
