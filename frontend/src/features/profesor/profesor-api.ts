import { api } from "@/lib/api"
import type {
  AsignaturaDetallada,
  EvaluacionDetallada,
  RegistroEvaluacionRequest,
} from "@/types/api"

export async function listarMisAsignaturas(): Promise<AsignaturaDetallada[]> {
  return api.get<AsignaturaDetallada[]>("/asignaturas/profesor/me")
}

export async function listarEvaluacionesDeAsignatura(
  asignaturaId: string,
): Promise<EvaluacionDetallada[]> {
  return api.get<EvaluacionDetallada[]>(`/evaluaciones/asignatura/${asignaturaId}`)
}

export async function registrarEvaluacion(
  payload: RegistroEvaluacionRequest,
): Promise<EvaluacionDetallada> {
  return api.post<EvaluacionDetallada>("/evaluaciones", payload)
}