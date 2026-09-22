export type Rol = "ADMIN" | "VICEDECANO" | "PROFESOR" | "ESTUDIANTE"
export type Plan = "D" | "E"
export type EstadoEvaluacion = "APROBADA" | "PENDIENTE"

export type Municipio =
  | "CIENFUEGOS"
  | "ABREUS"
  | "CRUCES"
  | "CUMANAYAGUA"
  | "LAJAS"
  | "PALMIRA"
  | "RODAS"
  | "AGUADA_DE_PASAJEROS"

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellidos: string
  rol: Rol
  activo: boolean
  telefono: string | null
  createdAt: string
  updatedAt: string
}

export interface Carrera {
  id: string
  nombre: string
  plan: Plan
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface PerfilEstudiante {
  id: string
  usuarioId: string
  carreraId: string
  carnetIdentidad: string
  municipio: Municipio
  observaciones: string | null
  carrera?: Carrera
}

export interface PerfilProfesor {
  id: string
  usuarioId: string
  test1?: string
}

export interface UsuarioPerfil extends Usuario {
  estudiante: PerfilEstudiante | null
  profesor: PerfilProfesor | null
}

export interface UsuarioResumen {
  id: string
  email: string
  nombre: string
  apellidos: string
  rol: Rol
  activo: boolean
  telefono: string | null
}

export interface Estudiante extends PerfilEstudiante {
  createdAt: string
  updatedAt: string
}

export interface EstudianteDetallado extends Estudiante {
  usuario: UsuarioResumen
  carrera: Carrera
}

export interface Profesor {
  id: string
  usuarioId: string
}

export interface ProfesorDetallado extends Profesor {
  usuario: UsuarioResumen
  asignaturas: Asignatura[]
  createdAt: string
}

export interface Asignatura {
  id: string
  nombre: string
  semestre: number
  profesorId: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface AsignaturaDetallada extends Asignatura {
  profesor: ProfesorConUsuario
}

export interface CarreraResumen {
  id: string
  nombre: string
  plan: Plan
  activo: boolean
}

export interface AsignaturaConCarreras extends AsignaturaDetallada {
  carreras: CarreraResumen[]
}

export interface ProfesorConUsuario extends Profesor {
  usuario: UsuarioResumen
}

export interface Evaluacion {
  id: string
  estudianteId: string
  asignaturaId: string
  calificacion: number | null
  estado: EstadoEvaluacion
  observaciones: string | null
  fecha: string
  createdAt: string
  updatedAt: string
}

export interface EvaluacionDetallada extends Evaluacion {
  estudiante: EstudianteConCarreraYUsuario
  asignatura: AsignaturaDetallada
}

export interface EstudianteConCarreraYUsuario extends Estudiante {
  usuario: UsuarioResumen
  carrera: Carrera
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  usuario: UsuarioPerfil
}

export interface CrearUsuarioRequest {
  email: string
  password: string
  nombre: string
  apellidos: string
  rol: Rol
  telefono?: string
}

export interface ActualizarUsuarioRequest {
  email?: string
  nombre?: string
  apellidos?: string
  rol?: Rol
  activo?: boolean
  telefono?: string
}

export interface CrearCarreraRequest {
  nombre: string
  plan: Plan
}

export interface ActualizarCarreraRequest {
  nombre?: string
  plan?: Plan
  activo?: boolean
}

export interface CrearAsignaturaRequest {
  nombre: string
  semestre: number
  profesorId: string
  carreraIds: string[]
}

export interface ActualizarAsignaturaRequest {
  nombre?: string
  semestre?: number
  activo?: boolean
  profesorId?: string
  carreraIds?: string[]
}

export interface RegistroEvaluacionRequest {
  estudianteId: string
  asignaturaId: string
  calificacion?: number | null
  fecha?: string
  observaciones?: string | null
}

export interface CrearPerfilEstudianteRequest {
  carreraId: string
  carnetIdentidad: string
  municipio: Municipio
  observaciones?: string | null
}

export interface ActualizarEstudianteRequest {
  carreraId?: string
  carnetIdentidad?: string
  municipio?: Municipio
  observaciones?: string | null
}

export interface CrearEstudianteRequest {
  email: string
  password: string
  nombre: string
  apellidos: string
  telefono?: string
  carreraId: string
  carnetIdentidad: string
  municipio: Municipio
  observaciones?: string | null
}

export interface FiltrosEvaluaciones {
  asignaturaId?: string
  profesorId?: string
  semestre?: number
  municipio?: Municipio
  estado?: EstadoEvaluacion
}

export const MUNICIPIOS: Municipio[] = [
  "CIENFUEGOS",
  "ABREUS",
  "CRUCES",
  "CUMANAYAGUA",
  "LAJAS",
  "PALMIRA",
  "RODAS",
  "AGUADA_DE_PASAJEROS",
]

export const ROLES: Rol[] = ["ADMIN", "VICEDECANO", "PROFESOR", "ESTUDIANTE"]
export const PLANES: Plan[] = ["D", "E"]