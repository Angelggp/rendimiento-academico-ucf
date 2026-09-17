import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EvaluacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.evaluacion.findMany({
      include: {
        estudiante: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
              },
            },
            carrera: true,
          },
        },
        asignatura: {
          include: {
            profesor: {
              include: { usuario: true },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPorId(id: string) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { id },
      include: {
        estudiante: {
          include: {
            usuario: true,
            carrera: true,
          },
        },
        asignatura: {
          include: {
            profesor: {
              include: { usuario: true },
            },
          },
        },
      },
    });

    if (!evaluacion) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    return evaluacion;
  }

  async registrar(dto: {
    estudianteId: string;
    asignaturaId: string;
    calificacion?: number | null;
    estado?: 'APROBADA' | 'PENDIENTE';
    fecha?: Date;
  }, usuarioActual?: any) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: dto.estudianteId },
      include: { usuario: true },
    });

    if (!estudiante) {
      throw new NotFoundException('El estudiante no existe');
    }

    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id: dto.asignaturaId },
      include: { profesor: true },
    });

    if (!asignatura) {
      throw new NotFoundException('La asignatura no existe');
    }

    if (
      usuarioActual &&
      usuarioActual.rol === 'PROFESOR' &&
      asignatura.profesor.usuarioId !== usuarioActual.id
    ) {
      throw new ForbiddenException('No puedes registrar evaluaciones de otra asignatura');
    }

    const estadosValidos = ['APROBADA', 'PENDIENTE'];
    if (dto.estado && !estadosValidos.includes(dto.estado)) {
      throw new BadRequestException('El estado de la evaluación no es válido');
    }

    if (dto.calificacion !== undefined && dto.calificacion !== null) {
      if (!Number.isInteger(dto.calificacion) || dto.calificacion < 0 || dto.calificacion > 100) {
        throw new BadRequestException('La calificación debe estar entre 0 y 100');
      }
    }

    const data = {
      estudianteId: dto.estudianteId,
      asignaturaId: dto.asignaturaId,
      calificacion: dto.calificacion ?? null,
      estado: dto.estado ?? 'PENDIENTE',
      fecha: dto.fecha ?? new Date(),
    };

    return this.prisma.evaluacion.upsert({
      where: {
        estudianteId_asignaturaId: {
          estudianteId: dto.estudianteId,
          asignaturaId: dto.asignaturaId,
        },
      },
      update: {
        calificacion: data.calificacion,
        estado: data.estado,
        fecha: data.fecha,
      },
      create: data,
      include: {
        estudiante: { include: { usuario: true, carrera: true } },
        asignatura: { include: { profesor: { include: { usuario: true } } } },
      },
    });
  }

  async listarPorEstudiante(estudianteId: string, usuarioActual?: any) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: { usuario: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (
      usuarioActual &&
      usuarioActual.rol !== 'ADMIN' &&
      usuarioActual.rol !== 'VICEDECANO' &&
      usuarioActual.id !== estudiante.usuarioId
    ) {
      throw new ForbiddenException('No tienes permisos para consultar estas evaluaciones');
    }

    return this.prisma.evaluacion.findMany({
      where: { estudianteId },
      include: {
        asignatura: {
          include: { profesor: { include: { usuario: true } } },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async listarPorAsignatura(asignaturaId: string, usuarioActual?: any) {
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id: asignaturaId },
      include: { profesor: { include: { usuario: true } } },
    });

    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    if (
      usuarioActual &&
      usuarioActual.rol === 'PROFESOR' &&
      asignatura.profesor.usuarioId !== usuarioActual.id
    ) {
      throw new ForbiddenException('No puedes consultar evaluaciones ajenas');
    }

    return this.prisma.evaluacion.findMany({
      where: { asignaturaId },
      include: {
        estudiante: {
          include: {
            usuario: true,
            carrera: true,
          },
        },
        asignatura: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }
}
