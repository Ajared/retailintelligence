import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { RoleGuard } from '~/guards/role.guard';
import { PhaseDto, PhaseQueryValidator } from './dto/phase.dto';
import { Roles } from '~/decorators/role.decorator';
import { PhaseService } from './phase.service';
import { UserRole } from '~/modules/user/constants/user.constant';

@Controller('phases')
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @Post()
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createPhase(@Body() phaseDto: PhaseDto) {
    return this.phaseService.createPhase(phaseDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPhaseById(@Param('id') id: string) {
    return this.phaseService.getPhaseById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listPhases(@Query() queryOptions: PhaseQueryValidator) {
    return this.phaseService.listPhases(queryOptions);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updatePhase(@Param('id') id: string, @Body() phaseDto: PhaseDto) {
    return this.phaseService.updatePhase(id, phaseDto);
  }
}
