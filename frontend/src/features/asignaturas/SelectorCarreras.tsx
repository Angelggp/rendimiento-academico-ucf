import { Loader2 } from "lucide-react"
import { useCarreras } from "@/features/carreras/use-carreras"
import { Label } from "@/components/ui/label"

interface SelectorCarrerasProps {
  value: string[]
  onChange: (ids: string[]) => void
  error?: string
}

export function SelectorCarreras({ value, onChange, error }: SelectorCarrerasProps) {
  const carreras = useCarreras()

  const alternar = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  return (
    <div className="flex flex-col gap-2">
      <Label>Carreras que cursan esta asignatura</Label>
      <div
        className="flex flex-col gap-2 rounded-md border p-3"
        aria-invalid={!!error}
      >
        {carreras.isLoading && (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-3 animate-spin" /> Cargando carreras…
          </p>
        )}
        {carreras.data?.map((carrera) => (
          <label
            key={carrera.id}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              className="accent-primary size-4"
              checked={value.includes(carrera.id)}
              onChange={() => alternar(carrera.id)}
            />
            <span>
              {carrera.nombre}
              {!carrera.activo && (
                <span className="text-muted-foreground"> (inactiva)</span>
              )}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
