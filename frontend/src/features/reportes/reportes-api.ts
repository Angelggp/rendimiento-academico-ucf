import { api } from "@/lib/api"
import type { EvaluacionDetallada, FiltrosEvaluaciones } from "@/types/api"

export async function listarEvaluaciones(
  filtros: FiltrosEvaluaciones = {},
): Promise<EvaluacionDetallada[]> {
  const params = new URLSearchParams()
  if (filtros.asignaturaId) params.set("asignaturaId", filtros.asignaturaId)
  if (filtros.profesorId) params.set("profesorId", filtros.profesorId)
  if (filtros.semestre !== undefined) params.set("semestre", String(filtros.semestre))
  if (filtros.municipio) params.set("municipio", filtros.municipio)
  if (filtros.estado) params.set("estado", filtros.estado)

  const query = params.toString()
  return api.get<EvaluacionDetallada[]>(`/evaluaciones${query ? `?${query}` : ""}`)
}
