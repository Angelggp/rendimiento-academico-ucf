import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CarrerasService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: { nombre: string; plan: 'D' | 'E' }) {
    if (!dto.nombre?.trim()) {
      throw new BadRequestException('El nombre de la carrera es obligatorio');
    }

    return this.prisma.carrera.create({
      data: {
        nombre: dto.nombre.trim(),
        plan: dto.plan,
      },
    });
  }

  listar() {
    return this.prisma.carrera.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const carrera = await this.prisma.carrera.findUnique({ where: { id } });

    if (!carrera) {
      throw new NotFoundException('Carrera no encontrada');
    }

    return carrera;
  }

  async actualizar(
    id: string,
    dto: { nombre?: string; plan?: 'D' | 'E'; activo?: boolean },
  ) {
    const carreraExistente = await this.prisma.carrera.findUnique({ where: { id } });

    if (!carreraExistente) {
      throw new NotFoundException('Carrera no encontrada');
    }

    return this.prisma.carrera.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre.trim() }),
        ...(dto.plan && { plan: dto.plan }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
      },
    });
  }

  async deshabilitar(id: string) {
    const carreraExistente = await this.prisma.carrera.findUnique({ where: { id } });

    if (!carreraExistente) {
      throw new NotFoundException('Carrera no encontrada');
    }

    return this.prisma.carrera.update({
      where: { id },
      data: { activo: false },
    });
  }
}
