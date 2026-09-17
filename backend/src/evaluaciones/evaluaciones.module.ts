import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { EvaluacionesController } from './evaluaciones.controller.js';
import { EvaluacionesService } from './evaluaciones.service.js';

@Module({
  imports: [PrismaModule, PassportModule, AuthModule],
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService, JwtAuthGuard],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}
