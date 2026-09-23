import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

function esBisiesto(anio: number) {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

// El carné de identidad cubano codifica la fecha de nacimiento en sus
// primeros 6 dígitos (AAMMDD); si la persona nació en el año 2000 o
// después, se le suma 40 al mes (ej. mes 41 = enero de 2000+).
function fechaDeCarnetEsValida(carnetIdentidad: string): boolean {
  const mesCrudo = Number(carnetIdentidad.slice(2, 4));
  const dia = Number(carnetIdentidad.slice(4, 6));
  const mes = mesCrudo > 40 ? mesCrudo - 40 : mesCrudo;
  const anio = Number(carnetIdentidad.slice(0, 2)) + (mesCrudo > 40 ? 2000 : 1900);

  if (mes < 1 || mes > 12) {
    return false;
  }

  const diasPorMes = [31, esBisiesto(anio) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dia >= 1 && dia <= diasPorMes[mes - 1];
}

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

  private validarCarnetIdentidad(carnetIdentidad: string) {
    if (!fechaDeCarnetEsValida(carnetIdentidad)) {
      throw new BadRequestException(
        'El carné de identidad no corresponde a una fecha de nacimiento válida',
      );
    }
  }

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

    this.validarCarnetIdentidad(dto.carnetIdentidad);

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
      this.validarCarnetIdentidad(dto.carnetIdentidad);

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

    this.validarCarnetIdentidad(dto.carnetIdentidad);

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
