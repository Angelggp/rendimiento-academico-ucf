# Análisis y flujo del sistema

## Alcance del proyecto

El proyecto centraliza el control y seguimiento del rendimiento académico en
la modalidad semipresencial: información de usuarios, carreras, estudiantes,
profesores, asignaturas, evaluaciones y (en una fase posterior) acciones
correctivas. Permite gestionar la información académica y personal de
estudiantes y profesores, y registrar/consultar las evaluaciones realizadas.

## Estado de los requisitos funcionales

**Se implementan en esta entrega (práctica):**

- RF-01 Gestionar sesión
- RF-02 Gestionar usuarios (registro, roles, estado de cuenta)
- RF-03 Gestionar carreras
- RF-04 Gestionar estudiantes
- RF-05 Gestionar profesores
- RF-06 Gestionar asignaturas
- RF-07 Gestionar evaluaciones

**Definidos en el alcance del proyecto, pendientes de implementar por el
tiempo disponible (quedan documentados para la continuidad):**

- RF-08 Gestionar acciones correctivas
- RF-09 Consultar rendimiento académico
- RF-10 Generar estadísticas del rendimiento académico

**Fuera de alcance — recomendaciones para futuras versiones (ni siquiera
entran en la numeración de RF pendientes):**

1. Gestión de estudiantes pendientes y reubicación académica.
2. Seguimiento de grupos de trabajo colaborativo.
3. Análisis del rendimiento académico por municipio.
4. Generación de reportes integrados (asignatura–profesor–semestre–facultad
   y datos de contacto).
5. Filtros y reportes avanzados para identificar automáticamente grupos de
   estudiantes con dificultades.

## Roles del sistema

Administrador y Vicedecana son roles **separados**, cada uno con su propia
responsabilidad (según el documento inicial del proyecto):

- **Administrador** — gestiona usuarios y cuentas: RF-01 (propio) y RF-02
  completo (registrar cuentas, habilitar/deshabilitar, asignar roles).
  También administra el catálogo de asignaturas (RF-06), por ser una
  configuración técnica del sistema más que académica.
- **Vicedecana** — gestiona la información académica de fondo: RF-01
  (propio), RF-03 (carreras), RF-04 (estudiantes) y RF-05 (profesores).
- **Profesor** — RF-01 (propio) y RF-07 (registra/actualiza evaluaciones,
  solo de sus propias asignaturas).
- **Estudiante** — RF-01 (propio) y consulta de solo lectura de su propio
  perfil y sus evaluaciones (parte de RF-04/RF-07 en modo lectura).

*Nota: esta división de responsabilidades entre Administrador y Vicedecana
es una interpretación a partir del documento inicial del proyecto — si la
asignación real de alguna tarea es distinta, se ajusta sin tocar el modelo
de datos, porque es una decisión de permisos en el backend (`RolesGuard`),
no de estructura de tablas.*

## Flujo de registro y activación de cuentas

Para no sobrecargar al administrador con formularios largos:

1. El administrador registra la cuenta con lo mínimo indispensable: nombre,
   apellidos, email, contraseña y rol (profesor o estudiante).
2. Si el rol es **profesor**, no hace falta nada más — `Profesor` no tiene
   campos propios además del vínculo con `Usuario`.
3. Si el rol es **estudiante**, la fila de `Estudiante` (carrera, carnet de
   identidad, municipio) todavía no existe. Al iniciar sesión por primera
   vez, el sistema detecta que falta ese perfil y lo dirige a completarlo
   antes de dejarlo entrar al resto del sistema.
4. Esa pantalla de "completar perfil" usa el mismo endpoint que la edición
   normal de datos del estudiante (RF-04) — la primera vez crea la fila, las
   siguientes la actualiza.

## Flujo por rol

**Administrador:** inicia sesión, registra cuentas de profesor/estudiante
con los datos mínimos, puede habilitar o deshabilitar el acceso de
cualquier cuenta, y puede reasignar el rol de un usuario si hace falta.
Administra también el catálogo de asignaturas.

**Vicedecana:** inicia sesión y gestiona las carreras (alta, edición,
deshabilitar), y consulta/edita la información académica de estudiantes y
profesores ya registrados por el administrador.

**Profesor:** inicia sesión y ve solo sus asignaturas (filtradas por su
propio id). Entra a una asignatura, ve sus estudiantes matriculados, y por
cada uno tiene una sola fila de evaluación por asignatura: si no existe la
crea, si ya existe la actualiza (no se acumula historial). El sistema
determina el estado (aprobada/pendiente) a partir de esa fila, sin que nadie
lo marque a mano.

**Estudiante:** inicia sesión, completa su perfil la primera vez si falta,
y consulta —de solo lectura— sus datos y el estado de sus evaluaciones por
cada asignatura en la que está matriculado.

## Ejemplo práctico de flujo

La vicedecana Norma crea la carrera "Ingeniería Informática", plan D. El
administrador registra la cuenta del profesor Carlos Rodríguez con solo su
nombre, email y contraseña, y por separado la cuenta de la estudiante
Yusnier Gómez Pérez, también con datos mínimos. Yusnier, al loguearse por
primera vez, completa su perfil: carrera, carnet de identidad y municipio
("Palmira"). La vicedecana crea la asignatura "Programación III", semestre
5, y la vincula a Carlos.

Carlos se loguea y ve solo "Programación III". Entra y ve a Yusnier en la
lista de matriculados; como no le ha puesto nota, su evaluación queda
`PENDIENTE`, sin calificación. Semanas después, Yusnier entrega su trabajo y
Carlos edita esa misma fila: calificación `4` en escala 0-5 → el sistema la
marca automáticamente `APROBADA`.

Yusnier se loguea con su cuenta y ve, en su perfil, el estado de
"Programación III" ya como `APROBADA (4)` — un espejo de lo que Carlos
registró, filtrado automáticamente por su propio id de estudiante.

*(El registro de una acción correctiva sobre Yusnier, si hubiera tenido
dificultades, corresponde a RF-08 — definido en el alcance pero pendiente de
implementar en esta entrega.)*

## Lógica detrás del diseño

- **Nadie marca "pendiente" a mano** — es el estado actual de la única fila
  de evaluación por estudiante-asignatura.
- **Cada rol ve su porción de datos por relación de dueño**: profesor → sus
  asignaturas; estudiante → sus propios registros.
- **El administrador ya no autoregistra el perfil completo** — solo crea la
  cuenta; el dueño de los datos (profesor o estudiante) completa lo que le
  corresponde la primera vez que entra.
- **Administrador y Vicedecana son roles separados** con responsabilidades
  distintas, alineados con el documento inicial: uno gestiona cuentas y
  catálogo técnico, la otra gestiona la información académica de fondo.
- **RF-08, RF-09 y RF-10 están definidos en el alcance del proyecto**, pero
  no se implementan en esta entrega por el tiempo disponible — quedan como
  el punto de partida documentado para la continuidad.
