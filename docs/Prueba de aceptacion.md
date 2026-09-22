# Prueba de aceptación

Verifica, desde el punto de vista del usuario final, que el sistema cumple los requisitos funcionales acordados (RF01–RF07). Se ejecuta sobre la aplicación con los datos de prueba del seed, con un caso por cada rol y por cada grupo de requisitos.

**Criterio de aceptación general:** el sistema se acepta si los 8 casos se cumplen tal como se describen, sin errores ni comportamientos inesperados.

## Casos de prueba

| N.° | Requisitos | Actor | Escenario (Dado / Cuando / Entonces) | Resultado |
|---|---|---|---|---|
| CA-01 | RF01-01, RF01-02 | Cualquier usuario | **Dado** un usuario registrado, **cuando** inicia sesión con su correo y contraseña, **entonces** accede a su pantalla de inicio según su rol; **y cuando** cierra sesión, **entonces** vuelve al login y no puede entrar a las pantallas internas. | ☐ Aceptado ☐ Rechazado |
| CA-02 | RF01-01 | Usuario sin acceso | **Dado** un correo o contraseña incorrectos, **cuando** intenta iniciar sesión, **entonces** el sistema rechaza el acceso y muestra un mensaje de error. | ☐ Aceptado ☐ Rechazado |
| CA-03 | RF02-01, RF02-02, RF02-03, RF02-04, RF02-05 | Administrador | **Dado** el administrador en *Usuarios*, **cuando** registra un usuario con rol Profesor, lo edita y lo deshabilita/habilita, **entonces** aparece en la lista con el rol y el estado correctos; **y** un usuario deshabilitado no puede iniciar sesión. | ☐ Aceptado ☐ Rechazado |
| CA-04 | RF03-01 a RF03-04, RF06-01 a RF06-04 | Administrador / Vicedecana | **Dado** el acceso a *Carreras* y *Asignaturas*, **cuando** crea, edita y deshabilita una carrera y una asignatura (esta última con profesor, semestre y las carreras que la cursan), **entonces** los cambios se reflejan en el listado. | ☐ Aceptado ☐ Rechazado |
| CA-05 | RF04-01, RF04-02, RF04-03, RF05-01, RF05-02 | Vicedecana | **Dado** la vicedecana en *Estudiantes*, **cuando** da de alta un estudiante (cuenta y perfil en un paso) y luego edita su carrera o municipio, **entonces** la tabla muestra los datos actualizados; **y** no permite repetir correo ni carné de identidad. Puede consultar *Profesores* con sus asignaturas. | ☐ Aceptado ☐ Rechazado |
| CA-06 | RF04-04, RF07-03 | Estudiante | **Dado** un estudiante que inicia sesión por primera vez, **cuando** completa su perfil (carrera, carné y municipio), **entonces** el sistema lo guarda y le muestra sus evaluaciones, **y solo las suyas**. | ☐ Aceptado ☐ Rechazado |
| CA-07 | RF07-01, RF07-02 | Profesor | **Dado** un profesor en una de **sus** asignaturas, **cuando** registra una nota de 0 a 5 a un estudiante y luego la cambia, **entonces** el estado se calcula solo (3 o más = Aprobada; menos de 3 o sin nota = Pendiente); **y** solo ve a los estudiantes de las carreras que cursan la asignatura, y no puede evaluar en asignaturas de otro profesor, a estudiantes de otra carrera ni usar notas fuera de rango. | ☐ Aceptado ☐ Rechazado |
| CA-08 | RF07-04, RF07-05 | Vicedecana | **Dado** que existen evaluaciones pendientes, **cuando** abre *Pendientes* y *Reportes* y aplica filtros (asignatura, profesor, semestre, municipio, estado), **entonces** ve únicamente los registros que cumplen el filtro, y el contador del inicio coincide con la lista de pendientes. | ☐ Aceptado ☐ Rechazado |

## Resultado de la aceptación

| Casos ejecutados | Aceptados | Rechazados | Observaciones |
|---|---|---|---|
| 8 | ☐ | ☐ | |

**Conclusión:** una vez aceptados todos los casos, el sistema cumple los requisitos funcionales definidos (RF01–RF07) y se considera apto para su entrega.

| Responsable de la prueba | Cliente / tutor que acepta | Fecha |
|---|---|---|
| | | |
