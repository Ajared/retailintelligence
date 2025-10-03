import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { AppController } from './app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { GuardModule } from './guards/guard.module';
import * as SYS_MSG from '~/helpers/system-messages';
import { LimiterGuard } from './guards/limiter.guard';
import { MailerModule } from '@nestjs-modules/mailer';
import { validateEnv } from './helpers/env.validator';
import createDataSource from './database/data-source';
import { UserModule } from './modules/user/user.module';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { StoreModule } from './modules/store/store.module';
import { TokenModule } from './modules/token/token.module';
import { ValidationPipe } from './helpers/validation.pipe';
import { StateModule } from './modules/state/state.module';
import { PhaseModule } from './modules/phase/phase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DistrictModule } from './modules/district/district.module';
import { ResponseInterceptor } from './helpers/response.interceptor';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationExceptionFilter } from './helpers/validation-filter.exception';
import { LocalGovernmentModule } from './modules/local-government/local-government.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
      errorMessage: SYS_MSG.RATE_LIMIT_EXCEEDED,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('QUEUE_HOST'),
          port: configService.get<number>('QUEUE_PORT'),
          ...(configService.get<string>('NODE_ENV') !== 'local' && {
            username: configService.get<string>('QUEUE_USERNAME'),
            password: configService.get<string>('QUEUE_PASSWORD'),
          }),
          stalledInterval: 300000,
          guardInterval: 300000,
          drainDelay: 300000,
        },
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"Retail Intelligence" <${configService.get<string>('SMTP_FROM')}>`,
        },
        template: {
          dir: __dirname + '/modules/mail/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        options: {
          partials: {
            dir: __dirname + '/modules/mail/templates/partials',
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createDataSource(configService).options,
      dataSourceFactory: async (options) => {
        const logger = new Logger('Database');
        if (!options) throw new Error('Database options are undefined.');

        const pgOptions = options as PostgresConnectionOptions;
        const mainDataSource = new DataSource(pgOptions);

        const initResult = await mainDataSource
          .initialize()
          .then(() => ({ initialized: true, error: null }))
          .catch((error) => ({ initialized: false, error }));

        if (initResult.initialized) {
          logger.log('Data Source initialized');
          return mainDataSource;
        }

        if ((initResult.error as { code?: string })?.code === '3D000') {
          logger.warn(`Creating missing database: ${pgOptions.database}`);
          const tempDataSource = new DataSource({
            ...pgOptions,
            database: 'postgres',
            migrationsRun: false,
            synchronize: false,
          });

          try {
            await tempDataSource.initialize();
            logger.log('Connected to postgres database for database creation');

            await tempDataSource.query(
              `CREATE DATABASE "${pgOptions.database}" OWNER "${pgOptions.username}"`,
            );
            logger.log(`Database ${pgOptions.database} created successfully`);

            await tempDataSource.destroy();

            return mainDataSource.initialize().then((ds) => {
              logger.log(
                'Main Data Source initialized after database creation',
              );
              return ds;
            });
          } catch (error) {
            logger.error('Database creation failed', error);
            await tempDataSource.destroy().catch(() => {});
            throw error;
          }
        }
        logger.error('Database initialization failed', initResult.error);
        throw initResult.error;
      },
    }),
    MailModule,
    TokenModule,
    UserModule,
    AuthModule,
    StoreModule,
    LocalGovernmentModule,
    StateModule,
    AdminModule,
    GuardModule,
    PhaseModule,
    DistrictModule,
  ],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: LimiterGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
  exports: [Logger],
})
export class AppModule {}
