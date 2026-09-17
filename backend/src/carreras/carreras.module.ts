import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CarrerasController } from './carreras.controller.js';
import { CarrerasService } from './carreras.service.js';

@Module({
  imports: [PrismaModule, PassportModule, AuthModule],
  controllers: [CarrerasController],
  providers: [CarrerasService, JwtAuthGuard],
  exports: [CarrerasService],
})
export class CarrerasModule {}
