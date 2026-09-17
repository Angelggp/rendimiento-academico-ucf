import {
  Body,
  Controller,
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
import { EstudiantesService } from './estudiantes.service.js';

class CrearPerfilEstudianteDto {
  carreraId: string;
  carnetIdentidad: string;
  municipio: 'CIENFUEGOS' | 'ABREUS' | 'CRUCES' | 'CUMANAYAGUA' | 'LAJAS' | 'PALMIRA' | 'RODAS' | 'AGUADA_DE_PASAJEROS';
  observaciones?: string | null;
}

class ActualizarEstudianteDto {
  carreraId?: string;
  carnetIdentidad?: string;
  municipio?: 'CIENFUEGOS' | 'ABREUS' | 'CRUCES' | 'CUMANAYAGUA' | 'LAJAS' | 'PALMIRA' | 'RODAS' | 'AGUADA_DE_PASAJEROS';
  observaciones?: string | null;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Roles('VICEDECANO')
  @Get()
  listar() {
    return this.estudiantesService.listar();
  }

  @Roles('VICEDECANO', 'ESTUDIANTE')
  @Get(':id')
  obtenerPorId(@Param('id') id: string, @Req() req: any) {
    return this.estudiantesService.obtenerPorId(id, req.user);
  }

  @Roles('ESTUDIANTE')
  @Post('perfil')
  crearPerfil(@Req() req: any, @Body() dto: CrearPerfilEstudianteDto) {
    return this.estudiantesService.crearDesdeUsuario(req.user.id, dto);
  }

  @Roles('VICEDECANO')
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarEstudianteDto) {
    return this.estudiantesService.actualizar(id, dto);
  }
}
