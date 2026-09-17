import { describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  it('debe devolver un token de acceso y el usuario autenticado', async () => {
    const passwordHash = await bcrypt.hash('secret123', 10);
    const prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'usuario-1',
          email: 'admin@ucf.edu.cu',
          password: passwordHash,
          nombre: 'Admin',
          apellidos: 'UCF',
          rol: 'ADMIN',
          activo: true,
          telefono: null,
          estudiante: null,
          profesor: null,
        }),
      },
    } as any;
    const jwtService = {
      sign: vi.fn().mockReturnValue('token-123'),
    } as any;

    const servicio = new AuthService(prisma, jwtService);

    const resultado = await servicio.login({
      email: 'admin@ucf.edu.cu',
      password: 'secret123',
    });

    expect(resultado).toHaveProperty('access_token', 'token-123');
    expect(resultado).toHaveProperty('usuario');
    expect(resultado.usuario.email).toBe('admin@ucf.edu.cu');
    expect(resultado.usuario.rol).toBe('ADMIN');
  });
});
