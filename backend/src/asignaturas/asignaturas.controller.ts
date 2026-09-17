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

class CrearAsignaturaDto {
  nombre: string;
  semestre: number;
  profesorId: string;
}

class ActualizarAsignaturaDto {
  nombre?: string;
  semestre?: number;
  activo?: boolean;
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
  obtenerPorProfesor(@Param('profesorId') profesorId: string, @Req() req: any) {
    if (req.user.rol === 'PROFESOR' && req.user.id !== profesorId) {
      return this.asignaturasService.obtenerPorProfesor(req.user.id);
    }
    return this.asignaturasService.obtenerPorProfesor(profesorId);
  }
}
