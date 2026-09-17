import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { EvaluacionesService } from './evaluaciones.service.js';

class RegistrarEvaluacionDto {
  estudianteId: string;
  asignaturaId: string;
  calificacion?: number | null;
  estado?: 'APROBADA' | 'PENDIENTE';
  fecha?: Date;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluaciones')
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Roles('ADMIN', 'VICEDECANO', 'PROFESOR')
  @Get()
  listar() {
    return this.evaluacionesService.listar();
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
