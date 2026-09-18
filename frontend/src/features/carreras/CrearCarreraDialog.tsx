import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { ApiError } from "@/lib/api"
import { PLANES, type Plan } from "@/types/api"
import { useCrearCarrera } from "./use-carreras"
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
  plan: z.enum(PLANES as unknown as readonly [Plan, ...Plan[]], {
    message: "El plan es obligatorio",
  }),
})

type DatosFormulario = z.infer<typeof esquema>

export function CrearCarreraDialog() {
  const [abierto, setAbierto] = useState(false)
  const mutation = useCrearCarrera()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: "", plan: "D" },
  })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(datos, {
      onSuccess: () => {
        reset({ nombre: "", plan: "D" })
        setAbierto(false)
      },
    })
  })

  const errorServidor =
    mutation.error instanceof ApiError ? mutation.error.message : null

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button>Nueva carrera</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear carrera</DialogTitle>
          <DialogDescription>
            Registrar una carrera y su plan de estudios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Ingeniería Informática"
              {...register("nombre")}
              aria-invalid={!!errors.nombre}
            />
            {errors.nombre && (
              <p className="text-destructive text-sm">{errors.nombre.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="plan">Plan de estudios</Label>
            <Select id="plan" {...register("plan")}>
              {PLANES.map((plan) => (
                <option key={plan} value={plan}>
                  {plan === "D" ? "Plan D (Diarizo)" : "Plan E"}
                </option>
              ))}
            </Select>
            {errors.plan && (
              <p className="text-destructive text-sm">{errors.plan.message}</p>
            )}
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
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}