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
import { StateDto, StateQueryValidator } from './dto/state.dto';
import { Roles } from '~/decorators/role.decorator';
import { Mutation } from '~/decorators/mutation.decorator';
import { StateService } from './state.service';
import { UserRole } from '~/modules/user/constants/user.constant';

@Controller('states')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Mutation()
  @Post()
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createState(@Body() stateDto: StateDto) {
    return this.stateService.createState(stateDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getStateById(@Param('id') id: string) {
    return this.stateService.getStateById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listStates(@Query() queryOptions: StateQueryValidator) {
    return this.stateService.listStates(queryOptions);
  }

  @Mutation()
  @Patch(':id')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateState(@Param('id') id: string, @Body() stateDto: StateDto) {
    return this.stateService.updateState(id, stateDto);
  }
}
