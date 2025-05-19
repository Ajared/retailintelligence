import { AppSeeder } from './app.seeder';
import { SeederOptions } from 'typeorm-extension';
import { UserFactory } from './factories/user.factory';

export const seederOptions: SeederOptions = {
  factories: [UserFactory],
  seeds: [AppSeeder],
};
