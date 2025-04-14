import { hash } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { setSeederFactory } from 'typeorm-extension';
import { User } from '~/modules/user/entities/user.entity';
import { AuthProvider } from '~/modules/auth/constants/auth.constant';

class UserFactoryClass {
  private readonly email: string;
  private readonly password: string;

  constructor(private readonly configService: ConfigService) {
    this.email = this.configService.get<string>('SUPER_ADMIN_EMAIL')!;
    this.password = this.configService.get<string>('SUPER_ADMIN_PASSWORD')!;
  }

  async createUser(): Promise<User> {
    const user = new User();
    user.isSuperAdmin = true;
    user.isEmailVerified = true;
    user.email = this.email.toLowerCase();
    user.authProvider = AuthProvider.LOCAL;
    user.password = await hash(this.password, 10);

    return user;
  }
}

export const UserFactory = setSeederFactory(User, async () => {
  const configService = new ConfigService();
  const factory = new UserFactoryClass(configService);
  return await factory.createUser();
});
