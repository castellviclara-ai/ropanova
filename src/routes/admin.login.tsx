import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "motion/react";
import { Lock, User } from "lucide-react";
import { ParticlesBg } from "@/components/ParticlesBg";
import { Logo } from "@/components/Logo";
import { adminLogin } from "@/lib/admin.functions";
import { setAdminToken } from "@/lib/adminAuth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Acceso Admin · Ropa Nova" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const login = useServerFn(adminLogin);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await login({ data: { username: u, password: p } });
      setAdminToken(res.token);
      window.location.href = "/admin";
    } catch (e: any) {
      setErr(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticlesBg />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex justify-center">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <div className="glass-strong rounded-3xl p-8 sm:p-10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Acceso privado</p>
            <h1 className="mt-2 font-display text-4xl tracking-wide">Panel Admin</h1>
            <p className="mt-2 text-sm text-white/50">Inicia sesión para gestionar los pedidos.</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <Field icon={User} label="Usuario">
                <input
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                  className="w-full bg-transparent outline-none text-white placeholder:text-white/30"
                  placeholder="felix"
                />
              </Field>
              <Field icon={Lock} label="Contraseña">
                <input
                  type="password"
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  className="w-full bg-transparent outline-none text-white"
                  placeholder="••••••••"
                />
              </Field>
              {err && (
                <p className="rounded-xl border border-[oklch(0.62_0.22_25/0.3)] bg-[oklch(0.62_0.22_25/0.08)] px-4 py-2 text-sm text-[oklch(0.85_0.15_25)]">
                  {err}
                </p>
              )}
              <button
                disabled={loading}
                className="mt-4 w-full rounded-full bg-white py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-black transition hover:scale-[1.01] hover:shadow-[0_0_30px_oklch(1_0_0_/_0.25)] disabled:opacity-60"
              >
                {loading ? "Verificando…" : "Entrar"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-2xl glass px-5 py-3 transition focus-within:border-white/30 focus-within:shadow-[0_0_30px_oklch(1_0_0_/_0.08)]">
      <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        <Icon className="h-4 w-4 text-white/40" />
        {children}
      </div>
    </label>
  );
}
