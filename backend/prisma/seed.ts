import 'dotenv/config';
import { PrismaClient, Rol, Municipio } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Datos de prueba. El seed es idempotente: se puede correr varias veces sin
// duplicar registros (busca por correo / carné / nombre antes de crear).
// ---------------------------------------------------------------------------

const CARRERAS: { nombre: string; plan: 'D' | 'E'; activo: boolean }[] = [
  { nombre: 'Ingeniería Informática', plan: 'D', activo: true },
  { nombre: 'Ingeniería Civil', plan: 'E', activo: true },
  { nombre: 'Ingeniería Industrial', plan: 'D', activo: true },
  { nombre: 'Ingeniería Eléctrica', plan: 'E', activo: true },
  // Carrera deshabilitada, para probar el filtro de activas.
  { nombre: 'Ingeniería Mecánica', plan: 'D', activo: false },
];

const PROFESORES: { email: string; nombre: string; apellidos: string; activo: boolean }[] = [
  { email: 'yamila.fernandez@ucf.edu.cu', nombre: 'Yamila', apellidos: 'Fernández Ortega', activo: true },
  { email: 'roberto.diaz@ucf.edu.cu', nombre: 'Roberto', apellidos: 'Díaz Menéndez', activo: true },
  { email: 'lissette.morales@ucf.edu.cu', nombre: 'Lissette', apellidos: 'Morales Sosa', activo: true },
  { email: 'jorge.castillo@ucf.edu.cu', nombre: 'Jorge', apellidos: 'Castillo Rivero', activo: true },
  { email: 'dayana.ruiz@ucf.edu.cu', nombre: 'Dayana', apellidos: 'Ruiz Hernández', activo: true },
  // Profesor deshabilitado, para probar habilitar/deshabilitar usuarios.
  { email: 'pedro.vega@ucf.edu.cu', nombre: 'Pedro', apellidos: 'Vega Alonso', activo: false },
];

// profesor: índice en [profesor@ucf.edu.cu, ...PROFESORES]
const ASIGNATURAS: { nombre: string; semestre: number; profesor: number; activo: boolean }[] = [
  { nombre: 'Matemática I', semestre: 1, profesor: 1, activo: true },
  { nombre: 'Introducción a la Programación', semestre: 1, profesor: 0, activo: true },
  { nombre: 'Filosofía y Sociedad', semestre: 1, profesor: 3, activo: true },
  { nombre: 'Matemática II', semestre: 2, profesor: 1, activo: true },
  { nombre: 'Programación Orientada a Objetos', semestre: 2, profesor: 0, activo: true },
  { nombre: 'Física General', semestre: 2, profesor: 4, activo: true },
  { nombre: 'Estructuras de Datos', semestre: 3, profesor: 2, activo: true },
  { nombre: 'Bases de Datos', semestre: 3, profesor: 2, activo: true },
  { nombre: 'Probabilidades y Estadística', semestre: 3, profesor: 4, activo: true },
  { nombre: 'Redes de Computadoras', semestre: 4, profesor: 3, activo: true },
  { nombre: 'Ingeniería de Software', semestre: 4, profesor: 0, activo: true },
  { nombre: 'Sistemas Operativos', semestre: 4, profesor: 5, activo: true },
  // Asignatura deshabilitada, para probar el filtro de activas.
  { nombre: 'Historia de Cuba', semestre: 1, profesor: 3, activo: false },
];

const NOMBRES = [
  'Yusnier', 'Daniela', 'Alejandro', 'Sofía', 'Luis', 'Camila', 'Raúl', 'Melissa',
  'Dayron', 'Karla', 'Ernesto', 'Yanet', 'Adrián', 'Lázaro', 'Marta', 'Osvaldo',
  'Beatriz', 'Frank', 'Ivette', 'Michel', 'Naomi', 'Reinier', 'Tatiana', 'Ulises',
];

const APELLIDOS = [
  'Ramos Pérez', 'Gómez Lara', 'Suárez Peña', 'Rodríguez Cruz', 'Acosta Vidal',
  'Hernández Gil', 'Valdés Rojas', 'Cabrera Núñez', 'Ortiz Marín', 'Batista Rey',
  'Delgado Pino', 'Lorenzo Mesa', 'Pérez Quintana', 'Guerra Blanco', 'Arencibia Toledo',
  'Santana Ferrer', 'Miranda Solís', 'Herrera Bravo', 'Cardoso León', 'Palacios Vera',
  'Domínguez Sáez', 'Machado Ibarra', 'Reyes Caro', 'Zamora Nieto',
];

const MUNICIPIOS: Municipio[] = [
  'CIENFUEGOS', 'CIENFUEGOS', 'CIENFUEGOS', 'ABREUS', 'CRUCES', 'CUMANAYAGUA',
  'LAJAS', 'PALMIRA', 'RODAS', 'AGUADA_DE_PASAJEROS',
];

// Calificaciones (0-5); null = todavía sin nota. Con esta mezcla ~25% queda pendiente.
const NOTAS: (number | null)[] = [5, 4, 3, 4, 2, 5, 3, null, 4, 3, 1, 5, 4, 3, 2, 4];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const cacheHash = new Map<string, string>();

async function hash(passwordPlano: string): Promise<string> {
  const cacheado = cacheHash.get(passwordPlano);
  if (cacheado) {
    return cacheado;
  }
  const nuevo = await bcrypt.hash(passwordPlano, 10);
  cacheHash.set(passwordPlano, nuevo);
  return nuevo;
}

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

async function ensureCarrera(nombre: string, plan: 'D' | 'E', activo = true) {
  const existente = await prisma.carrera.findFirst({
    where: { nombre: { equals: nombre, mode: 'insensitive' } },
  });

  if (existente) {
    return existente;
  }

  return prisma.carrera.create({
    data: { nombre, plan, activo },
  });
}

async function ensureUsuario(
  email: string,
  nombre: string,
  apellidos: string,
  rol: Rol,
  passwordPlano: string,
  activo = true,
) {
  const existente = await prisma.usuario.findUnique({
    where: { email },
  });

  const password = await hash(passwordPlano);

  if (existente) {
    return prisma.usuario.update({
      where: { id: existente.id },
      data: { nombre, apellidos, rol, activo, password },
    });
  }

  return prisma.usuario.create({
    data: { email, password, nombre, apellidos, rol, activo },
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

async function ensureEstudiante(
  usuarioId: string,
  carreraId: string,
  carnetIdentidad: string,
  municipio: Municipio,
  observaciones: string,
) {
  const existente = await prisma.estudiante.findUnique({
    where: { usuarioId },
  });

  if (existente) {
    return existente;
  }

  return prisma.estudiante.create({
    data: { usuarioId, carreraId, carnetIdentidad, municipio, observaciones },
  });
}

async function ensureAsignatura(nombre: string, semestre: number, profesorId: string, activo: boolean) {
  const existente = await prisma.asignatura.findFirst({
    where: { nombre: { equals: nombre, mode: 'insensitive' }, semestre },
  });

  if (existente) {
    return existente;
  }

  return prisma.asignatura.create({
    data: { nombre, semestre, profesorId, activo },
  });
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  // Carreras
  const carreras = [];
  for (const c of CARRERAS) {
    carreras.push(await ensureCarrera(c.nombre, c.plan, c.activo));
  }
  const carrerasActivas = carreras.filter((c) => c.activo);

  // Cuentas base (las que documenta docs/instalacion.md)
  await ensureUsuario('admin@ucf.edu.cu', 'Administrador', 'Sistema', Rol.ADMIN, 'Admin123!');
  await ensureUsuario('vicedecana@ucf.edu.cu', 'Ana', 'Pérez', Rol.VICEDECANO, 'Vice123!');

  // Profesores: el profesor base + los adicionales
  const profesorBase = await ensureUsuario('profesor@ucf.edu.cu', 'Carlos', 'López', Rol.PROFESOR, 'Profesor123!');
  const profesorIds: string[] = [(await ensureProfesor(profesorBase.id)).id];

  for (const p of PROFESORES) {
    const usuario = await ensureUsuario(p.email, p.nombre, p.apellidos, Rol.PROFESOR, 'Profesor123!', p.activo);
    profesorIds.push((await ensureProfesor(usuario.id)).id);
  }

  // Asignaturas
  const asignaturas = [];
  for (const a of ASIGNATURAS) {
    asignaturas.push(await ensureAsignatura(a.nombre, a.semestre, profesorIds[a.profesor]!, a.activo));
  }
  const asignaturasActivas = asignaturas.filter((a) => a.activo);

  // Estudiantes: el estudiante base + 24 generados (repartidos por carrera y municipio)
  const estudianteBase = await ensureUsuario('estudiante@ucf.edu.cu', 'María', 'García', Rol.ESTUDIANTE, 'Estudiante123!');
  const estudiantes = [
    await ensureEstudiante(estudianteBase.id, carreras[0]!.id, '0102030405', 'CIENFUEGOS', 'Perfil creado por seed.'),
  ];

  for (let i = 0; i < NOMBRES.length; i++) {
    const nombre = NOMBRES[i]!;
    const apellidos = APELLIDOS[i]!;
    const email = `${normalizar(nombre)}.${normalizar(apellidos.split(' ')[0]!)}@ucf.edu.cu`;
    const usuario = await ensureUsuario(email, nombre, apellidos, Rol.ESTUDIANTE, 'Estudiante123!');

    // Carné de 11 dígitos con forma AAMMDDxxxxx, único y determinista.
    const carnet = `${String(98 + (i % 6)).slice(-2)}${String((i % 12) + 1).padStart(2, '0')}${String((i % 27) + 1).padStart(2, '0')}${String(10000 + i * 37).padStart(5, '0')}`;

    estudiantes.push(
      await ensureEstudiante(
        usuario.id,
        carrerasActivas[i % carrerasActivas.length]!.id,
        carnet,
        MUNICIPIOS[i % MUNICIPIOS.length]!,
        'Perfil creado por seed.',
      ),
    );
  }

  // Evaluaciones: cada estudiante es evaluado en 4 asignaturas activas, con notas variadas.
  const ahora = Date.now();
  let evaluaciones = 0;

  for (let i = 0; i < estudiantes.length; i++) {
    for (let j = 0; j < 4; j++) {
      const asignatura = asignaturasActivas[(i * 3 + j * 2) % asignaturasActivas.length]!;
      const calificacion = NOTAS[(i * 5 + j * 3) % NOTAS.length] ?? null;
      const estado = calificacion !== null && calificacion >= 3 ? 'APROBADA' : 'PENDIENTE';
      const fecha = new Date(ahora - ((i * 4 + j * 9) % 60) * 24 * 60 * 60 * 1000);

      await prisma.evaluacion.upsert({
        where: {
          estudianteId_asignaturaId: { estudianteId: estudiantes[i]!.id, asignaturaId: asignatura.id },
        },
        update: { calificacion, estado, fecha },
        create: { estudianteId: estudiantes[i]!.id, asignaturaId: asignatura.id, calificacion, estado, fecha },
      });
      evaluaciones++;
    }
  }

  const [nCarreras, nUsuarios, nProfesores, nEstudiantes, nAsignaturas, nEvaluaciones, nPendientes] = await Promise.all([
    prisma.carrera.count(),
    prisma.usuario.count(),
    prisma.profesor.count(),
    prisma.estudiante.count(),
    prisma.asignatura.count(),
    prisma.evaluacion.count(),
    prisma.evaluacion.count({ where: { estado: 'PENDIENTE' } }),
  ]);

  console.log('Seed ejecutado correctamente.');
  console.table({
    carreras: nCarreras,
    usuarios: nUsuarios,
    profesores: nProfesores,
    estudiantes: nEstudiantes,
    asignaturas: nAsignaturas,
    evaluaciones: `${nEvaluaciones} (${nPendientes} pendientes)`,
  });
  console.log(`(${evaluaciones} evaluaciones procesadas en esta corrida)`);
  console.log('Cuentas base: admin@ucf.edu.cu / Admin123! · vicedecana@ucf.edu.cu / Vice123! · profesor@ucf.edu.cu / Profesor123! · estudiante@ucf.edu.cu / Estudiante123!');
  console.log('Profesores y estudiantes generados usan Profesor123! y Estudiante123! respectivamente.');
}

main()
  .catch((error) => {
    console.error('Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
