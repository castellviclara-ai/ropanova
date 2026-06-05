import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ListChecks,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { ParticlesBg } from "./ParticlesBg";
import { clearAdminToken, getAdminToken } from "@/lib/adminAuth";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Pedidos", icon: Package },
  { to: "/admin/new", label: "Crear Pedido", icon: PlusCircle },
  { to: "/admin/states", label: "Estados", icon: ListChecks },
  { to: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) navigate({ to: "/admin/login" });
    else setReady(true);
  }, [navigate]);

  if (!ready) return null;

  function logout() {
    clearAdminToken();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="relative min-h-screen">
      <ParticlesBg />
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/5 bg-black/60 backdrop-blur-2xl transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <Link to="/admin" onClick={() => setOpen(false)}>
                <Logo />
              </Link>
              <button className="lg:hidden text-white/60" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-10 flex-1 space-y-1">
              {nav.map((item) => {
                const active = item.exact ? path === item.to : path.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-white text-black"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 lg:pl-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-background/40 px-5 py-4 backdrop-blur-xl sm:px-8">
            <button className="lg:hidden text-white/70" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Panel</p>
              <p className="font-display text-lg tracking-wide">Administración Ropa Nova</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_oklch(0.75_0.18_150)]" />
                En línea
              </span>
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
                  F
                </div>
                <span className="text-sm">felix</span>
              </div>
            </div>
          </header>

          <main className="px-5 py-8 sm:px-8 sm:py-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
