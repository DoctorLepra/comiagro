/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · genre: modern-minimal · theme: Cobalt / Light Mode Switchable */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<"login" | "signup" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const router = useRouter();

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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

  const isDark = theme === "dark";

  return (
    <div className={`flex flex-col min-h-screen items-center justify-center px-6 relative overflow-hidden transition-colors duration-300 ${
      isDark ? "bg-[#09090b] text-neutral-50 selection:bg-emerald-500/20 selection:text-emerald-300" : "bg-slate-50 text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-900"
    }`}>
      {/* Background Glow Ambient Gradients */}
      <div className={`absolute top-[-20%] left-[-15%] w-[50%] h-[50%] rounded-full blur-[140px] pointer-events-none ${
        isDark ? "bg-emerald-600/10" : "bg-emerald-500/15"
      }`} />
      <div className={`absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] rounded-full blur-[140px] pointer-events-none ${
        isDark ? "bg-indigo-600/10" : "bg-indigo-500/15"
      }`} />

      {/* Theme Switcher Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            isDark
              ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-amber-400"
              : "bg-white hover:bg-slate-100 border-slate-200 text-indigo-600"
          }`}
          title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Card Container */}
      <div className={`w-full max-w-md p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl z-10 flex flex-col gap-6 transition-colors duration-300 ${
        isDark ? "bg-neutral-900/40 border-neutral-800/80" : "bg-white/80 border-slate-200 shadow-xl"
      }`}>
        
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-emerald-500/15">
            C
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono mb-3 transition-colors ${
            isDark ? "bg-neutral-950 border-neutral-800 text-neutral-400" : "bg-slate-100 border-slate-200 text-slate-600"
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Motor de Facturación DIAN</span>
          </div>

          <h1 className={`text-2xl font-bold tracking-tight ${
            isDark ? "bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent" : "text-slate-900"
          }`}>
            Bienvenido a Comiagro
          </h1>
          <p className={`text-xs mt-1 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
            Ingresa tus credenciales para acceder al procesador XML
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-medium flex items-center gap-2 ${isDark ? "text-neutral-300" : "text-slate-700"}`} htmlFor="email">
              <Mail className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-slate-400"}`} /> Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`rounded-xl px-4 py-3 border outline-none transition-all text-xs font-mono ${
                isDark 
                  ? "bg-neutral-950/80 border-neutral-800 focus:border-emerald-500/50 text-neutral-100 placeholder:text-neutral-600" 
                  : "bg-slate-50 border-slate-200 focus:border-emerald-500/50 text-slate-900 placeholder:text-slate-400"
              }`}
              placeholder="usuario@comiagro.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={`text-xs font-medium flex items-center gap-2 ${isDark ? "text-neutral-300" : "text-slate-700"}`} htmlFor="password">
              <Lock className={`w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-slate-400"}`} /> Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`rounded-xl px-4 py-3 border outline-none transition-all text-xs font-mono ${
                isDark 
                  ? "bg-neutral-950/80 border-neutral-800 focus:border-emerald-500/50 text-neutral-100 placeholder:text-neutral-600" 
                  : "bg-slate-50 border-slate-200 focus:border-emerald-500/50 text-slate-900 placeholder:text-slate-400"
              }`}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-500 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-emerald-600 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loadingAction !== null}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
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
            className={`w-full py-3 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              isDark 
                ? "border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300" 
                : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
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
