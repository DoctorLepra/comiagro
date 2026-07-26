"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { FileUp, FileCheck2, AlertCircle, Loader2, X, LogOut } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    // Filtrar solo XML por precaución
    const xmlFiles = acceptedFiles.filter(
      (file) => file.type === "text/xml" || file.type === "application/xml" || file.name.endsWith(".xml")
    );
    
    if (xmlFiles.length !== acceptedFiles.length) {
      toast.error("Algunos archivos fueron descartados porque no son XML.");
    }
    
    setFiles((prev) => [...prev, ...xmlFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/xml": [".xml"],
      "application/xml": [".xml"],
    },
  });

  const { onAnimationStart: _, ...dropzoneProps } = getRootProps();

  const removeFile = (name: string) => {
    setFiles((files) => files.filter((f) => f.name !== name));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // Usar la URL configurada en la variable de entorno en producción o localhost:3001 en desarrollo local
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${apiUrl}/invoices/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errData.message || `Error ${response.status}`);
        }
        return response.json();
      });

      const responses = await Promise.all(uploadPromises);
      setResults(responses.map(r => r.data));
      toast.success("¡Todos los archivos fueron procesados exitosamente!");
      setFiles([]);
    } catch (error) {
      toast.error("Ocurrió un error al procesar las facturas.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30 flex flex-col items-center pt-24 pb-12 px-6 relative overflow-hidden">
      {/* Sign Out Header */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all backdrop-blur-md shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar Sesión
        </button>
      </div>

      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <Toaster theme="dark" position="top-center" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-3xl z-10 flex flex-col items-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
          <span className="text-sm font-medium text-neutral-300">Extracción Automática de Facturas</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-center tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Convierte tus XML <br /> en datos estructurados.
        </h1>
        
        <p className="text-lg text-neutral-400 text-center mb-12 max-w-xl">
          Sube tus facturas electrónicas de la DIAN. Extraeremos la información automáticamente y la prepararemos para la Bolsa Mercantil.
        </p>

        {/* Dropzone Area */}
        <motion.div 
          {...dropzoneProps}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer backdrop-blur-sm flex flex-col items-center justify-center gap-4
            ${isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-800/50"}
          `}
        >
          <input {...getInputProps()} />
          <div className={`p-4 rounded-full transition-colors duration-300 ${isDragActive ? "bg-indigo-500/20 text-indigo-400" : "bg-neutral-800 text-neutral-400"}`}>
            <FileUp className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-neutral-200">
              {isDragActive ? "Suelta tus XML aquí..." : "Arrastra tus XML aquí"}
            </p>
            <p className="text-sm text-neutral-500 mt-1">o haz clic para explorar en tus archivos</p>
          </div>
        </motion.div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mt-8 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-sm font-medium text-neutral-400">{files.length} archivo(s) listo(s)</span>
                <button 
                  onClick={() => setFiles([])}
                  className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
              
              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file) => (
                  <motion.div 
                    key={file.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-md group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="font-medium text-neutral-200 truncate">{file.name}</span>
                        <span className="text-xs text-neutral-500">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                      className="p-2 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-400/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={uploadFiles}
                disabled={isUploading}
                className="mt-4 w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando facturas...
                  </>
                ) : (
                  <>Extraer Datos a JSON</>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Preview (Optional MVP) */}
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-12 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-md"
          >
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-400" />
              Procesamiento Exitoso
            </h3>
            <p className="text-neutral-400 text-sm mb-4">
              Se han generado {results.length} JSONs y han sido respaldados en Cloudflare R2 junto con el XML original.
            </p>
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 overflow-x-auto">
              <pre className="text-xs text-indigo-300 font-mono">
                {JSON.stringify(results[0], null, 2)}
              </pre>
            </div>
            {results.length > 1 && (
              <p className="text-xs text-neutral-500 mt-3 text-center">... y {results.length - 1} facturas más.</p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Basic styles for the custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}} />
    </main>
  );
}
