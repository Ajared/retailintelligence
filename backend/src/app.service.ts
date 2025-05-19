import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): Record<string, unknown> {
    return {
      message: 'All services are running',
      data: {
        version: this.configService.get<string>('npm_package_version'),
        uptime: process.uptime(),
        environment: this.configService.get<string>('NODE_ENV'),
      },
    };
  }
}
