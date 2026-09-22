# Instalación

Guía para levantar el proyecto en local desde cero.

## Requisitos previos

- **Node.js 20+**
- **pnpm** (el proyecto fija `pnpm@12.3.4` en `package.json` → `packageManager`; con Corepack activado (`corepack enable`) pnpm se resuelve solo a esa versión).
- **Docker** y **Docker Compose** (para Postgres). Tu usuario debe poder usar Docker sin `sudo` (grupo `docker`) o vas a necesitar anteponer `sudo` a los comandos de `docker compose`.

## 1. Clonar y variables de entorno

```bash
git clone <url-del-repo>
cd rendimiento-academico-ucf

cp .env.example .env
cp backend/.env.example backend/.env
```

No hace falta tocar los valores por defecto para desarrollo local: `.env` (raíz) trae las credenciales que usa `docker-compose.yml`, y `backend/.env` trae la misma `DATABASE_URL` más el secreto de JWT. El frontend no necesita `.env`: si no existe, apunta por defecto a `http://localhost:3000` (ver `VITE_API_URL` en `frontend/src/lib/api.ts` si tu backend corre en otro puerto).

## 2. Instalar dependencias

```bash
pnpm install
```

Instala los tres paquetes del workspace (`backend` y `frontend`) en un solo paso. `bcrypt` y `esbuild` compilan binarios nativos en el postinstall; `pnpm-workspace.yaml` ya los tiene autorizados (`allowBuilds`), así que no debería pedirte nada. Si alguna vez ves el error `ERR_PNPM_IGNORED_BUILDS`, corré `pnpm approve-builds`.

## 3. Levantar la base de datos

```bash
docker compose up -d
```

Levanta un Postgres 16 en `localhost:5432` con las credenciales de `.env`.

## 4. Migraciones y datos de prueba

```bash
cd backend
pnpm prisma:deploy   # aplica las migraciones existentes
pnpm prisma:seed     # crea usuarios y datos de prueba
cd ..
```

El seed (`backend/prisma/seed.ts`) carga un conjunto de datos completo para poder probar todas las pantallas: 5 carreras (una deshabilitada), 7 profesores (uno deshabilitado), 16 asignaturas en 4 semestres, cada una asociada a las carreras que la cursan (una deshabilitada), 25 estudiantes repartidos por carrera y por los 8 municipios, y ~100 evaluaciones (~25% pendientes), siempre entre estudiantes y asignaturas de su misma carrera. Es **idempotente**: podés correrlo las veces que quieras sin que se dupliquen los datos.

## 5. Correr la app

En dos terminales, desde la raíz del repo:

```bash
pnpm dev:backend    # NestJS en http://localhost:3000
pnpm dev:frontend   # Vite en http://localhost:5173
```

Abrí `http://localhost:5173` e iniciá sesión con cualquiera de los usuarios de prueba de abajo.

## Usuarios de prueba (creados por el seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@ucf.edu.cu` | `Admin123!` |
| Vicedecana | `vicedecana@ucf.edu.cu` | `Vice123!` |
| Profesor | `profesor@ucf.edu.cu` | `Profesor123!` |
| Estudiante | `estudiante@ucf.edu.cu` | `Estudiante123!` |

Además, los profesores extra (ej. `yamila.fernandez@ucf.edu.cu`) usan la contraseña `Profesor123!` y los estudiantes generados (ej. `yusnier.ramos@ucf.edu.cu`) usan `Estudiante123!`.

## Problemas comunes

- **`permission denied` al hablar con el socket de Docker**: tu usuario no está en el grupo `docker`. Corré los comandos de `docker compose` con `sudo`, o agregá tu usuario al grupo (`sudo usermod -aG docker $USER`, luego reiniciá sesión).
- **El backend no conecta a la base de datos**: confirmá que `docker compose ps` muestra `rendimiento_db` como `healthy` y que `backend/.env` tiene la misma `DATABASE_URL` que `docker-compose.yml`.
- **Puerto 3000 o 5173 ocupado**: matá el proceso que lo esté usando (`lsof -i :3000`) o cambiá el puerto en `frontend/src/lib/api.ts` (`VITE_API_URL`) / la config de Vite.
- **Querés reiniciar todo desde cero**: `docker compose down -v` (borra el volumen de Postgres) y repetí desde el paso 3.
