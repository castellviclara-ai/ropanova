import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const onAdmin = path.startsWith("/admin");
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/40 border-b border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/60">
          <Link
            to="/"
            className="rounded-full px-3 py-2 transition hover:text-white hover:bg-white/5"
          >
            Rastrear
          </Link>
          {onAdmin ? (
            <Link
              to="/admin"
              className="rounded-full px-3 py-2 transition hover:text-white hover:bg-white/5"
            >
              Panel
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/30 hover:text-white"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
