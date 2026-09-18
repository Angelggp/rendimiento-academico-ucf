import { api } from "@/lib/api"
import type {
  ActualizarEstudianteRequest,
  CrearPerfilEstudianteRequest,
  EstudianteDetallado,
  EvaluacionDetallada,
} from "@/types/api"

export async function crearPerfilEstudiante(
  payload: CrearPerfilEstudianteRequest,
): Promise<EstudianteDetallado> {
  return api.post<EstudianteDetallado>("/estudiantes/perfil", payload)
}

export async function actualizarEstudiantePropio(
  id: string,
  payload: ActualizarEstudianteRequest,
): Promise<EstudianteDetallado> {
  return api.patch<EstudianteDetallado>(`/estudiantes/${id}`, payload)
}

export async function obtenerEstudiantePropio(
  id: string,
): Promise<EstudianteDetallado> {
  return api.get<EstudianteDetallado>(`/estudiantes/${id}`)
}

export async function listarMisEvaluaciones(
  estudianteId: string,
): Promise<EvaluacionDetallada[]> {
  return api.get<EvaluacionDetallada[]>(`/evaluaciones/estudiante/${estudianteId}`)
}