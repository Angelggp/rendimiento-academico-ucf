import { api } from "@/lib/api"
import type {
  ActualizarAsignaturaRequest,
  AsignaturaConCarreras,
  CrearAsignaturaRequest,
  ProfesorDetallado,
} from "@/types/api"

export async function listarAsignaturas(): Promise<AsignaturaConCarreras[]> {
  return api.get<AsignaturaConCarreras[]>("/asignaturas")
}

export async function crearAsignatura(
  payload: CrearAsignaturaRequest,
): Promise<AsignaturaConCarreras> {
  return api.post<AsignaturaConCarreras>("/asignaturas", payload)
}

export async function actualizarAsignatura(
  id: string,
  payload: ActualizarAsignaturaRequest,
): Promise<AsignaturaConCarreras> {
  return api.patch<AsignaturaConCarreras>(`/asignaturas/${id}`, payload)
}

export async function listarProfesores(): Promise<ProfesorDetallado[]> {
  return api.get<ProfesorDetallado[]>("/profesores")
}