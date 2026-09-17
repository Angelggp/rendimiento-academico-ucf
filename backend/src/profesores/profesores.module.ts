import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProfesoresController } from './profesores.controller.js';
import { ProfesoresService } from './profesores.service.js';

@Module({
  imports: [PrismaModule, PassportModule, AuthModule],
  controllers: [ProfesoresController],
  providers: [ProfesoresService, JwtAuthGuard],
  exports: [ProfesoresService],
})
export class ProfesoresModule {}
