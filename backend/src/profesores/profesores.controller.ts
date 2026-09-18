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
import { ProfesoresService } from './profesores.service.js';
import { IsOptional, IsUUID } from 'class-validator';

class ActualizarProfesorDto {
  @IsOptional()
  @IsUUID()
  usuarioId?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profesores')
export class ProfesoresController {
  constructor(private readonly profesoresService: ProfesoresService) {}

  @Roles('ADMIN', 'VICEDECANO')
  @Get()
  listar() {
    return this.profesoresService.listar();
  }

  @Roles('VICEDECANO', 'PROFESOR')
  @Get(':id')
  obtenerPorId(@Param('id') id: string, @Req() req: any) {
    return this.profesoresService.obtenerPorId(id, req.user);
  }

  @Roles('PROFESOR')
  @Post('perfil')
  crearPerfil(@Req() req: any) {
    return this.profesoresService.crearDesdeUsuario(req.user.id);
  }

  @Roles('VICEDECANO')
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarProfesorDto) {
    return this.profesoresService.actualizar(id, dto);
  }
}
