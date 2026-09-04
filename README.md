# Rendimiento académico UCF

Sistema de control de rendimiento académico para la modalidad semipresencial —
Facultad de Ingeniería, Universidad de Cienfuegos.

## Contexto

Actualmente el control de rendimiento académico (evaluaciones, estudiantes
pendientes, reportes por asignatura/profesor/municipio) se lleva de forma
manual en planillas. Este proyecto corresponde a las prácticas de 3er año de
Ingeniería Informática, con continuidad prevista en 4to año.

## Alcance de esta fase (MVP)

**Incluido:**
- Autenticación con 2 roles: administrador/vicedecana y profesor.
- CRUD de estudiantes (incluye municipio de procedencia).
- CRUD de asignaturas (vinculadas a profesor y semestre).
- Registro de evaluaciones sistemáticas (aprobada/pendiente).
- Vista de estudiantes pendientes (calculada, no manual).
- Reporte filtrable por asignatura, profesor, semestre y municipio.

**Fuera de alcance (roadmap 4to año):**
- Bitácora completa de acciones correctivas.
- Trazabilidad de grupos colaborativos.
- Roles adicionales: jefe de carrera, decano, estudiante.
- Reportes geográficos avanzados y notificaciones.

## Stack técnico

- **Backend:** NestJS + Prisma + PostgreSQL, autenticación JWT.
- **Frontend:** React + Vite + shadcn/ui, TanStack Query/Table, React Hook Form + Zod.
- **Infraestructura:** Docker Compose (PostgreSQL).

## Estructura del repo

```
.
├── backend/     # API NestJS
├── frontend/    # Cliente React
└── docker-compose.yml
```

## Puesta en marcha

_(se completa en el Sprint 1, a medida que se configura cada parte)_

## Roles y permisos

| Rol | Puede |
|---|---|
| Administrador/Vicedecana | CRUD completo de estudiantes y asignaturas, ver pendientes, generar reportes |
| Profesor | Ver solo sus asignaturas, registrar evaluaciones de sus estudiantes |
# rendimiento-academico-ucf
