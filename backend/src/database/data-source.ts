import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSourceLogger } from './data-source.logger';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const createDataSource = (configService: ConfigService) => {
  const entities = configService.get<string>('DB_ENTITIES')!;
  const migrations = configService.get<string>('DB_MIGRATIONS')!;
  const isDevelopment = configService.get('NODE_ENV') === 'development';

  return new DataSource({
    type: 'postgres',
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    database: configService.get<string>('DB_NAME'),
    entities: [entities],
    migrations: [migrations],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: isDevelopment,
    migrationsTableName: 'migrations',
    ssl: configService.get<boolean>('DB_SSL'),
    logging: isDevelopment,
    logger: isDevelopment ? new DataSourceLogger('DataSource') : undefined,
  });
};

export default createDataSource;
