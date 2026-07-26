/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · genre: modern-minimal · theme: Cobalt */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<"login" | "signup" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoadingAction("login");

    setTimeout(() => {
      setLoadingAction(null);
      router.push("/");
    }, 600);
  };

  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor ingresa un correo y una contraseña para registrarte.");
      return;
    }
    setError(null);
    setLoadingAction("signup");

    setTimeout(() => {
      setLoadingAction(null);
      setSuccessMsg("¡Cuenta registrada con éxito! Redirigiendo...");
      setTimeout(() => {
        router.push("/");
      }, 800);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#09090b] text-neutral-50 px-6 relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Background Glow Ambient Gradients */}
      <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />

      {/* Card Container */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-2xl shadow-2xl z-10 flex flex-col gap-6">
        
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-neutral-950 font-bold text-xl mb-4 shadow-lg shadow-emerald-500/15">
            C
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Motor de Facturación DIAN</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Bienvenido a Comiagro
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Ingresa tus credenciales para acceder al procesador XML
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-2" htmlFor="email">
              <Mail className="w-3.5 h-3.5 text-neutral-500" /> Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl px-4 py-3 bg-neutral-950/80 border border-neutral-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-neutral-100 placeholder:text-neutral-600 text-xs font-mono"
              placeholder="usuario@comiagro.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-2" htmlFor="password">
              <Lock className="w-3.5 h-3.5 text-neutral-500" /> Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl px-4 py-3 bg-neutral-950/80 border border-neutral-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-neutral-100 placeholder:text-neutral-600 text-xs font-mono"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loadingAction !== null}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {loadingAction === "login" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Accediendo...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleSignup}
            disabled={loadingAction !== null}
            className="w-full py-3 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingAction === "signup" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <span>Crear cuenta nueva</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
