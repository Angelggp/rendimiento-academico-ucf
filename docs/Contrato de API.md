# Contrato de API — Backend (NestJS + Prisma)

Referencia para el frontend. Base: `http://localhost:3000` · CORS habilitado.

## Convenciones

- **Autenticación:** todas las rutas (salvo `POST /auth/login`) exigen cabecera `Authorization: Bearer <token>`.
- **Códigos HTTP:**
  - `201` POST (creación) · `200` GET/PATCH/DELETE
  - `400` validación de body inválido · `401` sin token/token inválido o credenciales erróneas · `403` el rol no tiene permiso · `404` recurso no existe
- **IDs:** todos los ids son UUID (`@IsUUID()` en el backend). Enviar como string.
- **Valores numéricos:** `semestre` y `calificacion` deben ser **números enteros** (no strings). `calificacion` usa la **escala 0-5** (0..5). `fecha` como string ISO (`2026-09-18T14:00:00.000Z`).
- **DTOs validados con class-validator:** body con propiedades extra no permitidas → `400`.

## Enums

| Enum | Valores |
|---|---|
| `Rol` | `ADMIN`, `VICEDECANO`, `PROFESOR`, `ESTUDIANTE` |
| `Plan` | `D`, `E` |
| `Municipio` | `CIENFUEGOS`, `ABREUS`, `CRUCES`, `CUMANAYAGUA`, `LAJAS`, `PALMIRA`, `RODAS`, `AGUADA_DE_PASAJEROS` |
| `EstadoEvaluacion` | `APROBADA`, `PENDIENTE` |

## 1. Auth

### `POST /auth/login`
Body: `{ "email": string, "password": string }`
→ `201` `{ "access_token": string, "usuario": {id, email, nombre, apellidos, rol, activo, telefono, estudiante?, profesor?} }`
→ `401` si credenciales inválidas.

> `usuario.estudiante` / `usuario.profesor` viene **`null`** si el perfil no existe → la señal del frontend para el flujo "completa tu perfil".

### `GET /auth/me`
→ `200` el usuario autenticado (misma forma que el `usuario` de login). Nada más.

## 2. Usuarios — rol ADMIN

### `POST /usuarios`
Body: `{ email, password (min 6), nombre, apellidos, rol: Rol, telefono? }`
→ `201` usuario creado **sin password**.
> Si `rol === "PROFESOR"` se crea automáticamente su fila de `Profesor` para que
> pueda asignársele a asignaturas de inmediato (antes requería el primer login).

### `GET /usuarios?rol=`
`rol` opcional (mayúscula, ej. `PROFESOR`). → `200` `[{id, email, nombre, apellidos, rol, activo, telefono, createdAt, updatedAt}]`

### `GET /usuarios/:id`
→ `200` usuario individual incluyendo `estudiante` y `profesor` (o `null`).

### `PATCH /usuarios/:id`
Body (todos opcionales): `{ email?, nombre?, apellidos?, rol?, activo?, telefono? }`
→ `200`. **Para habilitar/deshabilitar** cuentas → `{ "activo": true|false }`.
> Guardas: un usuario no puede cambiarse su propio `rol` ni ponerse `activo: false`
> (ni siquiera el ADMIN) → `400`.

### `DELETE /usuarios/:id`
Deshabilita la cuenta (`activo: false`), no la borra. → `200`.
> Un usuario no puede deshabilitar su propia cuenta → `400`.

## 3. Carreras — rol VICEDECANO (+ ESTUDIANTE solo-lectura)

### `POST /carreras`
Body: `{ nombre: string, plan: Plan }` → `201`. Duplicados no bloqueados a nivel de plan pero el repositorio usa `nombre` como criterio en seed.

### `GET /carreras` · `GET /carreras/:id`
→ `200`. Incluye `activo` para ocultar/deshabilitar en listas.
> `GET /carreras` también lo usa el estudiante para elegir su carrera al completar el perfil (filtrar por `activo === true` en el cliente).

### `PATCH /carreras/:id`
Body: `{ nombre?, plan?, activo? }` → `200`. Deshabilitar → `{ "activo": false }`.

### `DELETE /carreras/:id`
Deshabilita (`activo: false`). → `200`.

## 4. Estudiantes — rol VICEDECANO (+ PROFESOR y ESTUDIANTE)

### `GET /estudiantes` — VICEDECANO, PROFESOR
→ `200` `[{id, usuarioId, carreraId, carnetIdentidad, municipio, observaciones, createdAt, updatedAt, usuario: {…}, carrera: {…}}]`
> Cada registro trae la `carrera` (con su `id`) → el panel del profesor puede filtrar por carrera **en el cliente** con `carreraId`.

### `GET /estudiantes/:id` — VICEDECANO o el propio estudiante
→ `200` · `403` si un estudiante consulta a otro.

### `POST /estudiantes/perfil` — ESTUDIANTE
Usada por el estudiante para **completar/crear su perfil** la primera vez.
Body: `{ carreraId: string, carnetIdentidad: string, municipio: Municipio, observaciones?: string|null }`
→ `201` · `400` si ya tiene perfil.

### `PATCH /estudiantes/:id` — VICEDECANO
Body: `{ carreraId?, carnetIdentidad?, municipio?, observaciones? }` → `200`.

## 5. Profesores — rol VICEDECANO (+ PROFESOR solo-lectura propio)

### `GET /profesores` — ADMIN, VICEDECANO
→ `200` `[{id, usuarioId, usuario: {…}, asignaturas: [Asignatura]}]`

### `GET /profesores/:id` — VICEDECANO o el propio profesor
→ `200` · `403` ajeno.

### `POST /profesores/perfil` — PROFESOR
Sin body. Crea el perfil del profesor autenticado. → `201` · `400` si ya existe.

### `PATCH /profesores/:id` — VICEDECANO
Body: `{ usuarioId? }` → `200`.

## 6. Asignaturas

### `GET /asignaturas` — ADMIN, VICEDECANO, PROFESOR
→ `200` `[{id, nombre, semestre, profesorId, activo, createdAt, updatedAt, profesor: {id, usuarioId, usuario: {id, email, nombre, apellidos}}}]`

### `GET /asignaturas/:id` — ADMIN, VICEDECANO, PROFESOR
→ `200` · `404`.

### `POST /asignaturas` — ADMIN
Body: `{ nombre: string, semestre: number (int ≥ 1), profesorId: string }`
→ `201` (asignatura con su `profesor.usuario`) · `404` si el profesor no existe · `400` si `semestre` no es entero ≥ 1.

### `PATCH /asignaturas/:id` — ADMIN
Body: `{ nombre?, semestre?, activo?, profesorId? }` → `200`.

### `DELETE /asignaturas/:id` — ADMIN
Deshabilita (`activo: false`). → `200`.

### `GET /asignaturas/profesor/:profesorId` — PROFESOR
Asignaturas del profesor **autenticado** (el parámetro se ignora). → `200` · `404` si el usuario no tiene perfil de profesor.
> El backend resuelve el perfil `Profesor` del usuario autenticado vía su `usuarioId`, así el panel del profesor no depende de conocer su `Profesor.id`.

## 7. Evaluaciones

Modelo actual: **una sola fila por estudiante-asignatura** (`@@unique`), se actualiza con cada cambio del profesor (upsert, no acumula historial). La calificación usa la **escala 0-5** y el estado `PENDIENTE`/`APROBADA` es **derivado automáticamente** de la nota — nadie lo envía ni lo marca: nota `≥3` → `APROBADA`; nota `<3` o sin nota → `PENDIENTE`.

### `GET /evaluaciones` — ADMIN, VICEDECANO, PROFESOR
→ `200` `[{id, estudianteId, asignaturaId, calificacion, estado, fecha, createdAt, updatedAt, estudiante: {…}, asignatura: {…}}]`

### `GET /evaluaciones/:id` — los 4 roles
→ `200` · `404`.

### `POST /evaluaciones` — PROFESOR (upsert)
Body: `{ estudianteId, asignaturaId, calificacion?: (int 0-5) | null, fecha?: string ISO }`
- Crea la fila si no existe; la actualiza si ya existe (mismo estudiante+asignatura).
- `fecha` por defecto ahora; `calificacion` por defecto `null`. El `estado` de la respuesta se calcula desde la nota.
- `403` si el profesor no es dueño de la asignatura · `404` si estudiante o asignatura no existen · `400` si `calificacion` fuera de 0-5.

### `GET /evaluaciones/estudiante/:estudianteId` — ADMIN, VICEDECANO o el propio estudiante
Evaluaciones del estudiante con su `asignatura`. → `200` · `403` ajeno.

### `GET /evaluaciones/asignatura/:asignaturaId` — ADMIN, VICEDECANO, PROFESOR
Estudiantes ya calificados en la asignatura (cada uno con su evaluación). → `200` · `403` si PROFESOR ajeno.

## 8. Flujo recomendado para el panel del profesor (modelo actual)

1. `GET /auth/me` → rol `PROFESOR` (y `profesor.id` para el siguiente paso).
2. `GET /asignaturas/profesor/{profesor.id}` → sus asignaturas.
3. Entra a una asignatura → **selector de carrera** (las carreras vienen en `GET /estudiantes`).
4. `GET /estudiantes` y filtrar por `carreraId` **en el cliente** (volumen pequeño) → grilla de alumnos.
5. Por estudiante: `GET /evaluaciones/asignatura/{asignaturaId}` para saber si ya tiene evaluación (cruzando por `estudianteId`).
6. Botón **Calificar** (sin fila) / **Editar** (con fila) → `POST /evaluaciones` (upsert).

Flujo del estudiante: `GET /evaluaciones/estudiante/{estudianteId}` con su propio id (legítimo por el guard) → ve estado `PENDIENTE` / `APROBADA (calificacion)` por asignatura.

## 9. Datos del seed (para demos con Postman/UI)

| Rol | Email | Password |
|---|---|---|
| Admin | `admin@ucf.edu.cu` | `Admin123!` |
| Vicedecana | `vicedecana@ucf.edu.cu` | `Vice123!` |
| Profesor | `profesor@ucf.edu.cu` | `Profesor123!` |
| Estudiante | `estudiante@ucf.edu.cu` | `Estudiante123!` |

Carrera sembrada: "Ingeniería Informática", plan `D`. El token expira a las 24 h (`JWT_EXPIRATION=1d`).