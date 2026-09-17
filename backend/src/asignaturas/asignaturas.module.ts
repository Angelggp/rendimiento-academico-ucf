import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AsignaturasController } from './asignaturas.controller.js';
import { AsignaturasService } from './asignaturas.service.js';

@Module({
  imports: [PrismaModule, PassportModule, AuthModule],
  controllers: [AsignaturasController],
  providers: [AsignaturasService, JwtAuthGuard],
  exports: [AsignaturasService],
})
export class AsignaturasModule {}
