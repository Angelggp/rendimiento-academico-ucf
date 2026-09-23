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
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

const MENSAJE_CARNET = 'El carné de identidad debe tener 11 dígitos';
import { Municipio } from '@prisma/client';

class CrearEstudianteDto {
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

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsUUID()
  @IsNotEmpty()
  carreraId: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: MENSAJE_CARNET })
  carnetIdentidad: string;

  @IsEnum(Municipio)
  municipio: Municipio;

  @IsOptional()
  @IsString()
  observaciones?: string | null;
}

class CrearPerfilEstudianteDto {
  @IsUUID()
  @IsNotEmpty()
  carreraId: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: MENSAJE_CARNET })
  carnetIdentidad: string;

  @IsEnum(Municipio)
  municipio: Municipio;

  @IsOptional()
  @IsString()
  observaciones?: string | null;
}

class ActualizarEstudianteDto {
  @IsOptional()
  @IsUUID()
  carreraId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: MENSAJE_CARNET })
  carnetIdentidad?: string;

  @IsOptional()
  @IsEnum(Municipio)
  municipio?: Municipio;

  @IsOptional()
  @IsString()
  observaciones?: string | null;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Roles('VICEDECANO', 'PROFESOR')
  @Get()
  listar() {
    return this.estudiantesService.listar();
  }

  @Roles('ADMIN', 'VICEDECANO')
  @Post()
  crear(@Body() dto: CrearEstudianteDto) {
    return this.estudiantesService.crear(dto);
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

  @Roles('VICEDECANO', 'ESTUDIANTE')
  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() dto: ActualizarEstudianteDto,
    @Req() req: any,
  ) {
    return this.estudiantesService.actualizar(id, dto, req.user);
  }
}
