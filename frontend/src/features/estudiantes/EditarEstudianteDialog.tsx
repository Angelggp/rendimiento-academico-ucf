import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Loader2, Pencil } from "lucide-react"
import { ApiError } from "@/lib/api"
import { useActualizarEstudiante } from "./use-estudiantes"
import { useCarreras } from "@/features/carreras/use-carreras"
import { ETIQUETA_MUNICIPIO } from "@/lib/format"
import { MUNICIPIOS, type EstudianteDetallado, type Municipio } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const esquema = z.object({
  carreraId: z.string().min(1, { message: "Seleccione una carrera" }),
  carnetIdentidad: z
    .string()
    .min(1, { message: "El carné de identidad es obligatorio" }),
  municipio: z.enum(MUNICIPIOS as unknown as readonly [Municipio, ...Municipio[]], {
    message: "Seleccione un municipio",
  }),
  observaciones: z.string().optional(),
})

type DatosFormulario = z.infer<typeof esquema>

interface EditarEstudianteDialogProps {
  estudiante: EstudianteDetallado
}

export function EditarEstudianteDialog({ estudiante }: EditarEstudianteDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const mutation = useActualizarEstudiante()
  const carreras = useCarreras()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    values: {
      carreraId: estudiante.carreraId,
      carnetIdentidad: estudiante.carnetIdentidad,
      municipio: estudiante.municipio,
      observaciones: estudiante.observaciones ?? "",
    },
  })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(
      {
        id: estudiante.id,
        payload: {
          ...datos,
          observaciones: datos.observaciones?.trim() ? datos.observaciones.trim() : null,
        },
      },
      { onSuccess: () => setAbierto(false) },
    )
  })

  const errorServidor =
    mutation.error instanceof ApiError ? mutation.error.message : null

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar estudiante</DialogTitle>
          <DialogDescription>
            Actualiza el perfil académico de{" "}
            <span className="font-medium">
              {estudiante.usuario.nombre} {estudiante.usuario.apellidos}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="carrera">Carrera</Label>
            <Select id="carrera" {...register("carreraId")} aria-invalid={!!errors.carreraId}>
              {carreras.data?.map((carrera) => (
                <option key={carrera.id} value={carrera.id}>
                  {carrera.nombre}
                </option>
              ))}
            </Select>
            {errors.carreraId && <p className="text-destructive text-sm">{errors.carreraId.message}</p>}
            {carreras.isLoading && (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-3 animate-spin" /> Cargando carreras…
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="carnetIdentidad">Carné de identidad</Label>
              <Input id="carnetIdentidad" {...register("carnetIdentidad")} aria-invalid={!!errors.carnetIdentidad} />
              {errors.carnetIdentidad && <p className="text-destructive text-sm">{errors.carnetIdentidad.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="municipio">Municipio</Label>
              <Select id="municipio" {...register("municipio")} aria-invalid={!!errors.municipio}>
                {MUNICIPIOS.map((municipio) => (
                  <option key={municipio} value={municipio}>
                    {ETIQUETA_MUNICIPIO[municipio]}
                  </option>
                ))}
              </Select>
              {errors.municipio && <p className="text-destructive text-sm">{errors.municipio.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Input id="observaciones" {...register("observaciones")} />
          </div>

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
