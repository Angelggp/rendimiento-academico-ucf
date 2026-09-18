import { Hammer } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ModuloEnConstruccion({
  titulo,
  descripcion,
}: {
  titulo: string
  descripcion: string
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <Hammer className="text-muted-foreground size-8" />
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>{descripcion}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Este módulo se habilitará en una próxima entrega.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}