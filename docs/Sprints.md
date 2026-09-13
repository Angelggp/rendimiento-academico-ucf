# Sprints — plan detallado (7 días hábiles)

Asumo jornadas de ~8h en desarrollo, salvo Días 6 y 7 donde se reserva la
tarde para el informe. Alcance: RF-01 a RF-07. RF-08 a RF-10 quedan
documentados como pendientes, no se implementan en esta entrega.

## Sprint 1 (Día 1) — Fundación y backend base ✅ cerrado

**Objetivo:** repo, infraestructura y proyecto base listos.

1. Crear repo, estructura backend/frontend, `.gitignore`, README.
2. `docker-compose.yml` con Postgres, levantar contenedor, verificar conexión.
3. `nest new backend`, instalar Prisma, `class-validator`, `@nestjs/config`,
   `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt` (fijar
   `prisma@7.10.0` — la versión por defecto resolvió una release candidate
   de Prisma 8 con flujo distinto).
4. `schema.prisma` completo: `Usuario`, `Profesor`, `Estudiante`, `Carrera`,
   `Asignatura`, `Evaluacion`. Sin `Invitacion` ni `AccionCorrectiva` — no
   corresponden a RF-01/07 (la segunda es RF-08, pendiente).

**Definición de hecho:** repo con commits ordenados, contenedor de Postgres
sano, dependencias instaladas, schema completo sin ejecutar migración aún
(pendiente para Día 2, en tu máquina, por el bloqueo de red del sandbox).

## Sprint 2 (Día 2) — Auth de 4 roles + gestión de usuarios + carreras

**Objetivo:** los 4 roles pueden loguearse, y el administrador gestiona
cuentas.

1. **(30 min)** Ejecutar migración inicial de Prisma en local, generar client.
2. **(30 min)** Seed: 1 carrera, 1 usuario admin y 1 usuario vicedecana
   (creados directo, son las cuentas raíz del sistema).
3. **(1 h)** Módulo Auth: endpoint de login, JWT strategy, `RolesGuard` +
   decorador `@Roles` soportando los 4 valores de rol.
4. **(45 min)** Endpoint `GET /me`: perfil según rol (incluye datos de
   `Profesor`/`Estudiante` si existen).
5. **(1.5 h)** `RF-02 Gestionar usuarios` (admin): registrar cuenta con
   datos mínimos (nombre, apellidos, email, contraseña, rol), habilitar,
   deshabilitar y asignar/reasignar rol.
6. **(1 h)** `RF-03 Gestionar carreras` (vicedecana): CRUD completo
   (nombre, plan, deshabilitar).
7. **(45 min)** Lógica de "perfil incompleto": si el usuario tiene rol
   `ESTUDIANTE` y no existe su fila de `Estudiante`, el endpoint `GET /me`
   lo señala para que el frontend lo mande a completar perfil.
8. **(45 min)** Probar con Postman: admin registra profesor y estudiante,
   loguea cada uno, `GET /me` refleja el perfil incompleto del estudiante.
9. **(15 min)** Commit y push.

**Definición de hecho:** el admin puede registrar, habilitar, deshabilitar
y reasignar el rol de una cuenta; la vicedecana puede hacer CRUD de
carreras; los 4 roles se loguean correctamente.

**Cierre del día (30–60 min):** redactar en el informe la sección de
roles/autenticación y la tabla de responsabilidades por rol.

## Sprint 3 (Día 3) — Estudiantes, profesores, asignaturas

**Objetivo:** toda la gestión académica de catálogo lista.

1. **(1 h)** `RF-04 Gestionar estudiantes` (vicedecana): consultar y editar
   información — este mismo endpoint es el que usa el estudiante para
   completar su perfil la primera vez que se loguea.
2. **(1 h)** `RF-05 Gestionar profesores` (vicedecana): consultar y editar.
3. **(1.5 h)** `RF-06 Gestionar asignaturas` (admin, como catálogo
   técnico): CRUD completo, vinculada a profesor y semestre.
4. **(45 min)** Endpoint de asignaturas propias del profesor (filtradas por
   su id) — necesario para el panel de profesor del Día 5.
5. **(45 min)** Estudiante completa su perfil la primera vez (carrera,
   carnet de identidad, municipio) usando el endpoint de RF-04.
6. **(1 h)** Probar todo con Postman: alta de estudiante mínima → primer
   login → completar perfil → consulta desde vicedecana.
7. **(1 h)** Buffer / revisar validaciones (unicidad de carnet, email).
8. **(15 min)** Commit y push.

**Definición de hecho:** un estudiante recién creado por el admin puede
loguearse, completar su perfil, y la vicedecana lo ve reflejado en su
consulta de estudiantes.

**Cierre del día:** volcar el `schema.prisma` final al informe con su
justificación (capítulo de diseño de datos).

## Sprint 4 (Día 4) — Evaluaciones (backend) + frontend base + panel admin

**Objetivo:** frontend arrancado, login y panel admin usables desde el
navegador.

1. **(1.5 h)** `RF-07 Gestionar evaluaciones`: upsert (crea si no existe la
   fila para ese estudiante-asignatura, actualiza si ya existe), protegido
   a profesor sobre sus propias asignaturas.
2. **(45 min)** Endpoint de evaluaciones propias del estudiante.
3. **(30 min)** Probar los endpoints de evaluación con Postman.
4. **(45 min)** Setup frontend: Vite + React + TS, shadcn init, Tailwind,
   React Router, TanStack Query, React Hook Form + Zod.
5. **(1 h)** Pantalla de login, guardar JWT, redirigir según rol (4
   destinos).
6. **(30 min)** Layout base + rutas protegidas por rol (`ProtectedRoute`).
7. **(1 h)** Panel admin: gestión de usuarios (registrar, habilitar,
   deshabilitar, asignar rol).
8. **(1 h)** Panel admin: CRUD de asignaturas (select de profesor).
9. **(30 min)** Commit y prueba manual en el navegador.

**Definición de hecho:** desde el navegador, el admin registra una cuenta,
la habilita/deshabilita, y crea una asignatura vinculada a un profesor.

## Sprint 5 (Día 5) — Frontend vicedecana y profesor + perfil incompleto

**Objetivo:** vicedecana y profesor usan su pantalla completa; el flujo de
perfil incompleto del estudiante queda resuelto en el frontend.

1. **(1 h)** Panel vicedecana: CRUD de carreras.
2. **(1 h)** Panel vicedecana: consulta y edición de estudiantes.
3. **(1 h)** Panel vicedecana: consulta y edición de profesores.
4. **(1 h)** Panel profesor: lista de sus asignaturas.
5. **(1.5 h)** Panel profesor: evaluaciones por asignatura (tabla de
   estudiantes + editar evaluación, upsert).
6. **(1 h)** Pantalla "completa tu perfil" para el estudiante: se muestra
   automáticamente si `GET /me` señala perfil incompleto.
7. **(30 min)** Commit y prueba manual con los 4 roles en el navegador.

**Definición de hecho:** vicedecana y profesor usan su panel completo; un
estudiante nuevo es redirigido a completar su perfil antes de ver el resto
del sistema.

## Sprint 6 (Día 6) — Panel estudiante, QA e informe

**Mañana (dev, ~4 h):**
1. **(1 h)** Panel estudiante: perfil propio (datos, carrera, municipio).
2. **(1 h)** Panel estudiante: sus evaluaciones por asignatura (solo
   lectura).
3. **(1.5 h)** QA cruzada de permisos entre los 4 roles: cada uno solo
   accede a lo suyo, en frontend y en backend.
4. **(30 min)** Commit y prueba manual.

**Tarde (bloque fijo para el informe):** avanzar alcance, requisitos
funcionales (incluyendo la nota de RF-08/09/10 como pendientes) y capítulo
de diseño.

## Sprint 7 (Día 7) — Cierre

**Mañana (dev, ~4 h):**
1. **(1 h)** Datos demo realistas: 2 carreras, 3–4 profesores, 15–20
   estudiantes (algunos con perfil completo, alguno sin completar para
   mostrar ese flujo en la demo), evaluaciones variadas.
2. **(1 h)** Bugs de última hora y pulido visual final.
3. **(1.5 h)** Ensayo completo del guion de demo con los 4 roles
   logueándose en vivo, cronometrado.
4. **(30 min)** Buffer.

**Tarde:** cerrar el informe (resultados, conclusiones, RF-08/09/10 y
recomendaciones futuras como roadmap) y entrega final.

**Definición de hecho general:** demo corrida de punta a punta sin errores,
con los 4 roles, alcance explicado con claridad frente al tribunal
(incluyendo por qué RF-08/09/10 quedan documentados y no implementados), e
informe entregado.s