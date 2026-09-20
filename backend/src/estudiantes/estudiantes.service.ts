import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

const INCLUDE_ESTUDIANTE = {
  usuario: {
    select: {
      id: true,
      email: true,
      nombre: true,
      apellidos: true,
      rol: true,
      activo: true,
      telefono: true,
    },
  },
  carrera: true,
} as const;

@Injectable()
export class EstudiantesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    telefono?: string;
    carreraId: string;
    carnetIdentidad: string;
    municipio: 'CIENFUEGOS' | 'ABREUS' | 'CRUCES' | 'CUMANAYAGUA' | 'LAJAS' | 'PALMIRA' | 'RODAS' | 'AGUADA_DE_PASAJEROS';
    observaciones?: string | null;
  }) {
    const email = dto.email.trim().toLowerCase();

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new BadRequestException('El correo ya existe');
    }

    const carnetExistente = await this.prisma.estudiante.findUnique({
      where: { carnetIdentidad: dto.carnetIdentidad },
    });

    if (carnetExistente) {
      throw new BadRequestException('El carné de identidad ya está registrado');
    }

    const passwordHasheada = await bcrypt.hash(dto.password, 10);

    const estudiante = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          email,
          password: passwordHasheada,
          nombre: dto.nombre,
          apellidos: dto.apellidos,
          rol: 'ESTUDIANTE',
          telefono: dto.telefono,
        },
      });

      return tx.estudiante.create({
        data: {
          usuarioId: usuario.id,
          carreraId: dto.carreraId,
          carnetIdentidad: dto.carnetIdentidad,
          municipio: dto.municipio,
          observaciones: dto.observaciones ?? null,
        },
        include: INCLUDE_ESTUDIANTE,
      });
    });

    return estudiante;
  }

  async listar() {
    return this.prisma.estudiante.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellidos: true,
            rol: true,
            activo: true,
            telefono: true,
          },
        },
        carrera: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPorId(id: string, usuarioActual?: any) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellidos: true,
            rol: true,
            activo: true,
            telefono: true,
          },
        },
        carrera: true,
      },
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
      throw new ForbiddenException('No tienes permisos para consultar este estudiante');
    }

    return estudiante;
  }

  async actualizar(
    id: string,
    dto: {
      carreraId?: string;
      carnetIdentidad?: string;
      municipio?: 'CIENFUEGOS' | 'ABREUS' | 'CRUCES' | 'CUMANAYAGUA' | 'LAJAS' | 'PALMIRA' | 'RODAS' | 'AGUADA_DE_PASAJEROS';
      observaciones?: string | null;
    },
    usuarioActual?: any,
  ) {
    const estudiante = await this.prisma.estudiante.findUnique({ where: { id } });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (
      usuarioActual &&
      usuarioActual.rol !== 'VICEDECANO' &&
      usuarioActual.id !== estudiante.usuarioId
    ) {
      throw new ForbiddenException(
        'No tienes permisos para modificar este estudiante',
      );
    }

    if (dto.carnetIdentidad && dto.carnetIdentidad !== estudiante.carnetIdentidad) {
      const carnetExistente = await this.prisma.estudiante.findUnique({
        where: { carnetIdentidad: dto.carnetIdentidad },
      });

      if (carnetExistente) {
        throw new BadRequestException('El carné de identidad ya está registrado');
      }
    }

    return this.prisma.estudiante.update({
      where: { id },
      data: {
        ...(dto.carreraId && { carreraId: dto.carreraId }),
        ...(dto.carnetIdentidad && { carnetIdentidad: dto.carnetIdentidad }),
        ...(dto.municipio && { municipio: dto.municipio }),
        ...(dto.observaciones !== undefined && { observaciones: dto.observaciones }),
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellidos: true,
            rol: true,
            activo: true,
            telefono: true,
          },
        },
        carrera: true,
      },
    });
  }

  async crearDesdeUsuario(usuarioId: string, dto: {
    carreraId: string;
    carnetIdentidad: string;
    municipio: 'CIENFUEGOS' | 'ABREUS' | 'CRUCES' | 'CUMANAYAGUA' | 'LAJAS' | 'PALMIRA' | 'RODAS' | 'AGUADA_DE_PASAJEROS';
    observaciones?: string | null;
  }) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const yaExiste = await this.prisma.estudiante.findUnique({
      where: { usuarioId },
    });

    if (yaExiste) {
      throw new BadRequestException('Este usuario ya tiene perfil de estudiante');
    }

    if (!dto.carreraId || !dto.carnetIdentidad || !dto.municipio) {
      throw new BadRequestException('Faltan datos del perfil del estudiante');
    }

    const carnetExistente = await this.prisma.estudiante.findUnique({
      where: { carnetIdentidad: dto.carnetIdentidad },
    });

    if (carnetExistente) {
      throw new BadRequestException('El carné de identidad ya está registrado');
    }

    return this.prisma.estudiante.create({
      data: {
        usuarioId,
        carreraId: dto.carreraId,
        carnetIdentidad: dto.carnetIdentidad,
        municipio: dto.municipio,
        observaciones: dto.observaciones ?? null,
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellidos: true,
            rol: true,
            activo: true,
            telefono: true,
          },
        },
        carrera: true,
      },
    });
  }
}
