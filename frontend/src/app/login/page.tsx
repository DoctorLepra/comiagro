"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

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
    <div className="flex flex-col min-h-screen items-center justify-center bg-neutral-950 text-neutral-50 px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-600/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-xl shadow-2xl z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Comiagro
          </h1>
          <p className="text-sm text-neutral-400 mt-2">
            Inicia sesión o regístrate para procesar tus facturas
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-300 flex items-center gap-2" htmlFor="email">
              <Mail className="w-4 h-4 text-neutral-500" /> Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl px-4 py-3 bg-neutral-950/80 border border-neutral-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-neutral-100 placeholder:text-neutral-600 text-sm"
              placeholder="tu@empresa.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-sm font-medium text-neutral-300 flex items-center gap-2" htmlFor="password">
              <Lock className="w-4 h-4 text-neutral-500" /> Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl px-4 py-3 bg-neutral-950/80 border border-neutral-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-neutral-100 placeholder:text-neutral-600 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loadingAction !== null}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loadingAction === "login" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>

          <button
            type="button"
            onClick={handleSignup}
            disabled={loadingAction !== null}
            className="w-full py-3.5 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800/80 text-neutral-300 font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === "signup" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Crear cuenta nueva"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
