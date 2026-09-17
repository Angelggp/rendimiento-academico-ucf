import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProfesoresService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.profesor.findMany({
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
        asignaturas: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenerPorId(id: string, usuarioActual?: any) {
    const profesor = await this.prisma.profesor.findUnique({
      where: { id },
      include: {
        usuario: true,
        asignaturas: true,
      },
    });

    if (!profesor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    if (
      usuarioActual &&
      usuarioActual.rol !== 'ADMIN' &&
      usuarioActual.rol !== 'VICEDECANO' &&
      usuarioActual.id !== profesor.usuarioId
    ) {
      throw new ForbiddenException('No tienes permisos para consultar este profesor');
    }

    return profesor;
  }

  async crearDesdeUsuario(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const profesorExistente = await this.prisma.profesor.findUnique({
      where: { usuarioId },
    });

    if (profesorExistente) {
      throw new BadRequestException('Este usuario ya tiene perfil de profesor');
    }

    return this.prisma.profesor.create({
      data: { usuarioId },
      include: { usuario: true },
    });
  }

  async actualizar(id: string, dto: { usuarioId?: string; telefono?: string }) {
    const profesor = await this.prisma.profesor.findUnique({ where: { id } });

    if (!profesor) {
      throw new NotFoundException('Profesor no encontrado');
    }

    return this.prisma.profesor.update({
      where: { id },
      data: {
        ...(dto.usuarioId && { usuarioId: dto.usuarioId }),
      },
      include: {
        usuario: true,
        asignaturas: true,
      },
    });
  }
}
