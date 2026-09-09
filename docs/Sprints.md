# Sprints — plan detallado (7 días hábiles)

Asumo jornadas de ~8h en desarrollo, salvo Días 6 y 7 donde se reserva la
tarde para el informe.

## Sprint 1 (Día 1) — Fundación y backend base ✅ cerrado

**Objetivo:** repo, infraestructura y proyecto base listos.

1. Crear repo, estructura backend/frontend, `.gitignore`, README.
2. `docker-compose.yml` con Postgres, levantar contenedor, verificar conexión.
3. `nest new backend`, instalar Prisma, `class-validator`, `@nestjs/config`,
   `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt` (fijar
   `prisma@7.10.0` — la versión por defecto resolvió una release candidate
   de Prisma 8 con flujo distinto).
4. `schema.prisma` completo: `Usuario`, `Profesor`, `Estudiante`, `Carrera`,
   `Asignatura`, `Evaluacion`, `AccionCorrectiva`, `Invitacion`.

**Definición de hecho:** repo con commits ordenados, contenedor de Postgres
sano, dependencias instaladas, schema completo sin ejecutar migración aún
(pendiente para Día 2, en tu máquina, por el bloqueo de red del sandbox).

## Sprint 2 (Día 2) — Auth de 3 roles + invitaciones + Carrera

**Objetivo:** los 3 roles pueden registrarse por código y loguearse.

1. **(30 min)** Ejecutar migración inicial de Prisma en local, generar client.
2. **(30 min)** Seed: 1 carrera, 1 usuario admin/vicedecana (creado directo,
   no por invitación — es quien genera los códigos).
3. **(1 h)** Módulo Auth: endpoint de login, JWT strategy, `RolesGuard` +
   decorador `@Roles` soportando los 4 valores de rol.
4. **(45 min)** Endpoint `GET /me`: perfil según rol (incluye datos de
   `Profesor`/`Estudiante` si corresponde).
5. **(1 h)** `POST /invitaciones` (solo admin): genera código random +
   guarda el rol asociado.
6. **(45 min)** `GET /invitaciones/:codigo/validar` (público): existe, no
   usado, no expirado.
7. **(1.5 h)** `POST /registro` (público): valida código, crea `Usuario` +
   `Profesor`/`Estudiante` en una transacción, marca invitación como usada.
8. **(1 h)** CRUD de `Carrera` (nombre, plan), protegido a admin.
9. **(30 min)** Probar con Postman: generar invitación → registrarse con el
   código → loguear cada rol → `GET /me`.
10. **(15 min)** Commit y push.

**Definición de hecho:** puedo generar una invitación de profesor y una de
estudiante, registrarme con cada código, loguearme con las 3 cuentas
(incluida la admin del seed), y `GET /me` devuelve el perfil correcto según
el rol.

**Cierre del día (30–60 min):** redactar en el informe la sección de
roles/autenticación.

## Sprint 3 (Día 3) — Asignaturas, evaluaciones, acciones correctivas

**Objetivo:** toda la lógica académica funcionando en el backend.

1. **(1 h)** CRUD de `Asignatura` (nombre, semestre, profesor), admin.
2. **(45 min)** Endpoint de asignaturas propias del profesor (filtradas por
   su id).
3. **(1.5 h)** `Evaluacion` como **upsert**: si no existe fila para ese
   estudiante-asignatura la crea, si existe la actualiza (constraint
   `@@unique`). Protegido a profesor, solo sobre sus propias asignaturas.
4. **(45 min)** Endpoint de evaluaciones propias del estudiante.
5. **(1 h)** Endpoint de pendientes (admin): estudiantes con al menos una
   evaluación en estado `PENDIENTE`.
6. **(1.5 h)** CRUD de `AccionCorrectiva`: el profesor la crea (estudiante,
   asignatura, contenido, fecha) sobre sus propias asignaturas; no se puede
   editar ni borrar una vez creada.
7. **(45 min)** Endpoints de historial de acciones: por profesor (sus
   asignaturas) y por estudiante (las propias).
8. **(30 min)** Probar todo con Postman.
9. **(15 min)** Commit y push.

**Definición de hecho:** con Postman puedo simular el ciclo completo —
profesor crea una evaluación, la actualiza, registra una acción correctiva;
el estudiante consulta ambas; el admin ve el pendiente reflejado (o no,
según el estado actual).

**Cierre del día:** volcar el `schema.prisma` final al informe con su
justificación (capítulo de diseño de datos).

## Sprint 4 (Día 4) — Reporte backend + frontend base + panel admin

**Objetivo:** frontend arrancado, login y panel admin usables desde el
navegador.

1. **(45 min)** Endpoint de reporte filtrable (asignatura, profesor,
   semestre, municipio), admin.
2. **(30 min)** Probar el reporte con combinaciones de filtros.
3. **(45 min)** Setup frontend: Vite + React + TS, shadcn init, Tailwind,
   React Router, TanStack Query, React Hook Form + Zod.
4. **(1 h)** Pantalla pública de registro por código: valida el código y
   muestra el formulario según el rol que trae.
5. **(1 h)** Pantalla de login, guardar JWT, redirigir según rol (3
   destinos).
6. **(30 min)** Layout base + rutas protegidas por rol (`ProtectedRoute`).
7. **(1 h)** Panel admin: CRUD de Carreras.
8. **(1 h)** Panel admin: generar invitaciones + lista de códigos con
   estado (usado/no usado).
9. **(1 h)** Panel admin: CRUD de Asignaturas (select de profesor).
10. **(30 min)** Commit y prueba manual en el navegador.

**Definición de hecho:** desde el navegador, el admin crea una carrera,
genera un código de invitación, y alguien se registra con ese código y
loguea correctamente.

## Sprint 5 (Día 5) — Frontend profesor y estudiante

**Objetivo:** los 3 roles usan su pantalla completa desde el navegador.

1. **(1 h)** Panel profesor: lista de sus asignaturas.
2. **(1.5 h)** Panel profesor: evaluaciones por asignatura (tabla de
   estudiantes + editar evaluación, upsert).
3. **(1 h)** Panel profesor: registrar acción correctiva desde la ficha de
   un estudiante.
4. **(1 h)** Perfil estudiante: datos personales, carrera, municipio.
5. **(1 h)** Panel estudiante: sus evaluaciones por asignatura (solo
   lectura).
6. **(1 h)** Panel estudiante: historial de sus acciones correctivas (solo
   lectura).
7. **(1 h)** Pulido de loading/error states en las vistas nuevas.
8. **(30 min)** Commit y prueba manual con los 3 roles en el navegador.

**Definición de hecho:** los 3 roles se loguean y usan su panel completo sin
tocar el backend a mano.

## Sprint 6 (Día 6) — Reportes UI, QA e informe

**Mañana (dev, ~4 h):**
1. **(1 h)** Vista de pendientes (admin) con TanStack Table.
2. **(1.5 h)** Vista de reporte con filtros + tabla de resultados.
3. **(1 h)** QA cruzada de permisos: profesor no accede a rutas de
   admin/estudiante, estudiante no tiene ninguna acción de escritura — en
   frontend y en backend.
4. **(30 min)** Commit y prueba manual.

**Tarde (bloque fijo para el informe):** avanzar alcance, requisitos
funcionales y capítulo de diseño — gran parte ya está redactada en el
análisis de esta conversación, es cuestión de ordenarlo.

## Sprint 7 (Día 7) — Cierre

**Mañana (dev, ~4 h):**
1. **(1 h)** Datos demo realistas: 2 carreras, 3–4 profesores, 15–20
   estudiantes, evaluaciones y acciones variadas.
2. **(1 h)** Bugs de última hora y pulido visual final.
3. **(1.5 h)** Ensayo completo del guion de demo con los 3 roles logueándose
   en vivo, cronometrado.
4. **(30 min)** Buffer.

**Tarde:** cerrar el informe (resultados, conclusiones, roadmap a 4to año) y
entrega final.

**Definición de hecho general:** demo corrida de punta a punta sin errores,
con los 3 roles, alcance explicado con claridad frente al tribunal, e
informe entregado.
