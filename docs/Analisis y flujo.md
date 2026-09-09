# Análisis y flujo del sistema

## Roles del sistema

El sistema maneja 3 roles funcionales (4 etiquetas, porque administrador y
vicedecana son la misma capacidad de acceso con dos nombres distintos en la
institución):

- **Administrador / Vicedecana** — acceso total: CRUD de carreras, asignaturas,
  estudiantes y profesores (como respaldo manual), generación de códigos de
  invitación, vista de pendientes y reporte filtrable. Es el único nivel con
  permisos de escritura sobre entidades que no le pertenecen.
- **Profesor** — solo ve y gestiona lo que le pertenece: sus asignaturas, las
  evaluaciones de sus estudiantes en ellas, y las acciones correctivas que él
  mismo registra.
- **Estudiante** — acceso de solo lectura a su propio historial: su perfil,
  el estado de sus evaluaciones por asignatura, y las acciones correctivas
  que se le hayan registrado.

Las cuentas de administrador/vicedecana se crean directamente (seed inicial),
porque son quienes habilitan el acceso de los demás. Las cuentas de profesor
y estudiante se crean mediante un **código de invitación**: el admin genera
un código indicando el rol, se lo comparte a la persona, y esta completa su
propio registro con ese código. El alta manual por parte del admin se
mantiene como respaldo, pero deja de ser el camino principal.

## Cómo se separa el acceso según el rol

El `RolesGuard` de Nest lee el rol dentro del JWT en cada request, y el
frontend redirige a un árbol de rutas protegido distinto según ese rol — no
hay pantallas compartidas con permisos condicionales dentro de la misma
vista, son árboles de rutas separados para cada uno de los 3 roles.

## Flujo del profesor

1. Inicia sesión y ve únicamente sus asignaturas (filtradas por su propio id
   de profesor, no por una regla de "ve menos").
2. Entra a una asignatura y ve la lista de estudiantes matriculados en ella.
3. Por cada estudiante existe **una sola fila de evaluación por asignatura**:
   si no existe, la crea; si ya existe, la edita (calificación y/o estado).
   No se acumula historial de evaluaciones, es un estado que se actualiza.
4. Si detecta un problema de rendimiento, registra una **acción correctiva**:
   texto libre con fecha, vinculada al estudiante, la asignatura y él mismo
   como profesor que la emite. A diferencia de la evaluación, esto sí es un
   historial que se acumula — cada acción correctiva es un hecho puntual que
   no se debe perder, y no se puede editar una vez creada.
5. El sistema recalcula solo, a partir del estado de esa fila de evaluación,
   quién queda pendiente. El profesor nunca marca "pendiente" a mano.

## Flujo del administrador/vicedecana

1. Da de alta las carreras (nombre y plan).
2. Genera códigos de invitación para profesores y estudiantes — es quien
   controla quién puede entrar al sistema, sin tener que cargar los datos de
   cada persona a mano.
3. Crea las asignaturas y las vincula a un profesor y a un semestre — es
   quien conecta profesores con asignaturas, ellos no pueden hacerlo.
4. Mantiene CRUD completo de respaldo sobre estudiantes y profesores, por si
   alguien no puede autoregistrarse.
5. Consulta la vista de pendientes: todos los estudiantes con al menos una
   evaluación en estado pendiente, en cualquier asignatura de la facultad,
   sin que nadie la construya a mano.
6. Consulta el reporte filtrable por asignatura, profesor, semestre y
   municipio — cruzando exactamente los datos que profesores y estudiantes
   fueron cargando.

## Flujo del estudiante

1. Inicia sesión y ve su propio perfil: datos personales, carrera y
   municipio de procedencia.
2. Ve el estado de sus evaluaciones por cada asignatura en la que está
   matriculado (aprobada o pendiente, con calificación si el profesor la
   cargó) — es un espejo de lo que el profesor ya registró, filtrado
   automáticamente por su propio id de estudiante.
3. Ve el historial de acciones correctivas que se le hayan registrado, con
   fecha, asignatura y contenido de cada una.
4. Todo es de solo lectura: no edita nada, ni sus propios datos ni sus
   evaluaciones.

## Lógica detrás del diseño

- **Nadie marca "pendiente" a mano.** Es una consulta derivada del estado
  actual de la fila de evaluación de cada estudiante-asignatura.
- **Cada rol ve su porción de datos por relación de dueño**, no por una
  jerarquía de permisos: profesor → sus asignaturas; estudiante → sus
  propios registros.
- **La evaluación es un estado, no un historial** — una sola fila por
  estudiante-asignatura que se actualiza a lo largo del semestre.
- **La acción correctiva sí es un historial** — se acumula porque cada una
  representa un hecho puntual que debe quedar registrado aunque el
  estudiante después apruebe.
- **El acceso de profesor y estudiante se otorga por código de invitación**,
  no por auto-registro abierto ni por aprobación caso por caso — el control
  está en quién recibe el código.
- **El admin/vicedecana es el único con CRUD completo**, y el reporte final
  cruza justo lo que pedía el documento original: asignatura–profesor–
  semestre–municipio, sobre los mismos datos que ya cargaron profesores y
  estudiantes.

---

# Ejemplo real de flujo

Ejemplo completo con datos concretos, siguiendo el ciclo de principio a fin.

## La vicedecana prepara el semestre

La vicedecana Norma entra al sistema y crea la carrera "Ingeniería
Informática", plan D. Genera un código de invitación para profesor
(`P-4F9K2A7B`) y se lo envía a Carlos Rodríguez por correo. Carlos entra a la
pantalla pública de registro, escribe el código, y completa su propio
formulario: nombre, apellidos, email, contraseña. Su cuenta de `Usuario` y su
perfil de `Profesor` quedan creados y activos de inmediato.

Norma genera otro código, esta vez de estudiante (`E-9X2M7Q1L`), y se lo
pasa a Yusnier Gómez Pérez. Yusnier se registra con ese código, y además de
sus datos de cuenta completa su carnet de identidad, su carrera y su
municipio ("Palmira") — todo en el mismo formulario de registro.

Por último, Norma crea la asignatura "Programación III", semestre 5, y la
vincula al profesor Carlos.

En este punto ya existen 3 cuentas activas (Norma, Carlos, Yusnier), pero
todavía no hay ninguna evaluación — el sistema está "vacío" de actividad
académica.

## Durante el semestre — el profesor registra el avance

Carlos se loguea y ve su panel: solo la asignatura "Programación III" (no ve
nada de otros profesores). Entra a la asignatura y ve la lista de sus
estudiantes matriculados, entre ellos Yusnier. Como todavía no le ha puesto
nota, no existe fila de evaluación para ella — crea una: estado
`PENDIENTE`, sin calificación aún, porque Yusnier no ha entregado el primer
trabajo.

Dos semanas después, Yusnier sigue sin entregar. Carlos le registra una
acción correctiva sobre esa asignatura — contenido: *"Se orienta tutoría
adicional por bajo desempeño en unidad 2, se cita para el 15/9"*, con fecha
de hoy. Ese registro queda fijo, no editable después.

Yusnier mejora, entrega el trabajo, y Carlos edita esa misma fila de
evaluación (no crea una nueva): calificación `85`, estado `APROBADA`.

## En paralelo — la vicedecana supervisa toda la facultad

Mientras esto ocurre, Norma puede entrar a su vista de pendientes y ver, sin
que nadie se lo reporte manualmente, la lista completa de estudiantes con
evaluaciones pendientes en cualquier asignatura de la facultad — mientras
Yusnier estuvo en `PENDIENTE`, aparecía ahí; en cuanto Carlos la pasó a
`APROBADA`, desaparece sola. Norma también puede filtrar el reporte, por
ejemplo, "todos los pendientes de estudiantes del municipio Palmira en
asignaturas de Carlos Rodríguez" — cruzando los datos que Carlos y ella
misma fueron cargando.

## El estudiante consulta su propio estado

Yusnier se loguea con su propia cuenta y ve su perfil: sus datos (carrera,
municipio, carnet), y por cada asignatura en la que está matriculada, el
estado de su evaluación — en Programación III ahora ve `APROBADA (85)`. Más
abajo, en su historial de acciones correctivas, ve la tutoría que Carlos le
registró semanas atrás, con la fecha y el texto exacto que él escribió. No
puede editar ni ocultar nada de eso — es una vista de solo lectura de su
propio historial.

## Lo que este ejemplo deja claro sobre el diseño

- El acceso de Carlos y Yusnier se otorgó por código de invitación, no por
  alta manual de Norma ni por auto-registro abierto.
- La misma fila de evaluación se va actualizando a lo largo del semestre —
  no se acumulan evaluaciones viejas.
- "Pendiente" nunca se marca a mano en ningún lado, es un reflejo automático
  del estado de esa fila.
- La acción correctiva sí es un historial que se acumula, porque representa
  un hecho puntual que no se debe perder aunque el estudiante después
  apruebe.
- Cada rol ve exactamente su porción de datos por relación de dueño
  (profesor → sus asignaturas, estudiante → sus propios registros), sin
  reglas de permisos complicadas por encima.
