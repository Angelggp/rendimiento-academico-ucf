import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { ApiError } from "@/lib/api"
import { esquemaSemestre } from "@/lib/validaciones"
import { useCrearAsignatura, useProfesores } from "./use-asignaturas"
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
  semestre: esquemaSemestre,
  profesorId: z.string().min(1, { message: "Seleccione un profesor" }),
  carreraIds: z
    .array(z.string())
    .min(1, { message: "Seleccione al menos una carrera" }),
})

type DatosFormulario = z.infer<typeof esquema>

export function CrearAsignaturaDialog() {
  const [abierto, setAbierto] = useState(false)
  const mutation = useCrearAsignatura()
  const profesores = useProfesores()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: "", semestre: 1, profesorId: "", carreraIds: [] },
  })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(datos, {
      onSuccess: () => {
        reset({ nombre: "", semestre: 1, profesorId: "", carreraIds: [] })
        setAbierto(false)
      },
    })
  })

  const errorServidor =
    mutation.error instanceof ApiError ? mutation.error.message : null

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button>Nueva asignatura</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear asignatura</DialogTitle>
          <DialogDescription>
            Vincule la asignatura a un profesor y su semestre.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" placeholder="Programación III" {...register("nombre")} aria-invalid={!!errors.nombre} />
            {errors.nombre && <p className="text-destructive text-sm">{errors.nombre.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="semestre">Semestre</Label>
            <Input
              id="semestre"
              type="number"
              min={1}
              max={8}
              {...register("semestre", { valueAsNumber: true })}
              aria-invalid={!!errors.semestre}
            />
            {errors.semestre && <p className="text-destructive text-sm">{errors.semestre.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="profesor">Profesor encargado</Label>
            <Select id="profesor" {...register("profesorId")} aria-invalid={!!errors.profesorId}>
              <option value="">Seleccione un profesor…</option>
              {profesores.data?.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.usuario.nombre} {profesor.usuario.apellidos}
                </option>
              ))}
            </Select>
            {errors.profesorId && <p className="text-destructive text-sm">{errors.profesorId.message}</p>}
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
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}