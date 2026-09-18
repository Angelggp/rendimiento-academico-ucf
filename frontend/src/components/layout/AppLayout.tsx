import { useState } from "react"
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { LogOut, GraduationCap, Menu } from "lucide-react"
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
}: {
  items: ItemNav[]
  onNavegar?: () => void
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
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
            )}
            style={({ isActive }) => (isActive ? { backgroundColor: "var(--sidebar-accent)", color: "var(--sidebar-accent-foreground)" } : undefined)}
          >
            <span className="flex items-center gap-2">
              <Icono className="size-4" />
              <span>{item.titulo}</span>
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
      <aside className="bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 flex-col border-r px-3 py-4 md:flex">
        <Link
          to={items[0]?.href ?? "/"}
          className="flex items-center gap-2 px-2 font-semibold"
        >
          <GraduationCap className="size-5" />
          <span>Rendimiento UCF</span>
        </Link>

        <NavegacionSidebar items={items} />

        <div className="flex items-center gap-2 border-t pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {usuario.nombre} {usuario.apellidos}
            </p>
            <p className="text-muted-foreground truncate text-xs">{usuario.email}</p>
          </div>
        </div>
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

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
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