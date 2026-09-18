Lista de tareas pendientes actualizada

Read , lines 1 to 100

Read , lines 1 to 50

Perfecto, voy a explicarte **Prisma** de forma clara:

## ¿Qué es Prisma?

Prisma es un **ORM** (Object-Relational Mapping) que te permite:

1. **Definir tu base de datos** en un archivo legible (`schema.prisma`)
2. **Generar código automático** para interactuar con la BD desde tu código
3. **Manejar cambios** en la estructura de la BD sin escribir SQL manual
4. **Generar migraciones** para mantener versiones de la BD

## Cómo funciona en tu proyecto

```
Tu código NestJS
        ↓
Prisma Client (código generado automáticamente)
        ↓
PostgreSQL (tu BD en Docker)
```

**Ejemplo práctico:**

```typescript
// En tu servicio, sin Prisma escribirías SQL crudo:
const resultado = await this.db.query("SELECT * FROM Usuario WHERE id = $1", [id]);

// Con Prisma:
const usuario = await this.prisma.usuario.findUnique({
  where: { id }
});
```

Mucho más limpio y seguro.

## Los 4 archivos clave

```
backend/
├── prisma/
│   ├── schema.prisma          ← Tu definición de la BD (lo más importante)
│   ├── migrations/            ← Historial de cambios en la BD
│   └── seed.ts                ← Datos iniciales (para pruebas)
└── src/
    ├── prisma/
    │   └── prisma.service.ts  ← Tu conexión a Prisma en NestJS
```

## Los comandos más importantes

### 1. **Generar el cliente Prisma** (después de instalar dependencias)
```bash
pnpm prisma:generate
```
Esto genera el código que usas en tu app. **Debes hacerlo una sola vez** después de `pnpm install`.

### 2. **Crear/actualizar la BD** (cuando cambias `schema.prisma`)
```bash
pnpm prisma:migrate
```
Te pedirá un nombre para la migración. Ejemplo:
```bash
pnpm prisma:migrate
# Te pide: ¿Nombre de la migración? 
# Escribe: add_estudiantes_table
```

Esto:
- ✅ Crea un archivo SQL de la migración
- ✅ Lo ejecuta en tu BD
- ✅ Regenera el cliente automáticamente

### 3. **Llenar la BD con datos de prueba** (opcional)
```bash
pnpm prisma:seed
```
Ejecuta `prisma/seed.ts` para insertar datos iniciales.

### 4. **Ver la BD visualmente** (opcional pero útil)
```bash
pnpm prisma:studio
```
Te abre un panel web para ver/editar datos en tiempo real.

### 5. **Usar migraciones en producción**
```bash
pnpm prisma:deploy
```
Solo aplica las migraciones sin hacer preguntas (para CI/CD).

## El flujo completo paso a paso

### Primera vez (setup inicial):

```bash
# 1. Asegúrate que Docker está corriendo
docker compose up -d

# 2. Genera el cliente Prisma
pnpm prisma:generate

# 3. Ejecuta migraciones (crea tablas)
pnpm prisma:migrate

# 4. (Opcional) Llena con datos de prueba
pnpm prisma:seed

# 5. Inicia tu proyecto
pnpm start:dev
```

### Cuando cambias `schema.prisma` (agregar columna, tabla, etc):

```bash
# 1. Edita backend/prisma/schema.prisma

# 2. Ejecuta migraciones (automáticamente regenera cliente)
pnpm prisma:migrate

# 3. Tu código ya puede usar los nuevos campos
```

## Ejemplo práctico con tu proyecto

Digamos que quieres agregar un campo `activo` a `Estudiante`:

### Paso 1: Edita `schema.prisma`
```prisma
model Estudiante {
  id              String    @id @default(uuid())
  usuarioId       String    @unique
  usuario         Usuario   @relation(fields: [usuarioId], references: [id])
  carreraId       String
  carrera         Carrera   @relation(fields: [carreraId], references: [id])
  carnetIdentidad String    @unique
  municipio       Municipio
  observaciones   String?
  activo          Boolean   @default(true)  ← AGREGASTE ESTO
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  evaluaciones Evaluacion[]

  @@map("Estudiante")
}
```

### Paso 2: Ejecuta la migración
```bash
pnpm prisma:migrate
# Te pide un nombre, escribes: add_active_to_estudiante
```

### Paso 3: Usa el nuevo campo en tu código
```typescript
// En tu servicio
const estudiante = await this.prisma.estudiante.create({
  data: {
    usuarioId: "...",
    carreraId: "...",
    carnetIdentidad: "123",
    municipio: "CIENFUEGOS",
    activo: true  ← YA EXISTE, sin hacer nada más
  }
});
```

## ¿Qué está en tu `schema.prisma` ahora?

Mirando tu archivo, tienes:

```prisma
model Usuario      ← Tabla de usuarios (admin, profesor, estudiante)
model Profesor     ← Relacionado con Usuario
model Estudiante   ← Relacionado con Usuario
model Carrera      ← Carreras que ofrecen
model Asignatura   ← (probablemente más abajo)
model Evaluacion   ← (probablemente más abajo)
```

Cada `model` es una tabla en PostgreSQL.

## Ahora, ¿qué debes hacer?

**Opción A: Si ya tienes migraciones anteriores**
```bash
pnpm prisma:generate
pnpm prisma:deploy
pnpm start:dev
```

**Opción B: Si es la primera vez**
```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev
```

¿Quieres que ejecute estos comandos para verificar que tu BD esté lista?