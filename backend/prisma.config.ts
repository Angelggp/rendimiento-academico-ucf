import { config as cargarVariables } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

const backendDir = path.dirname(fileURLToPath(import.meta.url));

cargarVariables({
  path: path.resolve(backendDir, "..", ".env"),
});

export default defineConfig({
  schema: path.join(backendDir, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(backendDir, "prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});