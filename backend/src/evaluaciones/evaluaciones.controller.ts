import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { EvaluacionesService } from './evaluaciones.service.js';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { EstadoEvaluacion, Municipio } from '@prisma/client';

class FiltrarEvaluacionesDto {
  @IsOptional()
  @IsUUID()
  asignaturaId?: string;

  @IsOptional()
  @IsUUID()
  profesorId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semestre?: number;

  @IsOptional()
  @IsEnum(Municipio)
  municipio?: Municipio;

  @IsOptional()
  @IsEnum(EstadoEvaluacion)
  estado?: EstadoEvaluacion;
}

class RegistrarEvaluacionDto {
  @IsUUID()
  @IsNotEmpty()
  estudianteId: string;

  @IsUUID()
  @IsNotEmpty()
  asignaturaId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  calificacion?: number | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string | null;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Roles('ADMIN', 'VICEDECANO', 'PROFESOR')
  @Get()
  listar(@Query() filtros: FiltrarEvaluacionesDto) {
    return this.evaluacionesService.listar(filtros);
  }

  @Roles('ADMIN', 'VICEDECANO', 'PROFESOR', 'ESTUDIANTE')
  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.evaluacionesService.obtenerPorId(id);
  }

  @Roles('PROFESOR')
  @Post()
  registrar(@Req() req: any, @Body() dto: RegistrarEvaluacionDto) {
    return this.evaluacionesService.registrar(dto, req.user);
  }

  @Roles('ADMIN', 'VICEDECANO', 'ESTUDIANTE')
  @Get('estudiante/:estudianteId')
  listarPorEstudiante(@Param('estudianteId') estudianteId: string, @Req() req: any) {
    return this.evaluacionesService.listarPorEstudiante(estudianteId, req.user);
  }

  @Roles('ADMIN', 'VICEDECANO', 'PROFESOR')
  @Get('asignatura/:asignaturaId')
  listarPorAsignatura(@Param('asignaturaId') asignaturaId: string, @Req() req: any) {
    return this.evaluacionesService.listarPorAsignatura(asignaturaId, req.user);
  }
}
