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
import { Roles } from '~/decorators/role.decorator';
import { Mutation } from '~/decorators/mutation.decorator';
import {
  LocalGovernmentDto,
  LocalGovernmentQueryValidator,
} from './dto/local-government.dto';
import { UserRole } from '~/modules/user/constants/user.constant';
import { LocalGovernmentService } from './local-government.service';

@Controller('local-governments')
export class LocalGovernmentController {
  constructor(
    private readonly localGovernmentService: LocalGovernmentService,
  ) {}

  @Mutation()
  @Post()
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async createLocalGovernment(@Body() localGovernmentDto: LocalGovernmentDto) {
    return this.localGovernmentService.createLocalGovernment(
      localGovernmentDto,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getLocalGovernmentById(@Param('id') id: string) {
    return this.localGovernmentService.getLocalGovernmentById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listLocalGovernments(
    @Query() queryOptions: LocalGovernmentQueryValidator,
  ) {
    return this.localGovernmentService.listLocalGovernments(queryOptions);
  }

  @Mutation()
  @Patch(':id')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateLocalGovernment(
    @Param('id') id: string,
    @Body() localGovernmentDto: LocalGovernmentDto,
  ) {
    return this.localGovernmentService.updateLocalGovernment(
      id,
      localGovernmentDto,
    );
  }
}
