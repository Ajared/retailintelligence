import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { runSeeders } from 'typeorm-extension';
import { INestApplication } from '@nestjs/common';
import { seederOptions } from './database/seeder/seeder';

class Application {
  private app: INestApplication;
  private dataSource: DataSource;
  private readonly logger = new Logger('App');

  async runMigrations() {
    try {
      await this.dataSource.runMigrations();
      this.logger.log('Database migrations finished successfully.');
    } catch (error) {
      this.logger.error('Error running database migrations:', error);
      throw error;
    }
  }

  async seedDatabase() {
    try {
      await runSeeders(this.dataSource, seederOptions);
      this.logger.log('Database successfully seeded.');
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }

  async startServer(port: number) {
    await this.runMigrations();
    await this.seedDatabase();
    await this.app.listen(port);
    const nodeEnv = process.env.NODE_ENV || 'development';
    this.logger.log(`Server is running on port ${port} in ${nodeEnv} mode`);
  }

  async bootstrap() {
    const port = Number(process.env.PORT) || 3000;
    this.app = await NestFactory.create(AppModule, { bufferLogs: true });
    this.dataSource = this.app.get(DataSource);

    this.app.setGlobalPrefix('api/v1', {
      exclude: ['/', 'health', 'api', 'api/v1', 'api/docs', 'probe'],
    });

    await this.startServer(port).catch(async (error) => {
      this.logger.error('Application startup failed:', error);
      await this.app.close();
      process.exit(1);
    });
  }

  static async run() {
    const app = new Application();
    await app.bootstrap().catch((err) => {
      app.logger.error('Failed to start application:', err);
      process.exit(1);
    });
  }
}

void Application.run();
