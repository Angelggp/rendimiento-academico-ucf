import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Loader2, Pencil } from "lucide-react"
import { ApiError } from "@/lib/api"
import { useActualizarAsignatura, useProfesores } from "./use-asignaturas"
import type { AsignaturaConCarreras } from "@/types/api"
import { SelectorCarreras } from "./SelectorCarreras"
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
  nombre: z.string().min(1, { message: "El nombre es obligatorio" }),
  semestre: z
    .number({ message: "El semestre debe ser un número" })
    .int({ message: "El semestre debe ser un entero" })
    .min(1, { message: "El semestre debe ser mayor o igual a 1" }),
  profesorId: z.string().min(1, { message: "Seleccione un profesor" }),
  carreraIds: z
    .array(z.string())
    .min(1, { message: "Seleccione al menos una carrera" }),
})

type DatosFormulario = z.infer<typeof esquema>

interface EditarAsignaturaDialogProps {
  asignatura: AsignaturaConCarreras
}

export function EditarAsignaturaDialog({ asignatura }: EditarAsignaturaDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const mutation = useActualizarAsignatura()
  const profesores = useProfesores()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    values: {
      nombre: asignatura.nombre,
      semestre: asignatura.semestre,
      profesorId: asignatura.profesorId,
      carreraIds: asignatura.carreras.map((c) => c.id),
    },
  })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(
      { id: asignatura.id, payload: datos },
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
          <DialogTitle>Editar asignatura</DialogTitle>
          <DialogDescription>
            Actualiza la asignatura{" "}
            <span className="font-medium">{asignatura.nombre}</span> y su
            profesor encargado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} aria-invalid={!!errors.nombre} />
            {errors.nombre && <p className="text-destructive text-sm">{errors.nombre.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="semestre">Semestre</Label>
            <Input
              id="semestre"
              type="number"
              min={1}
              {...register("semestre", { valueAsNumber: true })}
              aria-invalid={!!errors.semestre}
            />
            {errors.semestre && <p className="text-destructive text-sm">{errors.semestre.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="profesor">Profesor encargado</Label>
            <Select id="profesor" {...register("profesorId")} aria-invalid={!!errors.profesorId}>
              {profesores.data?.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.usuario.nombre} {profesor.usuario.apellidos}
                </option>
              ))}
            </Select>
            {errors.profesorId && (
              <p className="text-destructive text-sm">{errors.profesorId.message}</p>
            )}
            {profesores.isLoading && (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-3 animate-spin" /> Cargando profesores…
              </p>
            )}
          </div>

          <Controller
            control={control}
            name="carreraIds"
            render={({ field }) => (
              <SelectorCarreras
                value={field.value}
                onChange={field.onChange}
                error={errors.carreraIds?.message}
              />
            )}
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