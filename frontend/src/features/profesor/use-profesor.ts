import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { RegistroEvaluacionRequest } from "@/types/api"
import {
  listarEvaluacionesDeAsignatura,
  listarMisAsignaturas,
  registrarEvaluacion,
} from "./profesor-api"

export const CLAVE_MIS_ASIGNATURAS = ["asignaturas", "mias"]

export function useMisAsignaturas() {
  return useQuery({
    queryKey: CLAVE_MIS_ASIGNATURAS,
    queryFn: listarMisAsignaturas,
    staleTime: 60_000,
  })
}

export function claveEvaluacionesAsignatura(asignaturaId: string) {
  return ["evaluaciones", "asignatura", asignaturaId]
}

export function useEvaluacionesAsignatura(asignaturaId: string) {
  return useQuery({
    queryKey: claveEvaluacionesAsignatura(asignaturaId),
    queryFn: () => listarEvaluacionesDeAsignatura(asignaturaId),
    enabled: asignaturaId.length > 0,
    staleTime: 30_000,
  })
}

export function useRegistrarEvaluacion(asignaturaId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegistroEvaluacionRequest) => registrarEvaluacion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: claveEvaluacionesAsignatura(asignaturaId),
      })
    },
  })
}