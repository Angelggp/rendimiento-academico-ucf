import type { EstadoEvaluacion, Municipio, Plan, Rol } from "@/types/api"

export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMIN: "Administrador",
  VICEDECANO: "Vicedecana",
  PROFESOR: "Profesor",
  ESTUDIANTE: "Estudiante",
}

export const VARIANTE_ROL: Record<Rol, "default" | "secondary" | "outline" | "success"> = {
  ADMIN: "default",
  VICEDECANO: "secondary",
  PROFESOR: "outline",
  ESTUDIANTE: "success",
}

export const ETIQUETA_MUNICIPIO: Record<Municipio, string> = {
  CIENFUEGOS: "Cienfuegos",
  ABREUS: "Abréus",
  CRUCES: "Cruces",
  CUMANAYAGUA: "Cumanayagua",
  LAJAS: "Lajas",
  PALMIRA: "Palmira",
  RODAS: "Rodas",
  AGUADA_DE_PASAJEROS: "Aguada de Pasajeros",
}

export const ETIQUETA_PLAN: Record<Plan, string> = {
  D: "Plan D",
  E: "Plan E",
}

export const ETIQUETA_ESTADO_EVALUACION: Record<EstadoEvaluacion, string> = {
  APROBADA: "Aprobada",
  PENDIENTE: "Pendiente",
}