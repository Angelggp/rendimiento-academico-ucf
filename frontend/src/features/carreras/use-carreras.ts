import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  actualizarCarrera,
  crearCarrera,
  listarCarreras,
} from "./carreras-api"
import type {
  ActualizarCarreraRequest,
  CrearCarreraRequest,
} from "@/types/api"

export const CLAVE_CARRERAS = ["carreras"]

export function useCarreras() {
  return useQuery({
    queryKey: CLAVE_CARRERAS,
    queryFn: listarCarreras,
  })
}

export function useCrearCarrera() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearCarreraRequest) => crearCarrera(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CLAVE_CARRERAS })
      toast.success(`Carrera "${variables.nombre}" creada`)
    },
  })
}

export function useActualizarCarrera() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ActualizarCarreraRequest
    }) => actualizarCarrera(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_CARRERAS })
      toast.success("Carrera actualizada")
    },
  })
}