import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from './decorators/skip-auth.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SkipAuth()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @SkipAuth()
  @Get('health')
  getHealth(): Record<string, unknown> {
    return this.appService.getHealth();
  }
}