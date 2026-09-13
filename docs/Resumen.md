De qué va el proyecto

Es un sistema para la Facultad de Ingeniería de la Universidad de Cienfuegos que digitaliza el control del rendimiento académico en la modalidad semipresencial. Hoy todo se lleva en planillas, papel y correos, y eso genera problemas concretos: no hay visibilidad centralizada del estado de evaluaciones por asignatura, ni una base común para consultar el rendimiento académico de estudiantes y profesores.

El documento oficial de alcance define 10 requisitos funcionales (RF-01 a RF-10) y deja explícitamente fuera del proyecto varias funcionalidades del documento inicial (reubicación de pendientes, grupos colaborativos, análisis por municipio, reportes integrados y filtros avanzados), documentadas como recomendaciones para futuras versiones.

Alcance definido

Roles — 4 roles funcionales, cada uno con responsabilidad propia (ya no hay dos roles con el mismo nivel de acceso):

Administrador: gestiona usuarios (RF-02: registrar, habilitar/deshabilitar, asignar roles) y el catálogo de asignaturas.
Vicedecana: gestiona la información académica de fondo — carreras, estudiantes, profesores.
Profesor: registra/actualiza evaluaciones de sus propias asignaturas.
Estudiante: completa su propio perfil y consulta, de solo lectura, sus evaluaciones.

Se implementa en esta entrega (RF-01 a RF-07):

Gestionar sesión (login/logout).
Gestionar usuarios — el administrador crea la cuenta con datos mínimos (nombre, email, contraseña, rol); si es estudiante, este completa su propio perfil (carrera, carnet, municipio) al loguearse por primera vez. No hay flujo de invitación por código.
Gestionar carreras.
Gestionar estudiantes (consulta y edición de su información).
Gestionar profesores (consulta y edición de su información).
Gestionar asignaturas (vinculadas a profesor y semestre).
Gestionar evaluaciones: una fila por estudiante-asignatura que se actualiza a lo largo del semestre (no se acumula historial), con estado aprobada/pendiente.

Definidos en el alcance, pendientes por el tiempo (RF-08 a RF-10):
8. Gestionar acciones correctivas.
9. Consultar rendimiento académico (por carrera, semestre, asignatura).
10. Generar estadísticas del rendimiento académico.

Fuera de alcance (recomendaciones para futuras versiones, ni siquiera parte del roadmap numerado)
Gestión de estudiantes pendientes y reubicación académica.
Seguimiento de grupos de trabajo colaborativo.
Análisis del rendimiento académico por municipio.
Generación de reportes integrados (asignatura–profesor–semestre–facultad).
Filtros y reportes avanzados para identificar grupos de estudiantes con dificultades.
Tecnologías

Sin cambios — Nest + Prisma + Postgres (Docker) en el backend, React + Vite + shadcn/ui + TanStack Query + React Hook Form + Zod en el frontend. Prisma fijado en 7.10.0 (versión estable, evitando la release candidate de Prisma 8 que resuelve por defecto).