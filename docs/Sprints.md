Aquí tienes los sprints con el detalle de tareas, estimados de tiempo y criterio de "hecho" para cada uno. Asumo jornadas de ~8h.

## Sprint 1 (Día 1) — Fundación y backend base

**Objetivo:** loguearse por Postman con JWT y hacer CRUD de estudiantes/asignaturas respetando rol.

1. **(30 min)** Crear repo, estructura de carpetas backend/frontend, `.gitignore`, README breve.
2. **(30 min)** `docker-compose.yml` con Postgres, levantar contenedor, verificar conexión.
3. **(45 min)** `nest new backend`, instalar Prisma, `@nestjs/config`, `class-validator`, `passport-jwt`, `bcrypt`.
4. **(1 h)** Diseñar `schema.prisma` completo: `Usuario` (email, password, rol), `Municipio`, `Estudiante` (nombre, municipio, observaciones), `Profesor`, `Asignatura` (nombre, profesor, semestre), `Evaluacion` (estudiante, asignatura, estado, fecha). Ejecutar la migración inicial.
5. **(30 min)** Seed: municipios reales de Cienfuegos, 2 usuarios de prueba (admin y profesor), datos demo mínimos.
6. **(1.5 h)** Módulo Auth: endpoint de login, generación de JWT, estrategia `passport-jwt`, `RolesGuard` + decorador `@Roles`.
7. **(1 h)** `nest g resource estudiantes` — ajustar DTOs, validaciones, proteger con `@Roles('admin')`.
8. **(1 h)** `nest g resource asignaturas` — igual, con relación a profesor.
9. **(30 min)** Probar todos los endpoints con Postman/Thunder Client.
10. **(15 min)** Commit, push, checklist de fin de día.

**Definición de hecho:** con el JWT del admin puedo crear/editar/borrar estudiantes y asignaturas; con el JWT de profesor esos mismos endpoints devuelven 403.

## Sprint 2 (Día 2) — Lógica de negocio y frontend base

**Objetivo:** evaluaciones y reportes funcionando en backend, y frontend con login + CRUD conectado.

1. **(1 h)** `nest g resource evaluaciones`, relación estudiante–asignatura, estado como enum (`APROBADA`/`PENDIENTE`).
2. **(45 min)** Endpoint de pendientes: estudiantes con al menos una evaluación en estado `PENDIENTE` (join, sin campo manual).
3. **(45 min)** Endpoint de reporte con filtros por query param (asignatura, profesor, semestre, municipio).
4. **(30 min)** Probar los 3 endpoints nuevos con distintas combinaciones de filtros.
5. **(30 min)** Setup frontend: Vite + React + TS, `shadcn/ui init`, Tailwind, React Router, TanStack Query, React Hook Form + Zod.
6. **(1 h)** Pantalla de login (RHF+Zod), guardar JWT, redirigir según rol.
7. **(30 min)** Layout base con rutas protegidas (`ProtectedRoute` que valida el rol del token).
8. **(1 h)** Pantalla Estudiantes: tabla (shadcn) + formulario CRUD con TanStack Query.
9. **(1 h)** Pantalla Asignaturas: igual, con select de profesor y semestre.
10. **(30 min)** Commit y prueba manual del flujo login → CRUD en el navegador.

**Definición de hecho:** logueado como admin en el navegador, puedo crear/editar/borrar estudiantes y asignaturas desde la UI.

## Sprint 3 (Día 3) — Reportes, pulido y demo

**Objetivo:** demo completa end-to-end, ambos roles probados, alcance documentado para la defensa.

1. **(1 h)** Pantalla Evaluaciones (vista profesor): lista de estudiantes de su asignatura, marcar aprobada/pendiente.
2. **(45 min)** Pantalla Pendientes (vista admin): tabla con TanStack Table.
3. **(1 h)** Pantalla Reporte: filtros (selects) + tabla de resultados, exportar a CSV si sobra tiempo.
4. **(45 min)** Cargar datos demo realistas (10–15 estudiantes, 4–5 asignaturas, 2–3 profesores, evaluaciones variadas).
5. **(1 h)** Pulido: loading/error states, toasts de éxito, revisar textos en español.
6. **(45 min)** Verificar permisos cruzados: profesor no puede entrar a rutas de admin, ni en frontend ni en backend.
7. **(1 h)** Ensayo completo del guion de demo (login profesor → registra evaluación → login admin → ve pendientes → genera reporte), cronometrado.
8. **(30 min)** Redactar el párrafo de "alcance de esta fase y roadmap a 4to año" para la defensa.
9. **(30 min)** Buffer para bugs de último momento.

**Definición de hecho:** demo corrida de punta a punta sin errores, con los dos roles, y el alcance explicado con claridad frente al tribunal.

