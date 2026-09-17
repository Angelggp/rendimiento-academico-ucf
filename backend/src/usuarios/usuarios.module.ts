import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';

@Module({
  imports: [PrismaModule, PassportModule, AuthModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, JwtAuthGuard],
  exports: [UsuariosService],
})
export class UsuariosModule {}
