import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AsignaturasService } from './asignaturas.service.js';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

class CrearAsignaturaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @Min(1)
  semestre: number;

  @IsUUID()
  @IsNotEmpty()
  profesorId: string;
}

class ActualizarAsignaturaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  semestre?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsUUID()
  profesorId?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('asignaturas')
export class AsignaturasController {
  constructor(private readonly asignaturasService: AsignaturasService) {}

  @Roles('ADMIN', 'VICEDECANO', 'PROFESOR')
  @Get()
  listar() {
    return this.asignaturasService.listar();
  }

  @Roles('ADMIN', 'VICEDECANO', 'PROFESOR')
  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.asignaturasService.obtenerPorId(id);
  }

  @Roles('ADMIN')
  @Post()
  crear(@Body() dto: CrearAsignaturaDto) {
    return this.asignaturasService.crear(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarAsignaturaDto) {
    return this.asignaturasService.actualizar(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deshabilitar(@Param('id') id: string) {
    return this.asignaturasService.deshabilitar(id);
  }

  @Roles('PROFESOR')
  @Get('profesor/:profesorId')
  obtenerMisAsignaturas(@Req() req: any) {
    return this.asignaturasService.obtenerPorProfesorAutenticado(req.user);
  }
}
