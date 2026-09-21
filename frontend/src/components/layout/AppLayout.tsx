import { useState } from "react"
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { LogOut, GraduationCap, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { navPorRol, type ItemNav } from "@/config/nav"
import { useAuth } from "@/features/auth/use-auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

function esRutaInicio(href: string) {
  return (
    href.endsWith("/admin") ||
    href.endsWith("/vicedecana") ||
    href.endsWith("/profesor") ||
    href.endsWith("/estudiante")
  )
}

function NavegacionSidebar({
  items,
  onNavegar,
  colapsado = false,
}: {
  items: ItemNav[]
  onNavegar?: () => void
  colapsado?: boolean
}) {
  return (
    <nav className="mt-6 flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const Icono = item.icono
        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={esRutaInicio(item.href)}
            onClick={onNavegar}
            title={colapsado ? item.titulo : undefined}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
              colapsado && "flex justify-center px-0",
            )}
            style={({ isActive }) => (isActive ? { backgroundColor: "var(--sidebar-accent)", color: "var(--sidebar-accent-foreground)" } : undefined)}
          >
            <span className="flex items-center gap-2">
              <Icono className="size-4 shrink-0" />
              {!colapsado && <span>{item.titulo}</span>}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function AppLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [colapsado, setColapsado] = useState(() => {
    try {
      return localStorage.getItem("sidebar-colapsado") === "1"
    } catch {
      return false
    }
  })

  const alternarColapsado = () => {
    setColapsado((actual) => {
      try {
        localStorage.setItem("sidebar-colapsado", actual ? "0" : "1")
      } catch {
        // sin almacenamiento disponible: solo no se recuerda la preferencia
      }
      return !actual
    })
  }

  if (!usuario) {
    return null
  }

  const items = navPorRol(usuario.rol)

  const alCerrarSesion = () => {
    cerrarSesion()
    navigate("/login", { replace: true })
  }

  const tituloPagina = items.find((i) => i.href === location.pathname)?.titulo ?? "Inicio"

  return (
    <div className="flex min-h-svh">
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-svh shrink-0 flex-col overflow-y-auto border-r py-4 transition-[width] duration-200 md:flex",
          colapsado ? "w-16 px-2" : "w-64 px-3",
        )}
      >
        <div className={cn("flex items-center", colapsado ? "justify-center" : "justify-between")}>
          {!colapsado && (
            <Link
              to={items[0]?.href ?? "/"}
              className="flex items-center gap-2 px-2 font-semibold"
            >
              <GraduationCap className="size-5" />
              <span>Rendimiento UCF</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={alternarColapsado}
            title={colapsado ? "Desplegar menú" : "Contraer menú"}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {colapsado ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
            <span className="sr-only">{colapsado ? "Desplegar menú" : "Contraer menú"}</span>
          </Button>
        </div>

        <NavegacionSidebar items={items} colapsado={colapsado} />

        {!colapsado && (
          <div className="border-sidebar-border flex items-center gap-2 border-t pt-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {usuario.nombre} {usuario.apellidos}
              </p>
              <p className="text-sidebar-foreground/70 truncate text-xs">{usuario.email}</p>
            </div>
          </div>
        )}
      </aside>

      <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
        <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-64 px-3 py-4">
          <SheetHeader className="p-0">
            <SheetTitle className="flex items-center gap-2 px-2 font-semibold">
              <GraduationCap className="size-5" />
              <span>Rendimiento UCF</span>
            </SheetTitle>
          </SheetHeader>

          <NavegacionSidebar items={items} onNavegar={() => setMenuAbierto(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card border-primary/15 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 shadow-sm md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuAbierto(true)}
            >
              <Menu className="size-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
            <h1 className="text-lg font-semibold">{tituloPagina}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm md:block">
              {usuario.nombre} {usuario.apellidos}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={alCerrarSesion}
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}