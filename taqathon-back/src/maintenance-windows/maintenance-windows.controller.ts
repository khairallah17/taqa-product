import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MaintenanceWindowsService } from './maintenance-windows.service';
import { PassPortJwtGuard } from 'src/auth/guards/jwt.guard';
import { Prisma } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@Controller('maintenance-windows')
@ApiTags('maintenance-windows')
@UseGuards(PassPortJwtGuard)
export class MaintenanceWindowsController {
  constructor(
    private readonly maintenanceWindowsService: MaintenanceWindowsService
  ) {}

  @Post()
  async create(
    @Body() createMaintenanceWindowDto: Prisma.MaintenanceWindowsCreateInput
  ) {
    try {
      return await this.maintenanceWindowsService.create(
        createMaintenanceWindowDto
      );
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        e.message.includes('Cannot create maintenance window')
      ) {
        throw new HttpException(e.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Failed to create maintenance window',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.maintenanceWindowsService.findAll();
    } catch (e: unknown) {
      console.error('Failed to fetch maintenance windows:', e);
      throw new HttpException(
        'Failed to fetch maintenance windows',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('/count')
  async countAll() {
    return await this.maintenanceWindowsService.count();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.maintenanceWindowsService.findOne(+id);
    } catch (e: unknown) {
      console.error('Failed to fetch maintenance window:', e);
      throw new HttpException(
        'Failed to fetch maintenance window',
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMaintenanceWindowDto: Prisma.MaintenanceWindowsUpdateInput
  ) {
    try {
      return await this.maintenanceWindowsService.update(
        +id,
        updateMaintenanceWindowDto
      );
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        e.message.includes('Cannot update maintenance window')
      ) {
        throw new HttpException(e.message, HttpStatus.CONFLICT);
      }
      if (
        e instanceof Error &&
        e.message.includes('Maintenance window not found')
      ) {
        throw new HttpException(e.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to update maintenance window',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id/anomalies')
  async addAnomalies(
    @Param('id') id: string,
    @Body() body: { anomalyIds: number[] }
  ) {
    try {
      return await this.maintenanceWindowsService.addAnomalies(
        parseInt(id),
        body.anomalyIds
      );
    } catch (e: unknown) {
      console.error('Failed to add anomalies to maintenance window:', e);
      throw new HttpException(
        'Failed to add anomalies',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id/anomalies')
  async delAnomalies(
    @Param('id') id: string,
    @Body() body: { anomalyIds: number[] }
  ) {
    try {
      return await this.maintenanceWindowsService.delAnomalies(
        parseInt(id),
        body.anomalyIds
      );
    } catch (e: unknown) {
      console.error('Failed to remove anomalies from maintenance window:', e);
      throw new HttpException(
        'Failed to remove anomalies',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.maintenanceWindowsService.remove(+id);
    } catch (e: unknown) {
      console.error('Failed to delete maintenance window:', e);
      throw new HttpException(
        'Failed to delete maintenance window',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
