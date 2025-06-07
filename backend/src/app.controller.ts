import { AppService } from './app.service';
import { Controller, Get, Query } from '@nestjs/common';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { PaginationOptions } from './helpers/pagination.helper';

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
  async getLocations(@Query() paginationOptions: PaginationOptions) {
    return this.appService.getLocations(paginationOptions);
  }
}
