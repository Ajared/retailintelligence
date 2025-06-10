import { AppService } from './app.service';
import { Controller, Get, Query } from '@nestjs/common';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { QueryValidator } from './helpers/query.helper';

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

  @Get('locations')
  async getLocations(@Query() queryOptions: QueryValidator) {
    return this.appService.getLocations(queryOptions);
  }
}
