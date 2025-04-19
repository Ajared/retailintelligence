import { Controller, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '~/guards/super-admin.guard';

@Controller('admin')
@UseGuards(SuperAdminGuard)
export class AdminController {}
