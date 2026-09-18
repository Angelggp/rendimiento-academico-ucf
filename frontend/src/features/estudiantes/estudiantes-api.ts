import { api } from "@/lib/api"
import type {
  ActualizarEstudianteRequest,
  CrearEstudianteRequest,
  EstudianteDetallado,
} from "@/types/api"

export async function listarEstudiantes(): Promise<EstudianteDetallado[]> {
  return api.get<EstudianteDetallado[]>("/estudiantes")
}

export async function crearEstudiante(
  payload: CrearEstudianteRequest,
): Promise<EstudianteDetallado> {
  return api.post<EstudianteDetallado>("/estudiantes", payload)
}

export async function actualizarEstudiante(
  id: string,
  payload: ActualizarEstudianteRequest,
): Promise<EstudianteDetallado> {
  return api.patch<EstudianteDetallado>(`/estudiantes/${id}`, payload)
}
