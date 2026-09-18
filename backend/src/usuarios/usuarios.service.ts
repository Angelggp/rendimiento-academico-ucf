import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    rol: 'ADMIN' | 'VICEDECANO' | 'PROFESOR' | 'ESTUDIANTE';
    telefono?: string;
  }) {
    const email = dto.email.trim().toLowerCase();

    if (!email || !dto.password || !dto.nombre || !dto.apellidos) {
      throw new BadRequestException('Faltan datos obligatorios');
    }

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new BadRequestException('El correo ya existe');
    }

    const passwordHasheada = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.$transaction(async (tx) => {
      const creado = await tx.usuario.create({
        data: {
          email,
          password: passwordHasheada,
          nombre: dto.nombre,
          apellidos: dto.apellidos,
          rol: dto.rol,
          telefono: dto.telefono,
        },
      });

      if (dto.rol === 'PROFESOR') {
        await tx.profesor.create({ data: { usuarioId: creado.id } });
      }

      return creado;
    });

    const { password: _, ...resultado } = usuario;
    return resultado;
  }

  async listar(rol?: string) {
    const filtro = rol ? { rol: rol.toUpperCase() as any } : undefined;

    return this.prisma.usuario.findMany({
      where: filtro,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
        rol: true,
        activo: true,
        telefono: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async obtenerPorId(id: string, usuarioActual?: any) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        estudiante: true,
        profesor: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (
      usuarioActual &&
      usuarioActual.rol !== 'ADMIN' &&
      usuarioActual.rol !== 'VICEDECANO' &&
      usuarioActual.id !== usuario.id
    ) {
      throw new ForbiddenException('No tienes permisos para ver este usuario');
    }

    const { password: _, ...resultado } = usuario;
    return resultado;
  }

  async actualizar(
    id: string,
    dto: {
      email?: string;
      nombre?: string;
      apellidos?: string;
      rol?: 'ADMIN' | 'VICEDECANO' | 'PROFESOR' | 'ESTUDIANTE';
      activo?: boolean;
      telefono?: string;
    },
    usuarioActual?: any,
  ) {
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuarioActual && usuarioActual.id === id) {
      if (dto.rol && dto.rol !== usuarioExistente.rol) {
        throw new BadRequestException('No puedes cambiar tu propio rol');
      }
      if (dto.activo === false) {
        throw new BadRequestException('No puedes deshabilitar tu propia cuenta');
      }
    }

    const datosActualizar: any = { ...dto };

    if (dto.email) {
      datosActualizar.email = dto.email.trim().toLowerCase();
    }

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id },
      data: datosActualizar,
    });

    const { password: _, ...resultado } = usuarioActualizado;
    return resultado;
  }

  async deshabilitar(id: string, usuarioActual?: any) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuarioActual && usuarioActual.id === id) {
      throw new BadRequestException('No puedes deshabilitar tu propia cuenta');
    }

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }
}
