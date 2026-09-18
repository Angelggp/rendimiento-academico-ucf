import { useQuery } from "@tanstack/react-query"
import { listarEvaluaciones } from "./reportes-api"
import type { FiltrosEvaluaciones } from "@/types/api"

export function useEvaluaciones(
  filtros: FiltrosEvaluaciones = {},
  opciones?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["evaluaciones", filtros],
    queryFn: () => listarEvaluaciones(filtros),
    enabled: opciones?.enabled,
  })
}
