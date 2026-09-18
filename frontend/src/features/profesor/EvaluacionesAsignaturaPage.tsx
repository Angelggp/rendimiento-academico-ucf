import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronLeft, Loader2, TriangleAlert } from "lucide-react"
import { ApiError } from "@/lib/api"
import { useEstudiantes } from "@/features/estudiantes/use-estudiantes"
import { useAuth } from "@/features/auth/use-auth"
import {
  useEvaluacionesAsignatura,
  useMisAsignaturas,
  useRegistrarEvaluacion,
} from "./use-profesor"
import type {
  Carrera,
  EvaluacionDetallada,
  EstudianteDetallado,
} from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type DatosFormulario = z.infer<typeof esquema>

const esquema = z.object({
  calificacion: z
    .number({ message: "Debe ser un número entre 0 y 5" })
    .int("Debe ser un número entero")
    .min(0, "Debe estar entre 0 y 5")
    .max(5, "Debe estar entre 0 y 5")
    .nullable(),
})

interface FilaEvaluacionProps {
  estudiante: EstudianteDetallado
  evaluacion: EvaluacionDetallada | undefined
  asignaturaId: string
}

function FilaEvaluacion({
  estudiante,
  evaluacion,
  asignaturaId,
}: FilaEvaluacionProps) {
  const mutation = useRegistrarEvaluacion(asignaturaId)
  const [notaTexto, setNotaTexto] = useState(
    evaluacion?.calificacion != null ? String(evaluacion.calificacion) : "",
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      calificacion: evaluacion?.calificacion ?? null,
    },
  })

  const { onChange: onChangeCalificacion, ...propsCalificacion } = register(
    "calificacion",
    {
      setValueAs: (v) => (v === "" ? null : Number(v)),
    },
  )

  const notaNum = notaTexto.trim() === "" ? null : Number(notaTexto)
  const tieneNota = notaNum !== null && !Number.isNaN(notaNum)
  const aprobada = tieneNota && notaNum >= 3
  const etiquetaEstado = !tieneNota
    ? "Sin nota"
    : aprobada
      ? "Aprobada"
      : "Pendiente"

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate({
      estudianteId: estudiante.id,
      asignaturaId,
      calificacion: datos.calificacion,
    })
  })

  const errorServidor =
    mutation.error instanceof ApiError ? mutation.error.message : null

  return (
    <TableRow key={estudiante.id}>
      <TableCell>
        <div className="font-medium">
          {estudiante.usuario.nombre} {estudiante.usuario.apellidos}
        </div>
        <div className="text-muted-foreground text-xs">
          {estudiante.carnetIdentidad}
        </div>
      </TableCell>
      <TableCell>
        <form
          onSubmit={alGuardar}
          className="flex flex-wrap items-center gap-2"
        >
          <div className="flex flex-col gap-1">
            <Label
              htmlFor={`calificacion-${estudiante.id}`}
              className="sr-only"
            >
              Calificación
            </Label>
            <Input
              id={`calificacion-${estudiante.id}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={5}
              step={1}
              className="w-16 text-center"
              placeholder="Nota"
              {...propsCalificacion}
              onChange={(e) => {
                onChangeCalificacion(e)
                setNotaTexto(e.target.value)
              }}
              aria-invalid={!!errors.calificacion}
            />
            {errors.calificacion && (
              <span className="text-destructive text-xs">
                {errors.calificacion.message}
              </span>
            )}
          </div>

          <Badge variant={aprobada ? "default" : "secondary"}>
            {etiquetaEstado}
          </Badge>

          <div className="flex flex-col gap-1">
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isSuccess ? "Actualizado" : "Guardar"}
            </Button>
            {errorServidor && (
              <span className="text-destructive text-xs">{errorServidor}</span>
            )}
          </div>
        </form>
      </TableCell>
    </TableRow>
  )
}

export function EvaluacionesAsignaturaPage() {
  const { asignaturaId = "" } = useParams<{ asignaturaId: string }>()
  const { usuario } = useAuth()
  const [carreraId, setCarreraId] = useState("")

  const {
    data: asignaturas,
    isLoading: cargandoAsignaturas,
    isError: errorAsignaturas,
    error: errorAsignaturasDetalle,
  } = useMisAsignaturas()
  const { data: estudiantes, isLoading: cargandoEstudiantes } = useEstudiantes()
  const { data: evaluaciones, isLoading: cargandoEvaluaciones } =
    useEvaluacionesAsignatura(asignaturaId)

  const asignatura = asignaturas?.find((a) => a.id === asignaturaId)

  const carreras = useMemo(() => {
    const mapa = new Map<string, Carrera>()
    for (const estudiante of estudiantes ?? []) {
      if (!mapa.has(estudiante.carrera.id)) {
        mapa.set(estudiante.carrera.id, estudiante.carrera)
      }
    }
    return [...mapa.values()]
  }, [estudiantes])

  const visibles = useMemo(
    () =>
      carreraId
        ? (estudiantes ?? []).filter((e) => e.carrera.id === carreraId)
        : (estudiantes ?? []),
    [estudiantes, carreraId],
  )

  const evaluacionPorEstudiante = useMemo(
    () =>
      new Map(
        (evaluaciones ?? []).map((ev) => [ev.estudianteId, ev] as const),
      ),
    [evaluaciones],
  )

  if (errorAsignaturas) {
    return (
      <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
        <TriangleAlert className="size-4" />
        No se pudieron cargar las asignaturas:{" "}
        {String(errorAsignaturasDetalle?.message ?? errorAsignaturasDetalle)}
      </div>
    )
  }

  if (cargandoAsignaturas) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!asignatura) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border bg-muted/40 p-4 text-sm">
        No tienes acceso a esta asignatura o no existe.
        <Button asChild variant="outline" size="sm">
          <Link to="/profesor/asignaturas">
            <ChevronLeft />
            Volver a mis asignaturas
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{asignatura.nombre}</h2>
          <p className="text-muted-foreground text-sm">
            Semestre {asignatura.semestre}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/profesor/asignaturas">
            <ChevronLeft />
            Mis asignaturas
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        {usuario?.profesor
          ? "Nota de 0 a 5 por estudiante. La aprobación se deduce automáticamente: 3 o más aprobada."
          : ""}
      </p>

      <div className="flex items-center gap-2">
        <Label htmlFor="carrera">Carrera</Label>
        <Select
          id="carrera"
          value={carreraId}
          onChange={(e) => setCarreraId(e.target.value)}
          className="w-72"
        >
          <option value="">Todas las carreras</option>
          {carreras.map((carrera) => (
            <option key={carrera.id} value={carrera.id}>
              {carrera.nombre} — Plan {carrera.plan}
            </option>
          ))}
        </Select>
      </div>

      {cargandoEstudiantes || cargandoEvaluaciones ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : visibles.length === 0 ? (
        <div className="text-muted-foreground rounded-md border bg-muted/40 p-4 text-sm">
          No hay estudiantes para esa carrera.
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes</CardTitle>
            <CardDescription>{visibles.length} estudiantes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Calificación y estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((estudiante) => (
                  <FilaEvaluacion
                    key={evaluacionPorEstudiante.get(estudiante.id)?.id ?? estudiante.id}
                    estudiante={estudiante}
                    evaluacion={evaluacionPorEstudiante.get(estudiante.id)}
                    asignaturaId={asignaturaId}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}