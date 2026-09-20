# Flujo por rol

Qué puede hacer cada rol hoy, y un ejemplo práctico encadenado para probarlo de punta a punta con los usuarios de prueba del seed (ver `docs/instalacion.md`).

## Qué puede hacer cada rol

| Rol | Puede |
|---|---|
| **Administrador** | Crear cuentas de usuario (con cualquier rol — si el rol es Profesor, se le crea el perfil de profesor automático) y mantener el catálogo de asignaturas (nombre, semestre, profesor a cargo). |
| **Vicedecana** | CRUD de carreras y de estudiantes (alta completa: cuenta + perfil académico en un paso), ver profesores, ver **Pendientes** (estudiantes sin nota o con nota &lt; 3) y **Reportes** (evaluaciones filtrables por asignatura/profesor/semestre/municipio/estado). |
| **Profesor** | Ver solo sus asignaturas y, dentro de cada una, poner o cambiar la nota (0-5) a cualquier estudiante. La aprobación es automática: 3 o más = Aprobada. |
| **Estudiante** | Completar su perfil académico la primera vez (carrera, carné, municipio) y ver el estado de sus propias evaluaciones. |

## Ejemplo práctico de punta a punta

Escenario: se abre una asignatura nueva, se matricula un estudiante, el profesor lo evalúa, y la vicedecana lo hace seguimiento.

1. **Admin** (`admin@ucf.edu.cu`) entra a *Usuarios* → crea un usuario con rol **Profesor** (ej. `nuevo.profesor@ucf.edu.cu`). El perfil de profesor se crea solo.
2. **Admin** entra a *Asignaturas* → crea "Redes I", semestre 3, a cargo del profesor recién creado.
3. **Vicedecana** (`vicedecana@ucf.edu.cu`) entra a *Estudiantes* → *Nuevo estudiante* → completa nombre, correo, contraseña, carrera, carné y municipio. Esto crea la cuenta y el perfil en un solo paso (antes había que pasar primero por Admin → Usuarios).
4. Ese **profesor** se loguea, entra a *Mis Asignaturas* → "Redes I", ve la lista completa de estudiantes (filtrable por carrera) y le pone nota al que acaba de crear la vicedecana. Si pone `2`, la fila queda en estado **Pendiente**; si pone `3` o más, **Aprobada**.
5. **Vicedecana** entra a *Pendientes*: si la nota fue menor a 3, el estudiante aparece ahí (puede filtrar por asignatura, profesor o municipio). Si en cambio quiere ver el panorama completo (aprobados y pendientes juntos), usa *Reportes* con los mismos filtros más el estado.
6. El **dashboard** de la vicedecana (`/vicedecana`) resume esto sin entrar a ningún filtro: cuántos estudiantes hay en total y cuántas evaluaciones están pendientes ahora mismo.
7. El **estudiante** se loguea con su propia cuenta y ve, en su perfil, el mismo estado (Pendiente/Aprobada) que el profesor acaba de registrar.

Con esto se cubre el ciclo completo: alta de profesor y asignatura (Admin), alta de estudiante (Vicedecana), evaluación (Profesor), seguimiento (Vicedecana) y consulta propia (Estudiante) — que es, en definitiva, el problema que reemplaza a la planilla manual.
