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
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from '@prisma/client';

class CrearUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsEnum(Rol)
  rol: Rol;

  @IsOptional()
  @IsString()
  telefono?: string;
}

class ActualizarUsuarioDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apellidos?: string;

  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
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
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarUsuarioDto,
    @Req() req: any,
  ) {
    return this.usuariosService.actualizar(id, dto, req.user);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deshabilitar(@Param('id') id: string, @Req() req: any) {
    return this.usuariosService.deshabilitar(id, req.user);
  }
}
