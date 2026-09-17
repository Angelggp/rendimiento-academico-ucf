import { PrismaClient, Rol } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function ensureCarrera(nombre: string, plan: 'D' | 'E') {
  const existente = await prisma.carrera.findFirst({
    where: { nombre: { equals: nombre, mode: 'insensitive' } },
  });

  if (existente) {
    return existente;
  }

  return prisma.carrera.create({
    data: { nombre, plan },
  });
}

async function ensureUsuario(email: string, nombre: string, apellidos: string, rol: Rol, passwordPlano: string) {
  const existente = await prisma.usuario.findUnique({
    where: { email },
  });

  if (existente) {
    await prisma.usuario.update({
      where: { id: existente.id },
      data: {
        nombre,
        apellidos,
        rol,
        activo: true,
        password: await bcrypt.hash(passwordPlano, 10),
      },
    });

    return prisma.usuario.findUnique({ where: { email } });
  }

  return prisma.usuario.create({
    data: {
      email,
      password: await bcrypt.hash(passwordPlano, 10),
      nombre,
      apellidos,
      rol,
      activo: true,
    },
  });
}

async function ensureProfesor(usuarioId: string) {
  const existente = await prisma.profesor.findUnique({
    where: { usuarioId },
  });

  if (existente) {
    return existente;
  }

  return prisma.profesor.create({
    data: { usuarioId },
  });
}

async function ensureEstudiante(usuarioId: string, carreraId: string, carnetIdentidad: string) {
  const existente = await prisma.estudiante.findUnique({
    where: { usuarioId },
  });

  if (existente) {
    return existente;
  }

  return prisma.estudiante.create({
    data: {
      usuarioId,
      carreraId,
      carnetIdentidad,
      municipio: 'CIENFUEGOS',
      observaciones: 'Perfil creado por seed.',
    },
  });
}

async function main() {
  const carrera = await ensureCarrera('Ingeniería Informática', 'D');

  const admin = await ensureUsuario(
    'admin@ucf.edu.cu',
    'Administrador',
    'Sistema',
    Rol.ADMIN,
    'Admin123!',
  );

  const vicedecana = await ensureUsuario(
    'vicedecana@ucf.edu.cu',
    'Ana',
    'Pérez',
    Rol.VICEDECANO,
    'Vice123!',
  );

  const profesor = await ensureUsuario(
    'profesor@ucf.edu.cu',
    'Carlos',
    'López',
    Rol.PROFESOR,
    'Profesor123!',
  );

  const estudiante = await ensureUsuario(
    'estudiante@ucf.edu.cu',
    'María',
    'García',
    Rol.ESTUDIANTE,
    'Estudiante123!',
  );

  await ensureProfesor(profesor!.id);
  await ensureEstudiante(estudiante!.id, carrera.id, '0102030405');

  console.log('Seed ejecutado correctamente.');
  console.log({ admin: admin?.email, vicedecana: vicedecana?.email, profesor: profesor?.email, estudiante: estudiante?.email, carrera: carrera.nombre });
}

main()
  .catch((error) => {
    console.error('Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
