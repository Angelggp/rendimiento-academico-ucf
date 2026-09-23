import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { ApiError } from "@/lib/api"
import { useCrearEstudiante } from "./use-estudiantes"
import { useCarreras } from "@/features/carreras/use-carreras"
import { ETIQUETA_MUNICIPIO } from "@/lib/format"
import { esquemaCarnetIdentidad, PLACEHOLDER_TELEFONO } from "@/lib/validaciones"
import { MUNICIPIOS, type Municipio } from "@/types/api"
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
  apellidos: z.string().min(1, { message: "Los apellidos son obligatorios" }),
  email: z.string().email({ message: "Correo inválido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  telefono: z.string().optional(),
  carreraId: z.string().min(1, { message: "Seleccione una carrera" }),
  carnetIdentidad: esquemaCarnetIdentidad,
  municipio: z.enum(MUNICIPIOS as unknown as readonly [Municipio, ...Municipio[]], {
    message: "Seleccione un municipio",
  }),
})

type DatosFormulario = z.infer<typeof esquema>

export function CrearEstudianteDialog() {
  const [abierto, setAbierto] = useState(false)
  const mutation = useCrearEstudiante()
  const carreras = useCarreras()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: "",
      apellidos: "",
      email: "",
      password: "",
      telefono: "",
      carreraId: "",
      carnetIdentidad: "",
      municipio: MUNICIPIOS[0],
    },
  })

  const alGuardar = handleSubmit((datos) => {
    mutation.mutate(datos, {
      onSuccess: () => {
        reset()
        setAbierto(false)
      },
    })
  })

  const errorServidor =
    mutation.error instanceof ApiError ? mutation.error.message : null

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button>Nuevo estudiante</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear estudiante</DialogTitle>
          <DialogDescription>
            Crea la cuenta de acceso y el perfil académico del estudiante.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={alGuardar} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} aria-invalid={!!errors.nombre} />
              {errors.nombre && <p className="text-destructive text-sm">{errors.nombre.message}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" {...register("apellidos")} aria-invalid={!!errors.apellidos} />
              {errors.apellidos && <p className="text-destructive text-sm">{errors.apellidos.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" {...register("password")} aria-invalid={!!errors.password} />
            {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="carrera">Carrera</Label>
            <Select id="carrera" {...register("carreraId")} aria-invalid={!!errors.carreraId}>
              <option value="">Seleccione una carrera…</option>
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
              <Input
                id="carnetIdentidad"
                inputMode="numeric"
                maxLength={11}
                placeholder="00000000000"
                {...register("carnetIdentidad")}
                aria-invalid={!!errors.carnetIdentidad}
              />
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
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input id="telefono" placeholder={PLACEHOLDER_TELEFONO} {...register("telefono")} />
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
