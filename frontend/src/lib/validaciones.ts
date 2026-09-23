import { z } from "zod"

function esBisiesto(anio: number) {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0
}

// El carné de identidad cubano codifica la fecha de nacimiento en sus
// primeros 6 dígitos (AAMMDD); si la persona nació en el año 2000 o
// después, se le suma 40 al mes (ej. mes 41 = enero de 2000+). Debe
// coincidir con la misma regla que valida el backend.
export function fechaDeCarnetEsValida(carnetIdentidad: string): boolean {
  const mesCrudo = Number(carnetIdentidad.slice(2, 4))
  const dia = Number(carnetIdentidad.slice(4, 6))
  const mes = mesCrudo > 40 ? mesCrudo - 40 : mesCrudo
  const anio = Number(carnetIdentidad.slice(0, 2)) + (mesCrudo > 40 ? 2000 : 1900)

  if (mes < 1 || mes > 12) {
    return false
  }

  const diasPorMes = [31, esBisiesto(anio) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return dia >= 1 && dia <= diasPorMes[mes - 1]
}

export const esquemaCarnetIdentidad = z
  .string()
  .regex(/^\d{11}$/, { message: "El carné de identidad debe tener 11 dígitos" })
  .refine(fechaDeCarnetEsValida, {
    message: "El carné de identidad no corresponde a una fecha de nacimiento válida",
  })

export const esquemaSemestre = z
  .number({ message: "El semestre debe ser un número" })
  .int({ message: "El semestre debe ser un entero" })
  .min(1, { message: "El semestre debe ser mayor o igual a 1" })
  .max(8, { message: "El semestre debe ser menor o igual a 8" })

// Cuba: código de país +53, seguido del número (8 dígitos para móviles).
export const PLACEHOLDER_TELEFONO = "+53 5XXXXXXX"
