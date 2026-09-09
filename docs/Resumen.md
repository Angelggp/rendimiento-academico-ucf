Acá va el resumen corregido con todo lo que definimos desde ese primer mensaje — cambiaron los roles, el alcance de evaluaciones/acciones correctivas, y el tiempo real disponible.

## De qué va el proyecto

Es un sistema para la Facultad de Ingeniería de la Universidad de Cienfuegos que digitaliza el control del rendimiento académico en la modalidad semipresencial. Hoy todo se lleva en planillas, papel y correos, y eso genera problemas concretos: no se detecta a tiempo quién no termina el semestre, no hay seguimiento de quién abandona grupos colaborativos, no hay visibilidad del estado de evaluaciones por asignatura, no se puede filtrar por municipio de procedencia, y no hay reportes cruzados de asignatura–profesor–semestre.

El documento original define 8 funcionalidades y 6 actores (Vicedecana, Profesor, Jefe de carrera, Decano, Estudiante, Administrador) — un sistema completo de gestión académica, imposible de hacer bien en el tiempo disponible. La estrategia sigue siendo la misma: recortar sin mentir sobre el alcance, y documentar explícitamente qué queda para la continuidad en 4to año.

## Alcance MVP (revisado)

**Roles** — 3 roles funcionales reales (Administrador y Vicedecana son el mismo nivel de acceso, con dos nombres):
- **Administrador/Vicedecana**: acceso total — carreras, asignaturas, invitaciones, pendientes y reportes.
- **Profesor**: solo ve y gestiona sus asignaturas, sus evaluaciones y sus acciones correctivas.
- **Estudiante**: acceso de solo lectura a su propio perfil, evaluaciones y acciones correctivas.

**Módulos:**
1. Autenticación por **código de invitación** — el admin genera un código con el rol, profesor/estudiante se registran ellos mismos con ese código (alta manual queda como respaldo).
2. Gestión de carreras (CRUD, con plan de estudio).
3. Gestión de asignaturas (CRUD, vinculada a profesor y semestre).
4. Registro de evaluaciones: **una fila por estudiante-asignatura** que se actualiza a lo largo del semestre (no se acumula historial), con estado aprobada/pendiente.
5. **Bitácora de acciones correctivas completa** — el profesor registra cada acción (texto, fecha), queda como historial inmutable, visible por el estudiante afectado.
6. Vista de "estudiantes pendientes" — derivada del estado de las evaluaciones, no un módulo aparte.
7. Reporte filtrable por asignatura–profesor–semestre–municipio.
8. Perfil propio para los 3 roles, con vista de solo lectura para el estudiante.

## Fuera de alcance (para 4to año)

- Trazabilidad de grupos colaborativos (requiere modelar grupos, se pospone).
- Roles de Jefe de carrera y Decano (solo lectura extra sobre lo que ya existe).
- Reportes geográficos con mapas/gráficos avanzados.
- Notificaciones y dashboards visuales.
- Gestión de períodos académicos (año lectivo, curso del estudiante) — el sistema queda pensado para un ciclo escolar; distinguir datos entre años reales es trabajo de la siguiente fase.

*(La bitácora de acciones correctivas y el rol de estudiante, que originalmente estaban acá, ya entraron al alcance.)*

## Tecnologías

Sin cambios respecto a la propuesta original — Nest + Prisma + Postgres (Docker) en el backend, React + Vite + shadcn/ui + TanStack Query/Table + React Hook Form + Zod en el frontend. Un detalle práctico ya resuelto en el setup: al instalar Prisma hay que fijar la versión estable (`7.10.0` al momento de armar esto), porque el paquete por defecto en npm resolvió una release candidate de Prisma 8 con un flujo distinto.

## Tiempo real disponible

Ya no son 3 días: son **7 días hábiles**, de los cuales el Día 1 (repo, docker-compose, Nest + Prisma inicializados) está prácticamente cerrado, y hay que repartir el tiempo entre desarrollo e informe — no dejar el informe amontonado al final.