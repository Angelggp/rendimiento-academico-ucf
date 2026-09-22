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

  async listar(filtros?: {
    asignaturaId?: string;
    profesorId?: string;
    semestre?: number;
    municipio?: 'CIENFUEGOS' | 'ABREUS' | 'CRUCES' | 'CUMANAYAGUA' | 'LAJAS' | 'PALMIRA' | 'RODAS' | 'AGUADA_DE_PASAJEROS';
    estado?: 'APROBADA' | 'PENDIENTE';
  }) {
    return this.prisma.evaluacion.findMany({
      where: {
        estado: filtros?.estado,
        estudiante: filtros?.municipio ? { municipio: filtros.municipio } : undefined,
        asignatura:
          filtros?.asignaturaId || filtros?.profesorId || filtros?.semestre !== undefined
            ? {
                id: filtros.asignaturaId,
                profesorId: filtros.profesorId,
                semestre: filtros.semestre,
              }
            : undefined,
      },
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
    fecha?: Date;
    observaciones?: string | null;
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
      include: { profesor: true, carreras: { select: { id: true } } },
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

    if (!asignatura.carreras.some((carrera) => carrera.id === estudiante.carreraId)) {
      throw new BadRequestException(
        'El estudiante no pertenece a una carrera que cursa esta asignatura',
      );
    }

    if (dto.calificacion !== undefined && dto.calificacion !== null) {
      if (!Number.isInteger(dto.calificacion) || dto.calificacion < 0 || dto.calificacion > 5) {
        throw new BadRequestException('La calificación debe estar entre 0 y 5');
      }
    }

    const calificacion = dto.calificacion ?? null;
    const estado: 'APROBADA' | 'PENDIENTE' =
      calificacion !== null && calificacion >= 3 ? 'APROBADA' : 'PENDIENTE';
    const observaciones = dto.observaciones?.trim() ? dto.observaciones.trim() : null;
    const data = {
      estudianteId: dto.estudianteId,
      asignaturaId: dto.asignaturaId,
      calificacion,
      estado,
      observaciones,
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
        observaciones: data.observaciones,
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
