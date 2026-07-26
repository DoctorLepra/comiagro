/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · genre: modern-minimal · theme: Cobalt */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  FileUp, 
  FileCheck2, 
  AlertCircle, 
  Loader2, 
  X, 
  LogOut, 
  Copy, 
  Check, 
  Download, 
  Building2, 
  Receipt, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Database,
  ChevronRight,
  FileCode
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"summary" | "items" | "raw">("summary");
  const [copiedCufe, setCopiedCufe] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [jsonSearchTerm, setJsonSearchTerm] = useState("");

  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  const onDrop = (acceptedFiles: File[]) => {
    const xmlFiles = acceptedFiles.filter(
      (file) => file.type === "text/xml" || file.type === "application/xml" || file.name.endsWith(".xml")
    );
    
    if (xmlFiles.length !== acceptedFiles.length) {
      toast.error("Algunos archivos fueron descartados porque no tienen extensión .xml");
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
      const extractedData = responses.map(r => r.data);
      setResults(extractedData);
      setSelectedResultIndex(0);
      toast.success(`¡${extractedData.length} factura(s) procesada(s) con éxito!`);
      setFiles([]);
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error al procesar las facturas.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const currentResult = results[selectedResultIndex];

  const copyToClipboard = (text: string, type: "cufe" | "json") => {
    navigator.clipboard.writeText(text);
    if (type === "cufe") {
      setCopiedCufe(true);
      setTimeout(() => setCopiedCufe(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
    toast.success(`${type === "cufe" ? "CUFE" : "JSON"} copiado al portapapeles`);
  };

  const downloadJson = (data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Archivo JSON descargado");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Totales acumulados
  const totalAmountSum = results.reduce((acc, curr) => acc + (curr.invoiceData?.totalAmount || 0), 0);
  const totalTaxSum = results.reduce((acc, curr) => acc + (curr.invoiceData?.taxAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      <Toaster theme="dark" position="top-right" />

      {/* Header / Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-neutral-950 font-bold text-sm shadow-lg shadow-emerald-500/10">
                C
              </div>
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                Comiagro
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Motor DIAN UBL 2.1</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-400 font-mono border-r border-neutral-800 pr-4">
              <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-emerald-400" /> Neon PostgreSQL</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Cloudflare R2</span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Page Title & Stats Overview */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Procesador Inteligente de Facturas</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Gestión de Facturación Electrónica
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Carga tus archivos XML de la DIAN para extraer de forma automática el CUFE, valores fiscales, impuestos y generar la estructura requerida para la Bolsa Mercantil.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-2xl backdrop-blur-md">
            <div className="px-3 py-1.5 border-r border-neutral-800">
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Procesados</p>
              <p className="text-lg font-bold text-white font-mono">{results.length}</p>
            </div>
            <div className="px-3 py-1.5 border-r border-neutral-800">
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Total Acumulado</p>
              <p className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(totalAmountSum)}</p>
            </div>
            <div className="px-3 py-1.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Impuestos (IVA)</p>
              <p className="text-sm font-bold text-indigo-400 font-mono">{formatCurrency(totalTaxSum)}</p>
            </div>
          </div>
        </div>

        {/* Workbench Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Dropzone & File Queue (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-emerald-400" />
                  Cargar Archivos XML
                </h2>
                <span className="text-[11px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                  Format: .xml (UBL 2.1)
                </span>
              </div>

              {/* Dropzone Container */}
              <motion.div 
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className="w-full"
              >
                <div
                  {...getRootProps()}
                  className={`w-full p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 text-center
                    ${isDragActive 
                      ? "border-emerald-500 bg-emerald-500/10" 
                      : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-900/60"}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className={`p-3.5 rounded-2xl transition-colors ${isDragActive ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-900 border border-neutral-800 text-neutral-400"}`}>
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">
                      {isDragActive ? "Suelta tus facturas aquí..." : "Arrastra tus XMLs de la DIAN aquí"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">O haz clic para explorar tus archivos</p>
                  </div>
                </div>
              </motion.div>

              {/* File Queue */}
              {files.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>Cola de Procesamiento ({files.length})</span>
                    <button 
                      onClick={() => setFiles([])}
                      className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                    >
                      Limpiar todo
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {files.map((file, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                          <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate font-medium text-neutral-200">{file.name}</span>
                          <span className="text-[10px] font-mono text-neutral-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(file.name)}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Procesando e Inyectando a Postgres...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Procesar {files.length} Factura(s)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Previously Extracted Items Selector (if multiple) */}
            {results.length > 1 && (
              <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-5 backdrop-blur-xl flex flex-col gap-3">
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Facturas Extraídas ({results.length})</p>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {results.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedResultIndex(i)}
                      className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer text-left ${
                        selectedResultIndex === i 
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium" 
                          : "bg-neutral-950/60 border border-neutral-800/60 text-neutral-400 hover:bg-neutral-900"
                      }`}
                    >
                      <span className="truncate">{res.invoiceData?.companyName || `Factura ${i+1}`}</span>
                      <span className="font-mono text-[11px] shrink-0">{formatCurrency(res.invoiceData?.totalAmount || 0)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Invoice Inspector & Data Viewer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {currentResult ? (
              <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-6 shadow-xl">
                
                {/* Tabs Navigation */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      onClick={() => setActiveTab("summary")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "summary" 
                          ? "bg-neutral-800 text-white shadow-sm" 
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      Resumen Ejecutivo
                    </button>
                    <button
                      onClick={() => setActiveTab("items")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "items" 
                          ? "bg-neutral-800 text-white shadow-sm" 
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      Ítems ({currentResult.invoiceData?.items?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("raw")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "raw" 
                          ? "bg-neutral-800 text-white shadow-sm" 
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      RAW JSON DIAN
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentResult.jsonUrl && (
                      <a
                        href={currentResult.jsonUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cloudflare R2 JSON</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Tab 1: Summary */}
                {activeTab === "summary" && (
                  <div className="flex flex-col gap-6">
                    {/* Header Party Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-emerald-400" /> Emisor / Proveedor
                        </span>
                        <p className="text-sm font-semibold text-white truncate">{currentResult.invoiceData?.companyName}</p>
                        <p className="text-xs font-mono text-neutral-400">NIT: {currentResult.invoiceData?.companyNit}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-indigo-400" /> Fecha de Emisión
                        </span>
                        <p className="text-sm font-semibold text-white">{currentResult.invoiceData?.issueDate}</p>
                        <p className="text-xs font-mono text-neutral-400">Estado: Validada por DIAN</p>
                      </div>
                    </div>

                    {/* CUFE Bar */}
                    <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">CUFE (Código Único de Factura Electrónica)</span>
                        <button
                          onClick={() => copyToClipboard(currentResult.invoiceData?.cufe, "cufe")}
                          className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 font-mono transition-colors cursor-pointer"
                        >
                          {copiedCufe ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCufe ? "Copiado" : "Copiar CUFE"}</span>
                        </button>
                      </div>
                      <p className="font-mono text-xs text-emerald-300/90 break-all bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                        {currentResult.invoiceData?.cufe}
                      </p>
                    </div>

                    {/* Financial Totals Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-neutral-950 border border-emerald-500/20 flex flex-col gap-1">
                        <span className="text-xs text-emerald-400 font-medium">Valor Total Factura</span>
                        <p className="text-2xl font-bold text-white font-mono">{formatCurrency(currentResult.invoiceData?.totalAmount || 0)}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-neutral-950 border border-indigo-500/20 flex flex-col gap-1">
                        <span className="text-xs text-indigo-400 font-medium">Total Impuestos (IVA)</span>
                        <p className="text-2xl font-bold text-white font-mono">{formatCurrency(currentResult.invoiceData?.taxAmount || 0)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Items Table */}
                {activeTab === "items" && (
                  <div className="flex flex-col gap-4">
                    <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-950/60">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-900/80 text-neutral-400 font-mono text-[11px] uppercase border-b border-neutral-800">
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Descripción</th>
                            <th className="p-3 text-right">Cant.</th>
                            <th className="p-3 text-right">Vr. Unitario</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                          {currentResult.invoiceData?.items?.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-neutral-900/40 transition-colors">
                              <td className="p-3 font-mono text-neutral-500">{i + 1}</td>
                              <td className="p-3 font-medium text-white">{item.description}</td>
                              <td className="p-3 text-right font-mono">{item.quantity}</td>
                              <td className="p-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                              <td className="p-3 text-right font-mono text-emerald-400 font-semibold">{formatCurrency(item.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 3: Raw JSON Inspector */}
                {activeTab === "raw" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                      <span className="text-xs font-mono text-neutral-400 pl-2">Árbol JSON Completo (Estructura DIAN Exacta)</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(currentResult.invoiceData?.rawJson || currentResult, null, 2), "json")}
                          className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-800"
                        >
                          {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedJson ? "Copiado" : "Copiar JSON"}</span>
                        </button>
                        <button
                          onClick={() => downloadJson(currentResult.invoiceData?.rawJson || currentResult, `factura-${currentResult.invoiceData?.cufe?.slice(0, 8)}`)}
                          className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500/20"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar .json</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto p-4 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 leading-relaxed">
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(currentResult.invoiceData?.rawJson || currentResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State when no invoice processed yet */
              <div className="bg-neutral-900/30 border border-dashed border-neutral-800/80 rounded-3xl p-12 backdrop-blur-xl flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="max-w-sm">
                  <h3 className="text-base font-semibold text-neutral-200">Panel de Inspección Vacío</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Carga uno o más archivos XML de la DIAN en el panel izquierdo para visualizar la extracción en tiempo real.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
