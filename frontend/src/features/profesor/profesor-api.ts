import { api } from "@/lib/api"
import type {
  AsignaturaConCarreras,
  EvaluacionDetallada,
  RegistroEvaluacionRequest,
} from "@/types/api"

export async function listarMisAsignaturas(): Promise<AsignaturaConCarreras[]> {
  return api.get<AsignaturaConCarreras[]>("/asignaturas/profesor/me")
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