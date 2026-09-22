import { ETIQUETA_ESTADO_EVALUACION, ETIQUETA_MUNICIPIO } from "@/lib/format"
import type { EvaluacionDetallada } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { createAppColumnHelper } from "@/components/ui/data-table"

const helper = createAppColumnHelper<EvaluacionDetallada>()

export const columnasEvaluaciones = helper.columns([
  helper.accessor(
    (evaluacion) =>
      `${evaluacion.estudiante.usuario.nombre} ${evaluacion.estudiante.usuario.apellidos}`,
    {
      id: "estudiante",
      header: "Estudiante",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    },
  ),
  helper.accessor((evaluacion) => evaluacion.estudiante.carnetIdentidad, {
    id: "carnet",
    header: "Carné",
  }),
  helper.accessor((evaluacion) => evaluacion.asignatura.nombre, {
    id: "asignatura",
    header: "Asignatura",
  }),
  helper.accessor(
    (evaluacion) =>
      `${evaluacion.asignatura.profesor.usuario.nombre} ${evaluacion.asignatura.profesor.usuario.apellidos}`,
    {
      id: "profesor",
      header: "Profesor",
    },
  ),
  helper.accessor((evaluacion) => evaluacion.asignatura.semestre, {
    id: "semestre",
    header: "Semestre",
  }),
  helper.accessor(
    (evaluacion) => ETIQUETA_MUNICIPIO[evaluacion.estudiante.municipio],
    { id: "municipio", header: "Municipio" },
  ),
  helper.accessor((evaluacion) => evaluacion.calificacion ?? -1, {
    id: "calificacion",
    header: "Calificación",
    cell: (info) => (info.row.original.calificacion ?? "—"),
  }),
  helper.display({
    id: "estado",
    header: "Estado",
    cell: (info) => (
      <Badge variant={info.row.original.estado === "APROBADA" ? "success" : "warning"}>
        {ETIQUETA_ESTADO_EVALUACION[info.row.original.estado]}
      </Badge>
    ),
  }),
  helper.accessor((evaluacion) => evaluacion.observaciones ?? "", {
    id: "observaciones",
    header: "Observaciones",
    cell: (info) =>
      info.getValue() ? (
        <span className="line-clamp-2 max-w-64 text-sm" title={info.getValue()}>
          {info.getValue()}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  }),
])
