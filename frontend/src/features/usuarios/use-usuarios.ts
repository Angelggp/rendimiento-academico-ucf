import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  actualizarUsuario,
  crearUsuario,
  listarUsuarios,
} from "./usuarios-api"
import { CLAVE_PROFESORES } from "@/features/profesores/use-profesores"
import type {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
} from "@/types/api"

export const CLAVE_USUARIOS = ["usuarios"]

export function useUsuarios() {
  return useQuery({
    queryKey: CLAVE_USUARIOS,
    queryFn: listarUsuarios,
  })
}

export function useCrearUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearUsuarioRequest) => crearUsuario(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CLAVE_USUARIOS })
      if (variables.rol === "PROFESOR") {
        queryClient.invalidateQueries({ queryKey: CLAVE_PROFESORES })
      }
      toast.success(`Usuario ${variables.nombre} ${variables.apellidos} creado`)
    },
  })
}

export function useActualizarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActualizarUsuarioRequest }) =>
      actualizarUsuario(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLAVE_USUARIOS })
      queryClient.invalidateQueries({ queryKey: CLAVE_PROFESORES })
      toast.success("Usuario actualizado")
    },
  })
}