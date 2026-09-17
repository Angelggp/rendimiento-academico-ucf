import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesPermitidos || rolesPermitidos.length === 0) {
      return true;
    }

    const solicitud = context.switchToHttp().getRequest();
    const usuario = solicitud.user;

    if (!usuario?.rol) {
      return false;
    }

    const rolUsuario = String(usuario.rol).toUpperCase();
    const rolesEsperados = rolesPermitidos.map((rol) => rol.toUpperCase());

    return rolesEsperados.includes(rolUsuario);
  }
}
