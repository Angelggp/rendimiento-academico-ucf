# Guía de defensa del software

Guía rápida para poder presentar y defender el sistema en la exposición. Está pensada para leerse de arriba abajo en una hora. Al final hay una lista de preguntas probables con su respuesta.

---

## 1. Qué es el sistema (30 segundos)

**Sistema web para el control del rendimiento académico de la modalidad semipresencial de la Facultad de Ingeniería de la Universidad de Cienfuegos.**

- **Problema que resuelve:** el seguimiento de las evaluaciones de los estudiantes era manual y disperso. La vicedecana no tenía una vista única de quién está desaprobado ni de dónde.
- **Qué hace:** cada profesor registra las notas de sus asignaturas; el sistema calcula solo si el estudiante aprueba o queda pendiente; la vicedecana consulta pendientes y reportes filtrables (por asignatura, profesor, semestre, municipio y estado).
- **Regla central:** nota de 0 a 5. **Nota ≥ 3 → APROBADA. Nota < 3 o sin nota → PENDIENTE.** Lo calcula el servidor, nunca el usuario.
- **Metodología:** ICONIX (casos de uso → análisis de robustez → diseño → implementación).

---

## 2. Los cuatro roles (qué puede hacer cada uno)

| Rol | Qué hace | Pantallas |
|---|---|---|
| **Administrador** | Gestiona las cuentas de usuario (crear, editar, activar/desactivar) y las asignaturas (con su profesor y las carreras que la cursan). | Inicio, Usuarios, Asignaturas |
| **Vicedecana** | Supervisa: gestiona carreras y estudiantes, consulta profesores, ve **Pendientes** y **Reportes**. Solo puede haber **una** vicedecana activa. | Inicio, Carreras, Estudiantes, Profesores, Pendientes, Reportes |
| **Profesor** | Ve sus asignaturas y registra la calificación y una observación (acción correctiva) a cada estudiante. | Inicio, Mis Asignaturas → Evaluaciones |
| **Estudiante** | Completa su perfil (carné, carrera, municipio) y consulta sus propias notas. | Inicio, Mi Perfil |

**Flujo típico:** el administrador crea la asignatura y le asigna profesor y carreras → el profesor abre su asignatura y pone notas → el sistema marca APROBADA/PENDIENTE → la vicedecana ve los pendientes y las observaciones → el estudiante ve su resultado.

Usuarios de prueba (después de ejecutar el seed):

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@ucf.edu.cu | Admin123! |
| Vicedecana | vicedecana@ucf.edu.cu | Vice123! |
| Profesor | profesor@ucf.edu.cu | Profesor123! |
| Estudiante | estudiante@ucf.edu.cu | Estudiante123! |

---

## 3. Arquitectura en una imagen mental

```
Navegador (React)  ──HTTP/JSON + JWT──▶  API REST (NestJS)  ──Prisma──▶  PostgreSQL
   capa de presentación                   capa de lógica de negocio          capa de datos
```

- **Cliente-servidor de tres capas.** Cada capa tiene una sola responsabilidad.
- **Frontend** (`localhost:5173`): dibuja pantallas, valida formularios y llama a la API. **No decide reglas de negocio.**
- **Backend** (`localhost:3000`): autentica, comprueba permisos por rol, valida datos y aplica las reglas (por ejemplo, calcular el estado de una evaluación).
- **Base de datos:** PostgreSQL, a la que solo accede el backend, a través de Prisma.
- **Arquitectura modular:** cada entidad tiene su propio módulo (controlador + servicio). El frontend se organiza igual, por funcionalidades.
- Diagrama: `docs/diagramas/arquitectura.png`.

---

## 4. Tecnologías (qué es y para qué se usa aquí)

### Frontend
| Tecnología | Para qué se usa |
|---|---|
| **React 19** | Construir la interfaz con componentes reutilizables. |
| **Vite** | Servidor de desarrollo rápido y compilación para producción. |
| **TypeScript** | JavaScript con tipos; detecta errores antes de ejecutar. Se usa en frontend **y** backend. |
| **Tailwind CSS 4** | Estilos mediante clases; tema de color azul definido en `index.css`. |
| **shadcn/ui** (sobre Radix UI) | Componentes ya hechos (diálogos, tablas, botones). Su código vive dentro del proyecto, en `components/ui`. |
| **TanStack Query** | Pide datos a la API, los guarda en caché y los refresca tras cambios (por ejemplo, tras guardar una nota). |
| **TanStack Table** | Tablas con búsqueda, orden y paginación (`components/ui/data-table.tsx`). |
| **React Hook Form + Zod** | Formularios y sus validaciones (carné, semestre, etc.) antes de enviar al servidor. |
| **React Router** | Navegación entre pantallas y rutas protegidas por rol. |

### Backend
| Tecnología | Para qué se usa |
|---|---|
| **NestJS** | Framework de servidor. Organiza todo en módulos, controladores y servicios. |
| **Prisma** (ORM) | Define el esquema de la base de datos, hace las migraciones y las consultas tipadas. |
| **PostgreSQL 16** | Base de datos relacional. |
| **JWT + Passport** | Sesión: al iniciar sesión el servidor entrega un token que el cliente envía en cada petición. Dura 1 día. |
| **bcrypt** | Cifra las contraseñas; nunca se guardan en texto plano. |
| **class-validator** | Valida los datos de entrada en el servidor (DTO). |

### Infraestructura y herramientas
| Tecnología | Para qué se usa |
|---|---|
| **Docker Compose** | Levanta PostgreSQL con un solo comando (alternativa: Postgres local con pgAdmin). |
| **pnpm workspaces** | Un solo repositorio con `backend` y `frontend`. |
| **Git / GitHub** | Control de versiones. |
| **Enterprise Architect / PlantUML** | Diagramas UML (casos de uso, robustez, secuencia, arquitectura). |
| **VS Code / pgAdmin** | Editor de código / administración gráfica de la base de datos. |

---

## 5. Estructura del proyecto

```
rendimiento-academico-ucf/
├── backend/                 API en NestJS
│   ├── prisma/
│   │   ├── schema.prisma    modelo de datos (tablas y relaciones)
│   │   ├── migrations/      historial de cambios de la base de datos
│   │   └── seed.ts          datos de prueba (5 carreras, 7 profesores, 16 asignaturas, 25 estudiantes, ~100 evaluaciones)
│   └── src/
│       ├── auth/            login y JWT
│       ├── usuarios/        cuentas (solo ADMIN)
│       ├── carreras/
│       ├── estudiantes/
│       ├── profesores/
│       ├── asignaturas/
│       ├── evaluaciones/    ← núcleo del sistema
│       ├── common/          guardas (JwtAuthGuard, RolesGuard) y decorador @Roles
│       └── prisma/          PrismaService (conexión a la BD)
├── frontend/
│   └── src/
│       ├── features/        una carpeta por funcionalidad (auth, usuarios, carreras,
│       │                    asignaturas, estudiantes, profesor, pendientes, reportes…)
│       ├── components/      ui/ (shadcn) y layout/ (AppLayout con menú lateral)
│       ├── config/nav.ts    menú según el rol
│       ├── lib/             api.ts (cliente HTTP), validaciones.ts, format.ts
│       ├── router.tsx       rutas y protección por rol
│       └── types/api.ts     tipos que reflejan lo que devuelve la API
├── docs/                    documentación y diagramas
└── docker-compose.yml       PostgreSQL
```

**Patrón dentro de cada módulo del backend:**
- `*.controller.ts` → define las rutas (`GET /evaluaciones`…), los roles permitidos y valida la entrada con DTO.
- `*.service.ts` → contiene la lógica y habla con la base de datos.
- `*.module.ts` → empaqueta el controlador y el servicio.

**Patrón dentro de cada carpeta del frontend (`features/x`):**
- `x-api.ts` → funciones que llaman a la API.
- `use-x.ts` → hooks de TanStack Query.
- `XPage.tsx` / `CrearXDialog.tsx` → pantallas y formularios.

---

## 6. Modelo de datos (6 tablas)

```
Usuario ──1:1── Profesor ──1:N── Asignatura ──N:M── Carrera ──1:N── Estudiante ──1:1── Usuario
                                     │                                   │
                                     └────────────── Evaluacion ─────────┘
                                          (única por estudiante + asignatura)
```

- **Usuario:** correo, contraseña cifrada, nombre, apellidos, `rol`, `activo`, teléfono.
- **Profesor / Estudiante:** perfiles ligados a un Usuario (1 a 1). El estudiante además tiene carrera, **carné de identidad único** y municipio.
- **Carrera:** nombre, plan (D o E), activa.
- **Asignatura:** nombre, semestre (1 a 8), un profesor y **varias carreras** (relación muchos a muchos = plan de estudios).
- **Evaluacion:** estudiante, asignatura, calificación (0–5, opcional), `estado` (APROBADA/PENDIENTE), observaciones, fecha. Restricción `@@unique([estudianteId, asignaturaId])`: **una sola evaluación por estudiante y asignatura**; si el profesor vuelve a guardar, se actualiza.

Enums: `Rol` (4), `Municipio` (8 de Cienfuegos), `Plan` (D/E), `EstadoEvaluacion` (2).

---

## 7. Seguridad: cómo se protege el acceso

1. **Login** (`POST /auth/login`, `auth.service.ts`): busca el usuario por correo, comprueba que esté **activo** y compara la contraseña con `bcrypt.compare`. Si todo es correcto, firma un **JWT** con `sub` (id), `email` y `rol`.
2. **El frontend guarda el token** en `localStorage` y lo envía en cada petición: `Authorization: Bearer <token>` (`lib/api.ts`). Si el servidor responde 401, se cierra la sesión.
3. **JwtAuthGuard** (autenticación): rechaza toda petición sin token válido.
4. **RolesGuard** + decorador `@Roles('ADMIN', …)` (autorización): comprueba que el rol del token esté entre los permitidos en esa ruta. Si no, devuelve 403.
5. **Reglas adicionales dentro de los servicios:** por ejemplo, un profesor solo puede evaluar sus propias asignaturas; un estudiante solo ve sus propias notas.
6. **Validación global** (`main.ts`): `ValidationPipe` con `whitelist` y `forbidNonWhitelisted` rechaza campos desconocidos o inválidos.
7. **En el frontend**, `RequireAuth` y `router.tsx` protegen las rutas por rol. Es solo comodidad de interfaz: **la seguridad real está en el backend**.

**Diferencia clave (pregunta frecuente):** autenticación = «¿quién eres?» (JWT); autorización = «¿qué puedes hacer?» (roles).

---

## 8. Los métodos más importantes

### `EvaluacionesService.registrar()` — el corazón del sistema
Archivo: `backend/src/evaluaciones/evaluaciones.service.ts`. Registra (o actualiza) la calificación de un estudiante en una asignatura. Orden de las comprobaciones:

1. ¿Existe el estudiante? Si no → 404.
2. ¿Existe la asignatura? Si no → 404.
3. Si quien llama es PROFESOR, ¿es el profesor de esa asignatura? Si no → 403.
4. ¿La carrera del estudiante cursa esa asignatura? Si no → 400.
5. Si viene calificación, ¿es un entero entre 0 y 5? Si no → 400.
6. **Calcula el estado:** `calificacion >= 3` → APROBADA; si no → PENDIENTE.
7. **`upsert`:** si ya existía la evaluación de ese estudiante en esa asignatura la actualiza; si no, la crea. Guarda también las observaciones.

Tiene 7 decisiones, por eso su complejidad ciclomática es **V(G) = 8** (base de las pruebas de caja blanca).

### `EvaluacionesService.listar(filtros)`
Un único endpoint `GET /evaluaciones` con filtros opcionales (asignatura, profesor, semestre, municipio, estado). **Pendientes** es ese mismo endpoint con `estado=PENDIENTE`; **Reportes** expone todos los filtros. Una consulta, dos pantallas.

### `AuthService.login()` / `validateUser()`
Valida credenciales y emite el JWT (ver sección 7).

### `UsuariosService` — regla de vicedecana única
`validarVicedecanoUnico` impide tener dos vicedecanas activas al crear o editar usuarios.

### `EstudiantesService` — validación del carné
El carné cubano tiene **11 dígitos** con formato AAMMDD; el mes se le suma 40 si nació en 2000 o después. Se valida en el servidor (`validarCarnetIdentidad`) y en el cliente (`lib/validaciones.ts`). También se comprueba que no esté duplicado antes de guardar, para devolver un mensaje claro en lugar de un error de base de datos.

### Frontend
- **`lib/api.ts`**: cliente HTTP único; añade el token, traduce errores a `ApiError` y gestiona el 401.
- **`AppLayout.tsx`**: menú lateral que cambia según el rol (`config/nav.ts`); en móvil se convierte en un panel desplegable.
- **`EvaluacionesAsignaturaPage.tsx`**: pantalla donde el profesor pone nota y observación por estudiante; solo lista a los estudiantes de las carreras que cursan esa asignatura.
- **`data-table.tsx`**: tabla genérica reutilizada en Usuarios, Estudiantes, Profesores, Pendientes y Reportes.

---

## 9. API: rutas principales

| Recurso | Rutas | Quién |
|---|---|---|
| `/auth` | `POST /login`, `GET /me` | Público / autenticado |
| `/usuarios` | CRUD | ADMIN |
| `/carreras` | CRUD (listar también ADMIN y ESTUDIANTE) | VICEDECANO |
| `/estudiantes` | listar, crear, ver, editar, `POST /perfil` | VICEDECANO / ADMIN / PROFESOR / ESTUDIANTE según la ruta |
| `/profesores` | listar, ver, editar, `POST /perfil` | ADMIN / VICEDECANO / PROFESOR |
| `/asignaturas` | CRUD | ADMIN (lectura: + VICEDECANO y PROFESOR) |
| `/evaluaciones` | `GET` (filtros), `POST` (registrar), por estudiante, por asignatura | `POST` solo PROFESOR |

Detalle completo en `docs/Contrato de API.md`.

---

## 10. Validaciones que conviene saber

- **Carné:** 11 dígitos, fecha válida (AAMMDD, +40 al mes desde 2000), único.
- **Semestre:** entre 1 y 8.
- **Calificación:** entero de 0 a 5.
- **Teléfono:** opcional; el ejemplo es `+53 5XXXXXXX` (código de Cuba + 8 dígitos).
- **Observaciones:** máximo 1000 caracteres.
- **Vicedecana:** solo una activa.
- **Correo:** único.
- Se validan **en los dos lados**: en el frontend para dar respuesta inmediata, y en el backend porque es lo que no se puede saltar.

---

## 11. Pruebas realizadas

- **Caja blanca:** sobre `registrar()`. Se traza su grafo de flujo, se calcula V(G) = 8 y se prueban los 8 caminos independientes (método del camino básico de McCabe).
- **Caja negra:** partición de equivalencia y valores límite sobre la calificación (por ejemplo −1, 0, 2, 3, 5, 6) y sobre los datos de entrada.
- **Integración:** recorrido del flujo completo entre módulos (crear asignatura → registrar nota → verla en pendientes/reportes).
- **Aceptación:** verificación de que cada requisito funcional se cumple desde la interfaz.
- Detalle en `docs/Pruebas de software.md` y `docs/Prueba de aceptacion.md`.

---

## 12. Cómo levantarlo (por si piden una demostración)

```bash
pnpm install                       # desde la raíz
docker compose up -d               # PostgreSQL
cd backend
pnpm prisma:generate               # genera el cliente de Prisma
pnpm prisma:deploy                 # aplica las migraciones
pnpm prisma:seed                   # datos de prueba
cd ..
pnpm dev:backend                   # http://localhost:3000
pnpm dev:frontend                  # http://localhost:5173  (otra terminal)
```

Instrucciones completas y solución de problemas en `docs/instalacion.md`.

**Demostración sugerida (3 minutos):**
1. Entrar como **profesor** → Mis Asignaturas → poner un 2 a un estudiante con una observación → Guardar (queda PENDIENTE).
2. Entrar como **vicedecana** → Pendientes → aparece ese estudiante con su observación → Reportes → filtrar por municipio.
3. Entrar como **administrador** → Usuarios → mostrar filtros por rol y estado.

---

## 13. Preguntas probables y respuestas cortas

**¿Por qué una aplicación web y no de escritorio?**
Porque no requiere instalar nada en cada equipo, cualquier usuario accede desde el navegador y las actualizaciones se hacen en un solo lugar (el servidor).

**¿Por qué separar frontend y backend?**
Para que cada parte tenga una responsabilidad clara y pueda evolucionar por separado. El backend es reutilizable (por ejemplo, para una futura aplicación móvil) y las reglas de negocio quedan en un solo lugar, fuera del alcance del usuario.

**¿Por qué React?**
Componentes reutilizables, ecosistema amplio y actualización eficiente de la interfaz. Con TypeScript da un código más seguro.

**¿Por qué NestJS?**
Impone una estructura modular (módulos, controladores, servicios), trae inyección de dependencias y está hecho para TypeScript, lo que mantiene el código ordenado y mantenible.

**¿Por qué PostgreSQL y no MongoDB?**
Los datos son claramente relacionales (usuarios, carreras, asignaturas, evaluaciones) y necesitamos integridad: claves foráneas, restricciones de unicidad y transacciones.

**¿Qué es Prisma y por qué se usa?**
Es un ORM: describimos las tablas en `schema.prisma`, genera las migraciones y nos da consultas tipadas, sin escribir SQL a mano y con menos errores.

**¿Cómo se guardan las contraseñas?**
Cifradas con bcrypt (hash con sal). Nunca en texto plano y nunca se devuelven en las respuestas de la API.

**¿Qué pasa si alguien entra a una URL que no le corresponde?**
El frontend lo redirige, pero lo importante es que el backend lo rechaza con 403 aunque intente llamar a la API directamente.

**¿Cómo se decide si un estudiante aprueba?**
En el servidor, en `registrar()`: nota ≥ 3 es APROBADA; menor que 3 o sin nota es PENDIENTE. El profesor no puede escribir el estado a mano.

**¿Qué pasa si el profesor guarda dos veces la nota del mismo estudiante?**
No se duplica: hay una restricción única por estudiante y asignatura y se usa `upsert`, así que se actualiza el registro existente.

**¿Un profesor puede evaluar a cualquier estudiante?**
No. Solo en sus asignaturas y solo a estudiantes de carreras que cursan esa asignatura.

**¿Para qué sirve el estado «Pendiente»?**
Es la alerta temprana: agrupa a quienes tienen nota menor que 3 o aún no tienen nota, para que la vicedecana pueda intervenir. La observación del profesor indica qué acción correctiva se espera.

**¿Por qué ICONIX?**
Es ligera pero mantiene la trazabilidad requisito → caso de uso → diseño → código. Es adecuada para un equipo pequeño y con plazo limitado, y su análisis de robustez ayuda a validar los casos de uso antes de programar.

**¿Qué es el análisis de robustez?**
Clasifica cada caso de uso en objetos de **frontera** (pantalla), **control** (lógica) y **entidad** (datos) para comprobar que el caso de uso está completo antes de diseñarlo.

**¿Qué es la complejidad ciclomática?**
Mide cuántos caminos independientes tiene un método: decisiones + 1. `registrar()` tiene 7 decisiones, así que V(G) = 8; ese es el número mínimo de casos de prueba de caja blanca.

**¿El sistema es escalable?**
Sí, en el sentido de que es modular: se pueden añadir módulos, roles y datos sin tocar los existentes. La base de datos y la API pueden desplegarse en servidores independientes.

**¿Qué limitaciones tiene / qué falta?**
Es una versión inicial (MVP). Quedan como trabajo futuro: acciones correctivas con seguimiento propio, invitaciones por correo, exportación de reportes (PDF/Excel), paginación en el servidor para volúmenes grandes y pruebas automáticas de extremo a extremo.

**¿Cómo se ve bien en el móvil?**
El diseño es adaptable (Tailwind): en pantallas pequeñas el menú lateral se convierte en un panel desplegable.

---

## 14. Si no sabes una respuesta

- Vuelve a la idea de las **tres capas** (presentación, lógica, datos) y a la **regla central** (nota ≥ 3 aprueba); casi todo se puede explicar desde ahí.
- «Eso lo maneja el backend» es cierto para casi toda la lógica: validación, permisos y cálculo del estado.
- Es válido decir «esa parte no la implementé yo, pero por lo que entiendo funciona así…» y explicar el flujo general.
