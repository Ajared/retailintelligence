import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '~/database/base/base.entity';
import { AuthProvider } from '~/modules/auth/constants/auth.constant';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;
}
