import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type {
  ActualizarEstudianteRequest,
  CrearPerfilEstudianteRequest,
} from "@/types/api"
import {
  actualizarEstudiantePropio,
  crearPerfilEstudiante,
  listarMisEvaluaciones,
  obtenerEstudiantePropio,
} from "./estudiante-api"

export const CLAVE_ESTUDIANTES = ["estudiantes"]

export function useEstudiantePropio(estudianteId: string | undefined) {
  return useQuery({
    queryKey: ["estudiantes", estudianteId],
    queryFn: () => obtenerEstudiantePropio(estudianteId ?? ""),
    enabled: !!estudianteId,
    staleTime: 60_000,
  })
}

export function useCrearPerfilEstudiante() {
  return useMutation({
    mutationFn: (payload: CrearPerfilEstudianteRequest) =>
      crearPerfilEstudiante(payload),
    onSuccess: () => {
      toast.success("Perfil de estudiante completado. ¡Bienvenido!")
    },
  })
}

export function useActualizarEstudiantePropio(estudianteId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ActualizarEstudianteRequest) =>
      actualizarEstudiantePropio(estudianteId ?? "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estudiantes", estudianteId] })
      toast.success("Perfil actualizado")
    },
  })
}

export function useMisEvaluaciones(estudianteId: string | undefined) {
  return useQuery({
    queryKey: ["evaluaciones", "estudiante", estudianteId],
    queryFn: () => listarMisEvaluaciones(estudianteId ?? ""),
    enabled: !!estudianteId,
    staleTime: 30_000,
  })
}