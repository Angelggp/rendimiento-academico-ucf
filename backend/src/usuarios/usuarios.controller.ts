import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

class CrearUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  rol: 'ADMIN' | 'VICEDECANO' | 'PROFESOR' | 'ESTUDIANTE';
  telefono?: string;
}

class ActualizarUsuarioDto {
  email?: string;
  nombre?: string;
  apellidos?: string;
  rol?: 'ADMIN' | 'VICEDECANO' | 'PROFESOR' | 'ESTUDIANTE';
  activo?: boolean;
  telefono?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Roles('ADMIN')
  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crear(dto);
  }

  @Roles('ADMIN')
  @Get()
  listar(@Query('rol') rol?: string) {
    return this.usuariosService.listar(rol);
  }

  @Roles('ADMIN')
  @Get(':id')
  obtenerPorId(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.obtenerPorId(id, req.user);
  }

  @Roles('ADMIN')
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto) {
    return this.usuariosService.actualizar(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deshabilitar(@Param('id') id: string) {
    return this.usuariosService.deshabilitar(id);
  }
}
