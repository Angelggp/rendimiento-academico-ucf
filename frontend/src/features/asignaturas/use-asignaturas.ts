import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  actualizarAsignatura,
  crearAsignatura,
  listarAsignaturas,
  listarProfesores,
} from "./asignaturas-api"
import type {
  ActualizarAsignaturaRequest,
  CrearAsignaturaRequest,
} from "@/types/api"

export const CLAVE_ASIGNATURAS = ["asignaturas"]

export function useAsignaturas() {
  return useQuery({
    queryKey: CLAVE_ASIGNATURAS,
    queryFn: listarAsignaturas,
  })
}

export function useCrearAsignatura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearAsignaturaRequest) => crearAsignatura(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CLAVE_ASIGNATURAS })
      toast.success(`Asignatura "${variables.nombre}" creada`)
    },
  })
}

export function useActualizarAsignatura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ActualizarAsignaturaRequest
    }) => actualizarAsignatura(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_ASIGNATURAS })
      toast.success("Asignatura actualizada")
    },
  })
}

export function useProfesores() {
  return useQuery({
    queryKey: ["profesores"],
    queryFn: listarProfesores,
  })
}