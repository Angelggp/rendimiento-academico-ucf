import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { EstudiantesController } from './estudiantes.controller.js';
import { EstudiantesService } from './estudiantes.service.js';

@Module({
  imports: [PrismaModule, PassportModule, AuthModule],
  controllers: [EstudiantesController],
  providers: [EstudiantesService, JwtAuthGuard],
  exports: [EstudiantesService],
})
export class EstudiantesModule {}
