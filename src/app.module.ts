import { DataSource } from 'typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import createDataSource from './database/data-source';
import { validateEnv } from './helpers/env.validator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from './helpers/validation.pipe';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor } from './helpers/response.interceptor';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ValidationExceptionFilter } from './helpers/validation-filter.exception';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
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
          from: `"BeakCrypt" <${configService.get<string>('SMTP_FROM')}>`,
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
      useFactory: (configService: ConfigService) => {
        return createDataSource(configService).options;
      },
      dataSourceFactory: async (options) => {
        const logger = new Logger('Database');
        const dataSource = new DataSource(options!);
        try {
          if (!dataSource.isInitialized) {
            await dataSource.initialize();
            logger.log('Data Source has been initialized!');
          }
          return dataSource;
        } catch (error) {
          logger.error('Error during Data Source initialization', error);
          throw error;
        }
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    Logger,
    AppService,
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
