import type { EstadoEvaluacion, Municipio, Plan } from "@/types/api"

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