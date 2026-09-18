import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  actualizarEstudiante,
  crearEstudiante,
  listarEstudiantes,
} from "./estudiantes-api"
import type {
  ActualizarEstudianteRequest,
  CrearEstudianteRequest,
} from "@/types/api"

export const CLAVE_ESTUDIANTES = ["estudiantes"]

export function useEstudiantes(opciones?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CLAVE_ESTUDIANTES,
    queryFn: listarEstudiantes,
    staleTime: 60_000,
    enabled: opciones?.enabled,
  })
}

export function useCrearEstudiante() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearEstudianteRequest) => crearEstudiante(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CLAVE_ESTUDIANTES })
      toast.success(`Estudiante "${variables.nombre} ${variables.apellidos}" creado`)
    },
  })
}

export function useActualizarEstudiante() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ActualizarEstudianteRequest
    }) => actualizarEstudiante(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_ESTUDIANTES })
      toast.success("Estudiante actualizado")
    },
  })
}
