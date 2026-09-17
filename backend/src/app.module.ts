import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AsignaturasModule } from './asignaturas/asignaturas.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CarrerasModule } from './carreras/carreras.module.js';
import configuration from './config/configuration.js';
import { EstudiantesModule } from './estudiantes/estudiantes.module.js';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfesoresModule } from './profesores/profesores.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    CarrerasModule,
    EstudiantesModule,
    ProfesoresModule,
    AsignaturasModule,
    EvaluacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
