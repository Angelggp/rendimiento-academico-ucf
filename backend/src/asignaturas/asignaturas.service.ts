import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const INCLUDE_ASIGNATURA = {
  profesor: {
    include: {
      usuario: {
        select: {
          id: true,
          email: true,
          nombre: true,
          apellidos: true,
          rol: true,
          activo: true,
        },
      },
    },
  },
  carreras: { select: { id: true, nombre: true, plan: true, activo: true } },
} as const;

@Injectable()
export class AsignaturasService {
  constructor(private readonly prisma: PrismaService) {}

  private async validarCarreras(carreraIds: string[]) {
    const ids = [...new Set(carreraIds)];
    const existentes = await this.prisma.carrera.count({ where: { id: { in: ids } } });

    if (existentes !== ids.length) {
      throw new NotFoundException('Alguna de las carreras indicadas no existe');
    }
  }

  async listar() {
    return this.prisma.asignatura.findMany({
      include: INCLUDE_ASIGNATURA,
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id },
      include: INCLUDE_ASIGNATURA,
    });

    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    return asignatura;
  }

  async crear(dto: { nombre: string; semestre: number; profesorId: string; carreraIds: string[] }) {
    if (!dto.nombre?.trim()) {
      throw new BadRequestException('El nombre de la asignatura es obligatorio');
    }

    if (!Number.isInteger(dto.semestre) || dto.semestre < 1 || dto.semestre > 8) {
      throw new BadRequestException('El semestre debe ser un número entero entre 1 y 8');
    }

    const profesor = await this.prisma.profesor.findUnique({ where: { id: dto.profesorId } });

    if (!profesor) {
      throw new NotFoundException('El profesor indicado no existe');
    }

    await this.validarCarreras(dto.carreraIds);

    return this.prisma.asignatura.create({
      data: {
        nombre: dto.nombre.trim(),
        semestre: dto.semestre,
        profesorId: dto.profesorId,
        carreras: { connect: [...new Set(dto.carreraIds)].map((id) => ({ id })) },
      },
      include: INCLUDE_ASIGNATURA,
    });
  }

  async actualizar(id: string, dto: { nombre?: string; semestre?: number; activo?: boolean; profesorId?: string; carreraIds?: string[] }) {
    const asignatura = await this.prisma.asignatura.findUnique({ where: { id } });

    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    if (dto.semestre !== undefined && (!Number.isInteger(dto.semestre) || dto.semestre < 1 || dto.semestre > 8)) {
      throw new BadRequestException('El semestre debe ser un número entero entre 1 y 8');
    }

    if (dto.profesorId) {
      const profesor = await this.prisma.profesor.findUnique({ where: { id: dto.profesorId } });
      if (!profesor) {
        throw new NotFoundException('El profesor indicado no existe');
      }
    }

    if (dto.carreraIds) {
      await this.validarCarreras(dto.carreraIds);
    }

    return this.prisma.asignatura.update({
      where: { id },
      data: {
        ...(dto.carreraIds && { carreras: { set: [...new Set(dto.carreraIds)].map((carreraId) => ({ id: carreraId })) } }),
        ...(dto.nombre && { nombre: dto.nombre.trim() }),
        ...(dto.semestre !== undefined && { semestre: dto.semestre }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
        ...(dto.profesorId && { profesorId: dto.profesorId }),
      },
      include: INCLUDE_ASIGNATURA,
    });
  }

  async deshabilitar(id: string) {
    const asignatura = await this.prisma.asignatura.findUnique({ where: { id } });

    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    return this.prisma.asignatura.update({
      where: { id },
      data: { activo: false },
    });
  }

  async obtenerPorProfesorAutenticado(usuarioActual: any) {
    const profesor = await this.prisma.profesor.findUnique({
      where: { usuarioId: usuarioActual.id },
    });

    if (!profesor) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    return this.obtenerPorProfesor(profesor.id);
  }

  async obtenerPorProfesor(profesorId: string) {
    const profesor = await this.prisma.profesor.findUnique({ where: { id: profesorId } });

    if (!profesor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    return this.prisma.asignatura.findMany({
      where: { profesorId },
      include: INCLUDE_ASIGNATURA,
      orderBy: { createdAt: 'desc' },
    });
  }
}
