import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';

class Application {
  private app: INestApplication;
  private readonly logger = new Logger('App');

  async startServer(port: number) {
    await this.app.listen(port);
    const nodeEnv = process.env.NODE_ENV || 'development';
    this.logger.log(`Server is running on port ${port} in ${nodeEnv} mode`);
  }

  async bootstrap() {
    const port = Number(process.env.PORT) || 3000;
    this.app = await NestFactory.create(AppModule, { bufferLogs: true });

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
