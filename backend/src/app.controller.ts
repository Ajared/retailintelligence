import { AppService } from './app.service';
import { Controller, Get, Query } from '@nestjs/common';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { StateQueryValidator } from './modules/state/dto/state.dto';
import { PhaseQueryValidator } from './modules/phase/dto/phase.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SkipAuth()
  getHello(): string {
    return this.appService.getHello();
  }

  @SkipAuth()
  @Get('health')
  getHealth(): Record<string, unknown> {
    return this.appService.getHealth();
  }

  @Get('locations')
  async getLocations(@Query() queryOptions: StateQueryValidator) {
    return this.appService.getLocations(queryOptions);
  }

  @Get('phases')
  async getPhases(@Query() queryOptions: PhaseQueryValidator) {
    return this.appService.getPhases(queryOptions);
  }
}
