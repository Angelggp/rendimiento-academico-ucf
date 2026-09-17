import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CarrerasService } from './carreras.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

class CrearCarreraDto {
  nombre: string;
  plan: 'D' | 'E';
}

class ActualizarCarreraDto {
  nombre?: string;
  plan?: 'D' | 'E';
  activo?: boolean;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('carreras')
export class CarrerasController {
  constructor(private readonly carrerasService: CarrerasService) {}

  @Roles('VICEDECANO')
  @Post()
  crear(@Body() dto: CrearCarreraDto) {
    return this.carrerasService.crear(dto);
  }

  @Roles('VICEDECANO')
  @Get()
  listar() {
    return this.carrerasService.listar();
  }

  @Roles('VICEDECANO')
  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.carrerasService.obtenerPorId(id);
  }

  @Roles('VICEDECANO')
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarCarreraDto) {
    return this.carrerasService.actualizar(id, dto);
  }

  @Roles('VICEDECANO')
  @Delete(':id')
  deshabilitar(@Param('id') id: string) {
    return this.carrerasService.deshabilitar(id);
  }
}
