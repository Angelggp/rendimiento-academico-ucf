import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AsignaturasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.asignatura.findMany({
      include: {
        profesor: {
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
                nombre: true,
                apellidos: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id },
      include: {
        profesor: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    return asignatura;
  }

  async crear(dto: { nombre: string; semestre: number; profesorId: string }) {
    if (!dto.nombre?.trim()) {
      throw new BadRequestException('El nombre de la asignatura es obligatorio');
    }

    if (!Number.isInteger(dto.semestre) || dto.semestre < 1) {
      throw new BadRequestException('El semestre debe ser un número entero válido');
    }

    const profesor = await this.prisma.profesor.findUnique({ where: { id: dto.profesorId } });

    if (!profesor) {
      throw new NotFoundException('El profesor indicado no existe');
    }

    return this.prisma.asignatura.create({
      data: {
        nombre: dto.nombre.trim(),
        semestre: dto.semestre,
        profesorId: dto.profesorId,
      },
      include: {
        profesor: {
          include: {
            usuario: true,
          },
        },
      },
    });
  }

  async actualizar(id: string, dto: { nombre?: string; semestre?: number; activo?: boolean; profesorId?: string }) {
    const asignatura = await this.prisma.asignatura.findUnique({ where: { id } });

    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    if (dto.semestre !== undefined && (!Number.isInteger(dto.semestre) || dto.semestre < 1)) {
      throw new BadRequestException('El semestre debe ser un número entero válido');
    }

    if (dto.profesorId) {
      const profesor = await this.prisma.profesor.findUnique({ where: { id: dto.profesorId } });
      if (!profesor) {
        throw new NotFoundException('El profesor indicado no existe');
      }
    }

    return this.prisma.asignatura.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre.trim() }),
        ...(dto.semestre !== undefined && { semestre: dto.semestre }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
        ...(dto.profesorId && { profesorId: dto.profesorId }),
      },
      include: {
        profesor: {
          include: {
            usuario: true,
          },
        },
      },
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

  async obtenerPorProfesor(profesorId: string) {
    const profesor = await this.prisma.profesor.findUnique({ where: { id: profesorId } });

    if (!profesor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    return this.prisma.asignatura.findMany({
      where: { profesorId },
      include: {
        profesor: {
          include: {
            usuario: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
