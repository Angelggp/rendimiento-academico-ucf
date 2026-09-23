import { useState } from "react"
import { useForm } from "react-hook-form"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Pencil, TriangleAlert } from "lucide-react"
import { ApiError } from "@/lib/api"
import { useAuth } from "@/features/auth/use-auth"
import { useCarreras } from "@/features/carreras/use-carreras"
import { esquemaCarnetIdentidad } from "@/lib/validaciones"
import {
  useActualizarEstudiantePropio,
  useCrearPerfilEstudiante,
  useEstudiantePropio,
  useMisEvaluaciones,
} from "./use-estudiante"
import {
  ETIQUETA_ESTADO_EVALUACION,
  ETIQUETA_MUNICIPIO,
  ETIQUETA_PLAN,
} from "@/lib/format"
import {
  MUNICIPIOS,
  type Carrera,
  type EstudianteDetallado,
  type Municipio,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const esquemaPerfil = z.object({
  carreraId: z.string().min(1, "Elige una carrera"),
  carnetIdentidad: esquemaCarnetIdentidad,
  municipio: z.enum(
    MUNICIPIOS as unknown as readonly [Municipio, ...Municipio[]],
    { message: "Elige un municipio" },
  ),
  observaciones: z.string().optional(),
})

type DatosPerfilFormulario = z.infer<typeof esquemaPerfil>

interface CamposPerfilProps {
  register: UseFormRegister<DatosPerfilFormulario>
  errors: FieldErrors<DatosPerfilFormulario>
  cargandoCarreras: boolean
  carreras: Carrera[]
}

function CamposPerfil({
  register,
  errors,
  cargandoCarreras,
  carreras,
}: CamposPerfilProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="carreraId">Carrera</Label>
        <Select
          id="carreraId"
          {...register("carreraId")}
          disabled={cargandoCarreras}
          aria-invalid={!!errors.carreraId}
        >
          <option value="">
            {cargandoCarreras ? "Cargando…" : "Selecciona tu carrera"}
          </option>
          {carreras.map((carrera) => (
            <option key={carrera.id} value={carrera.id}>
              {carrera.nombre} ({ETIQUETA_PLAN[carrera.plan]})
            </option>
          ))}
        </Select>
        {errors.carreraId && (
          <p className="text-destructive text-sm">{errors.carreraId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="carnetIdentidad">Carné de identidad</Label>
        <Input
          id="carnetIdentidad"
          inputMode="numeric"
          maxLength={11}
          placeholder="00000000000"
          {...register("carnetIdentidad")}
          aria-invalid={!!errors.carnetIdentidad}
        />
        {errors.carnetIdentidad && (
          <p className="text-destructive text-sm">
            {errors.carnetIdentidad.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="municipio">Municipio</Label>
        <Select id="municipio" {...register("municipio")}>
          {MUNICIPIOS.map((municipio) => (
            <option key={municipio} value={municipio}>
              {ETIQUETA_MUNICIPIO[municipio]}
            </option>
          ))}
        </Select>
        {errors.municipio && (
          <p className="text-destructive text-sm">{errors.municipio.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="observaciones">Observaciones (opcional)</Label>
        <textarea
          id="observaciones"
          rows={3}
          placeholder="Notas, dificultades, etc."
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 md:text-sm"
          {...register("observaciones")}
        />
      </div>
    </>
  )
}

interface FormularioCompletarPerfilProps {
  onCreado: (perfil: EstudianteDetallado) => void
}

function FormularioCompletarPerfil({ onCreado }: FormularioCompletarPerfilProps) {
  const { data: carreras, isLoading: cargandoCarreras } = useCarreras()
  const mutation = useCrearPerfilEstudiante()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosPerfilFormulario>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: {
      carreraId: "",
      carnetIdentidad: "",
      municipio: "CIENFUEGOS",
      observaciones: "",
    },
  })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(
      {
        carreraId: datos.carreraId,
        carnetIdentidad: datos.carnetIdentidad.trim(),
        municipio: datos.municipio,
        observaciones: datos.observaciones?.trim() || null,
      },
      { onSuccess: onCreado },
    )
  })

  const errorServidor =
    mutation.error instanceof ApiError ? mutation.error.message : null

  const carrerasActivas = carreras?.filter((c) => c.activo) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completa tu perfil</CardTitle>
        <CardDescription>
          Es la primera vez que entras: suma tus datos académicos para poder
          consultar tus evaluaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <CamposPerfil
            register={register}
            errors={errors}
            cargandoCarreras={cargandoCarreras}
            carreras={carrerasActivas}
          />

          {errorServidor && (
            <p className="text-destructive rounded-md border bg-destructive/5 p-2 text-sm">
              {errorServidor}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Guardar mi perfil
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{etiqueta}</span>
      <span className="font-medium">{valor}</span>
    </div>
  )
}

function DialogoEditarPerfil({ perfil }: { perfil: EstudianteDetallado }) {
  const [abierto, setAbierto] = useState(false)
  const mutation = useActualizarEstudiantePropio(perfil.id)
  const { data: carreras, isLoading: cargandoCarreras } = useCarreras()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosPerfilFormulario>({
    resolver: zodResolver(esquemaPerfil),
    values: {
      carreraId: perfil.carreraId,
      carnetIdentidad: perfil.carnetIdentidad,
      municipio: perfil.municipio,
      observaciones: perfil.observaciones ?? "",
    },
  })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(
      {
        carreraId: datos.carreraId,
        carnetIdentidad: datos.carnetIdentidad.trim(),
        municipio: datos.municipio,
        observaciones: datos.observaciones?.trim() || null,
      },
      { onSuccess: () => setAbierto(false) },
    )
  })

  const errorServidor =
    mutation.error instanceof ApiError ? mutation.error.message : null

  const carrerasActivas = carreras?.filter((c) => c.activo) ?? []

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil />
          Editar perfil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar mi perfil</DialogTitle>
          <DialogDescription>
            Actualiza tus datos académicos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <CamposPerfil
            register={register}
            errors={errors}
            cargandoCarreras={cargandoCarreras}
            carreras={carrerasActivas}
          />

          {errorServidor && (
            <p className="text-destructive rounded-md border bg-destructive/5 p-2 text-sm">
              {errorServidor}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DatosPerfil({ perfil }: { perfil: EstudianteDetallado }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Mi perfil</CardTitle>
          <CardDescription>Tus datos académicos.</CardDescription>
        </div>
        <DialogoEditarPerfil perfil={perfil} />
      </CardHeader>
      <CardContent className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <Dato
          etiqueta="Nombre"
          valor={`${perfil.usuario.nombre} ${perfil.usuario.apellidos}`}
        />
        <Dato etiqueta="Correo" valor={perfil.usuario.email} />
        <Dato etiqueta="Carné de identidad" valor={perfil.carnetIdentidad} />
        <Dato etiqueta="Municipio" valor={ETIQUETA_MUNICIPIO[perfil.municipio]} />
        <Dato
          etiqueta="Carrera"
          valor={`${perfil.carrera.nombre} (${ETIQUETA_PLAN[perfil.carrera.plan]})`}
        />
        {perfil.observaciones && (
          <Dato etiqueta="Observaciones" valor={perfil.observaciones} />
        )}
      </CardContent>
    </Card>
  )
}

function EvaluacionesEstudiante({ estudianteId }: { estudianteId: string }) {
  const { data: evaluaciones, isLoading, isError, error } =
    useMisEvaluaciones(estudianteId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis evaluaciones</CardTitle>
        <CardDescription>{evaluaciones?.length ?? 0} asignaturas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-destructive flex items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm">
            <TriangleAlert className="size-4" />
            No se pudieron cargar tus evaluaciones:{" "}
            {String(error?.message ?? error)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asignatura</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluaciones?.map((evaluacion) => (
                <TableRow key={evaluacion.id}>
                  <TableCell className="font-medium">
                    {evaluacion.asignatura.nombre}
                  </TableCell>
                  <TableCell>{evaluacion.asignatura.semestre}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {evaluacion.asignatura.profesor.usuario.nombre}{" "}
                    {evaluacion.asignatura.profesor.usuario.apellidos}
                  </TableCell>
                  <TableCell>{evaluacion.calificacion ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        evaluacion.estado === "APROBADA" ? "default" : "secondary"
                      }
                    >
                      {ETIQUETA_ESTADO_EVALUACION[evaluacion.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(evaluacion.fecha).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {evaluaciones?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-8 text-center"
                  >
                    Aún no tienes evaluaciones registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export function PerfilEstudiantePage() {
  const { usuario } = useAuth()
  const [perfilCreadoId, setPerfilCreadoId] = useState<string | null>(null)

  const estudianteId = perfilCreadoId ?? usuario?.estudiante?.id
  const { data: perfil, isLoading: cargandoPerfil } = useEstudiantePropio(estudianteId)

  if (!usuario?.estudiante && !perfilCreadoId) {
    return <FormularioCompletarPerfil onCreado={(p) => setPerfilCreadoId(p.id)} />
  }

  return (
    <div className="flex flex-col gap-4">
      {cargandoPerfil ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        perfil && <DatosPerfil perfil={perfil} />
      )}
      {estudianteId && <EvaluacionesEstudiante estudianteId={estudianteId} />}
    </div>
  )
}