import { api } from "@/lib/api"
import type {
  ActualizarAsignaturaRequest,
  AsignaturaDetallada,
  CrearAsignaturaRequest,
  ProfesorDetallado,
} from "@/types/api"

export async function listarAsignaturas(): Promise<AsignaturaDetallada[]> {
  return api.get<AsignaturaDetallada[]>("/asignaturas")
}

export async function crearAsignatura(
  payload: CrearAsignaturaRequest,
): Promise<AsignaturaDetallada> {
  return api.post<AsignaturaDetallada>("/asignaturas", payload)
}

export async function actualizarAsignatura(
  id: string,
  payload: ActualizarAsignaturaRequest,
): Promise<AsignaturaDetallada> {
  return api.patch<AsignaturaDetallada>(`/asignaturas/${id}`, payload)
}

export async function listarProfesores(): Promise<ProfesorDetallado[]> {
  return api.get<ProfesorDetallado[]>("/profesores")
}