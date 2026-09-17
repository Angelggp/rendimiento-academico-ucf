import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

export type LoginPayload = {
  email: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        estudiante: true,
        profesor: true,
      },
    });

    if (!usuario || !usuario.activo) {
      return null;
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecta) {
      return null;
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  async login(payload: LoginPayload) {
    const usuario = await this.validateUser(payload.email, payload.password);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = this.jwtService.sign({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return {
      access_token: accessToken,
      usuario,
    };
  }
}
