Leí el documento. Te armo el resumen, el alcance realista y la propuesta técnica.

## De qué va el proyecto

Es un sistema para la Facultad de Ingeniería de la Universidad de Cienfuegos que digitaliza el control del rendimiento académico en la modalidad semipresencial. Hoy todo se lleva en planillas, papel y correos, y eso genera problemas concretos: no se detecta a tiempo quién no termina el semestre, no hay seguimiento de quién abandona grupos colaborativos, no hay visibilidad del estado de evaluaciones por asignatura, no se puede filtrar por municipio de procedencia (Cienfuegos, Palmira, Abreus, etc.), y no hay reportes cruzados de asignatura–profesor–semestre.

El documento define **8 funcionalidades** (gestión de estudiantes, control de asignaturas, seguimiento de pendientes, trazabilidad de grupos, evaluaciones sistemáticas, bitácora de acciones correctivas, reportes, reportes geográficos) y **6 actores** (Vicedecana, Profesor, Jefe de carrera, Decano, Estudiante, Administrador).

Eso es un sistema completo de gestión académica — imposible de hacer bien en 3 días. Para unas prácticas de 3er año que van a tener continuidad en 4to, lo correcto es recortar sin mentir sobre el alcance: entregar un **núcleo funcional real y demostrable**, y dejar documentado explícitamente qué queda para la siguiente fase.

## Alcance MVP (lo que sí entra)

**Roles** — reduce de 6 actores a 2 para no perder tiempo en un sistema de permisos granular:
- **Administrador/Vicedecana**: acceso total (CRUD de todo).
- **Profesor**: solo ve y gestiona sus asignaturas y evaluaciones.

**Módulos:**
1. Gestión de estudiantes (CRUD + municipio de procedencia)
2. Gestión de asignaturas (CRUD, vinculada a profesor, semestre y facultad)
3. Registro de evaluaciones sistemáticas (CRUD simple con estado aprobada/pendiente)
4. Vista de "estudiantes pendientes" — un query/filtro sobre las evaluaciones, no un módulo aparte
5. Reporte filtrable por asignatura–profesor–semestre–municipio (tabla, exportar a CSV si sobra tiempo)

## Fuera de alcance (para 4to año — decirlo así de claro en la defensa)

- Bitácora completa de acciones correctivas (en v1 basta un campo de "observaciones" de texto en el estudiante)
- Trazabilidad de grupos colaborativos (requiere modelar grupos, se pospone)
- Roles de Jefe de carrera, Decano y Estudiante (solo lectura extra)
- Reportes geográficos con mapas/gráficos avanzados
- Notificaciones y dashboards visuales

Esto es defendible frente a un tribunal: mostrás un sistema que ya resuelve el dolor principal (visibilidad de pendientes y reportes cruzados) y dejás claro que el resto es la hoja de ruta de 4to año.

## Tecnologías

Tu elección (Nest + React/Vite + shadcn) está bien para una tesis de ing. informática — es defendible académicamente y es stack real de la industria. Ajustaría esto para ganar velocidad:

- **ORM: Prisma en vez de TypeORM.** Con 3 días, el schema declarativo + migraciones automáticas de Prisma te ahorra muchísimo tiempo de boilerplate frente a TypeORM con decoradores.
- **DB: Postgres en Docker Compose.** Un solo `docker compose up` y listo, y queda mejor justificado en el documento de tesis que SQLite.
- **`nest g resource <nombre>`**: genera controller/service/module/DTOs de un CRUD completo en segundos. Úsalo para estudiantes, asignaturas y evaluaciones.
- **Auth: JWT simple con `@nestjs/passport`** + un `RolesGuard` básico (2 roles, no compliques con permisos por endpoint granulares).
- **Frontend**: a React+Vite+shadcn súmale:
  - **TanStack Query** para fetching/caching — evita escribir a mano loading/error states en cada pantalla.
  - **TanStack Table** para la vista de reportes con filtros y orden.
  - **React Hook Form + Zod** para formularios — shadcn ya trae el componente `Form` pensado para esta combinación.

Mi única sugerencia "fuera de la caja": si en algún momento ves que el tiempo no alcanza, **Supabase** (Postgres + Auth + API instantánea) te ahorraría todo el backend y dejaría solo el frontend por construir. Lo menciono como opción de rescate, no como recomendación principal — si el tribunal espera ver dominio de Nest como backend propio (típico en estas prácticas), quedate con Nest.

Ahora el plan de 3 días:Si querés, en el próximo mensaje te armo el schema de Prisma completo y la estructura inicial del proyecto Nest para que arranquen el Día 1 sin perder tiempo.