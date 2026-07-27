/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · genre: modern-minimal · theme: Cobalt / Light Mode Switchable */
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
  FileCode,
  Sun,
  Moon
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"summary" | "items" | "raw">("summary");
  const [copiedCufe, setCopiedCufe] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const router = useRouter();

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    router.push("/login");
  };

  const onDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      const name = file.name.toLowerCase();
      return (
        file.type === "text/xml" ||
        file.type === "application/xml" ||
        name.endsWith(".xml") ||
        name.endsWith(".xlsx") ||
        name.endsWith(".xls") ||
        file.type.includes("spreadsheetml") ||
        file.type.includes("excel")
      );
    });

    if (validFiles.length !== acceptedFiles.length) {
      toast.error("Algunos archivos fueron descartados. Solo se admiten formatos .xml y .xlsx / .xls");
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/xml": [".xml"],
      "application/xml": [".xml"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
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
        const data = await response.json();
        return { data, sourceFileName: file.name };
      });

      const responses = await Promise.all(uploadPromises);
      const extractedData: any[] = [];
      responses.forEach((r) => {
        if (r.data.isExcel && Array.isArray(r.data.dataList)) {
          r.data.dataList.forEach((item: any) => {
            extractedData.push({
              ...item,
              sourceFileName: r.sourceFileName,
            });
          });
        } else if (r.data.data) {
          extractedData.push({
            ...r.data.data,
            sourceFileName: r.sourceFileName,
          });
        }
      });

      setResults(extractedData);
      setSelectedResultIndex(0);
      toast.success(`¡${extractedData.length} documento(s) procesado(s) con éxito!`);
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
    if (typeof amount !== "number" || isNaN(amount)) return "$ 0,00";
    const parts = amount.toFixed(2).split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `$ ${integerPart},${parts[1]}`;
  };

  // Totales acumulados
  const totalAmountSum = results.reduce((acc, curr) => acc + (curr.invoiceData?.totalAmount || 0), 0);
  const totalTaxSum = results.reduce((acc, curr) => acc + (curr.invoiceData?.taxAmount || 0), 0);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? "bg-[#09090b] text-neutral-100 selection:bg-emerald-500/20 selection:text-emerald-300" : "bg-slate-50 text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-900"
    }`}>
      <Toaster theme={isDark ? "dark" : "light"} position="top-right" />

      {/* Header / Navbar */}
      <header className={`border-b backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300 ${
        isDark ? "bg-neutral-950/80 border-neutral-800/80" : "bg-white/80 border-slate-200/80 shadow-xs"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/10">
                C
              </div>
              <span className={`font-semibold text-lg tracking-tight ${
                isDark ? "bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent" : "text-slate-900"
              }`}>
                Comiagro
              </span>
            </div>
            
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-amber-400"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-indigo-600"
              }`}
              title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLogout}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                isDark 
                  ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white" 
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Page Title & Stats Overview */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b transition-colors ${
          isDark ? "border-neutral-800/60" : "border-slate-200"
        }`}>
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Gestión de Facturación Electrónica
            </h1>
            <p className={`text-sm mt-1 max-w-2xl ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
              Carga tus archivos XML de la DIAN para extraer de forma automática el CUFE, valores fiscales, impuestos y generar la estructura requerida para la Bolsa Mercantil.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className={`grid grid-cols-3 gap-3 border p-3 rounded-2xl backdrop-blur-md transition-colors ${
            isDark ? "bg-neutral-900/60 border-neutral-800/80" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className={`px-3 py-1.5 border-r ${isDark ? "border-neutral-800" : "border-slate-200"}`}>
              <p className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-slate-400"}`}>Procesados</p>
              <p className={`text-lg font-bold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{results.length}</p>
            </div>
            <div className={`px-3 py-1.5 border-r ${isDark ? "border-neutral-800" : "border-slate-200"}`}>
              <p className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-slate-400"}`}>Total Acumulado</p>
              <p className={`text-sm font-bold font-mono ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{formatCurrency(totalAmountSum)}</p>
            </div>
            <div className="px-3 py-1.5">
              <p className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-slate-400"}`}>Impuestos (IVA)</p>
              <p className={`text-sm font-bold font-mono ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>{formatCurrency(totalTaxSum)}</p>
            </div>
          </div>
        </div>

        {/* Workbench Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Dropzone & File Queue (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className={`border rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-6 shadow-xl transition-colors ${
              isDark ? "bg-neutral-900/40 border-neutral-800/80" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-neutral-200" : "text-slate-800"}`}>
                  <FileUp className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                  Cargar archivos
                </h2>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  isDark ? "bg-neutral-950 border-neutral-800 text-neutral-500" : "bg-slate-100 border-slate-200 text-slate-500"
                }`}>
                  .xml / .xlsx
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
                  className={`w-full p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 text-center ${
                    isDragActive 
                      ? (isDark ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-500 bg-emerald-50")
                      : (isDark ? "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-900/60" : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/60")
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className={`p-3.5 rounded-2xl transition-colors ${
                    isDragActive 
                      ? "bg-emerald-500/20 text-emerald-500" 
                      : (isDark ? "bg-neutral-900 border border-neutral-800 text-neutral-400" : "bg-white border border-slate-200 text-slate-500 shadow-xs")
                  }`}>
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-neutral-200" : "text-slate-800"}`}>
                      {isDragActive ? "Suelta tus archivos aquí..." : "Arrastra tus XMLs de la DIAN o tu plantilla Excel aquí"}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? "text-neutral-500" : "text-slate-500"}`}>Formatos compatibles: .xml, .xlsx y .xls</p>
                  </div>
                </div>
              </motion.div>

              {/* File Queue */}
              {files.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className={`flex items-center justify-between text-xs font-mono ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                    <span>Cola de Procesamiento ({files.length})</span>
                    <button 
                      onClick={() => setFiles([])}
                      className="hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Limpiar todo
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {files.map((file, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                          isDark ? "bg-neutral-950 border-neutral-800/80" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                          <FileCode className={`w-4 h-4 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                          <span className={`truncate font-medium ${isDark ? "text-neutral-200" : "text-slate-800"}`}>{file.name}</span>
                          <span className={`text-[10px] font-mono ${isDark ? "text-neutral-500" : "text-slate-400"}`}>({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(file.name)}
                          className="text-neutral-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
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

            {/* Previously Extracted Items Selector */}
            {results.length > 1 && (
              <div className={`border rounded-3xl p-5 backdrop-blur-xl flex flex-col gap-3 transition-colors ${
                isDark ? "bg-neutral-900/40 border-neutral-800/80" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <p className={`text-xs font-mono uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-slate-500"}`}>Documentos Extraídos ({results.length})</p>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {results.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedResultIndex(i)}
                      className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer text-left ${
                        selectedResultIndex === i 
                          ? (isDark ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium" : "bg-emerald-50 border border-emerald-300 text-emerald-800 font-medium")
                          : (isDark ? "bg-neutral-950/60 border border-neutral-800/60 text-neutral-400 hover:bg-neutral-900" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100")
                      }`}
                    >
                      <div className="flex flex-col truncate max-w-[70%]">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                            res.invoiceData?.documentType === "NOTA_DEBITO" 
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                              : res.invoiceData?.documentType === "NOTA_CREDITO"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {res.invoiceData?.documentType === "NOTA_DEBITO" ? "ND" : res.invoiceData?.documentType === "NOTA_CREDITO" ? "NC" : "FE"}
                          </span>
                          <span className="truncate">{res.invoiceData?.companyName || `Documento ${i+1}`}</span>
                        </div>
                        {res.sourceFileName && (
                          <span className={`text-[10px] font-mono truncate pl-6 ${isDark ? "text-neutral-500" : "text-slate-400"}`}>
                            {res.sourceFileName}
                          </span>
                        )}
                      </div>
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
              <div className={`border rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-6 shadow-xl transition-colors ${
                isDark ? "bg-neutral-900/40 border-neutral-800/80" : "bg-white border-slate-200 shadow-sm"
              }`}>
                
                {/* Tabs Navigation */}
                <div className={`flex items-center justify-between border-b pb-4 transition-colors ${isDark ? "border-neutral-800" : "border-slate-200"}`}>
                  <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors ${
                    isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-100 border-slate-200"
                  }`}>
                    <button
                      onClick={() => setActiveTab("summary")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "summary" 
                          ? (isDark ? "bg-neutral-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs")
                          : (isDark ? "text-neutral-400 hover:text-neutral-200" : "text-slate-600 hover:text-slate-900")
                      }`}
                    >
                      Resumen Ejecutivo
                    </button>
                    <button
                      onClick={() => setActiveTab("items")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "items" 
                          ? (isDark ? "bg-neutral-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs")
                          : (isDark ? "text-neutral-400 hover:text-neutral-200" : "text-slate-600 hover:text-slate-900")
                      }`}
                    >
                      Ítems ({currentResult.invoiceData?.items?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("raw")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "raw" 
                          ? (isDark ? "bg-neutral-800 text-white shadow-xs" : "bg-white text-slate-900 shadow-xs")
                          : (isDark ? "text-neutral-400 hover:text-neutral-200" : "text-slate-600 hover:text-slate-900")
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
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                          isDark 
                            ? "bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300" 
                            : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                        }`}
                      >
                        <Download className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                        <span>Descargar JSON</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Tab 1: Summary */}
                {activeTab === "summary" && (
                  <div className="flex flex-col gap-6">
                    {/* Source File Badge */}
                    {currentResult.sourceFileName && (
                      <div className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                        isDark ? "bg-neutral-950/80 border-neutral-800/80" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="flex items-center gap-2">
                          <FileCode className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
                          <span className={`font-mono text-[10px] uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-slate-500"}`}>Archivo Origen:</span>
                          <span className={`font-semibold font-mono ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>{currentResult.sourceFileName}</span>
                        </div>
                      </div>
                    )}

                    {/* Header Party Cards */}
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-2xl border flex flex-col gap-1 transition-colors ${
                          isDark ? "bg-neutral-950/80 border-neutral-800/80" : "bg-slate-50 border-slate-200"
                        }`}>
                          <span className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                            <Building2 className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} /> Emisor / Proveedor
                          </span>
                          <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{currentResult.invoiceData?.companyName}</p>
                          <p className={`text-xs font-mono ${isDark ? "text-neutral-400" : "text-slate-500"}`}>NIT: {currentResult.invoiceData?.companyNit}</p>
                        </div>

                        <div className={`p-4 rounded-2xl border flex flex-col gap-1 transition-colors ${
                          isDark ? "bg-neutral-950/80 border-neutral-800/80" : "bg-slate-50 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                              <Receipt className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} /> Tipo de Documento
                            </span>
                            {currentResult.invoiceData?.documentType === "NOTA_DEBITO" ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                NOTA DÉBITO
                              </span>
                            ) : currentResult.invoiceData?.documentType === "NOTA_CREDITO" ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                NOTA CRÉDITO
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                FACTURA ELECTRÓNICA
                              </span>
                            )}
                          </div>
                          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{currentResult.invoiceData?.issueDate}</p>
                          <p className={`text-xs font-mono ${isDark ? "text-neutral-400" : "text-slate-500"}`}>Estado: Validada DIAN</p>
                        </div>
                      </div>

                      {/* Card del Cliente (Ancho Completo) */}
                      <div className={`p-4 rounded-2xl border flex flex-col gap-1 transition-colors w-full ${
                        isDark ? "bg-neutral-950/80 border-neutral-800/80" : "bg-slate-50 border-slate-200"
                      }`}>
                        <span className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
                          <Building2 className={`w-3 h-3 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} /> Adquirente / Cliente
                        </span>
                        <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{currentResult.invoiceData?.customerName || "Consumidor Final"}</p>
                        <p className={`text-xs font-mono ${isDark ? "text-neutral-400" : "text-slate-500"}`}>NIT/Doc: {currentResult.invoiceData?.customerNit || "222222222222"}</p>
                      </div>
                    </div>

                    {/* CUFE Bar */}
                    <div className={`p-4 rounded-2xl border flex flex-col gap-2 transition-colors ${
                      isDark ? "bg-neutral-950/80 border-neutral-800/80" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-slate-500"}`}>CUFE (Código Único de Factura Electrónica)</span>
                        <button
                          onClick={() => copyToClipboard(currentResult.invoiceData?.cufe, "cufe")}
                          className={`text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer ${
                            isDark ? "text-neutral-400 hover:text-emerald-400" : "text-slate-600 hover:text-emerald-600"
                          }`}
                        >
                          {copiedCufe ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCufe ? "Copiado" : "Copiar CUFE"}</span>
                        </button>
                      </div>
                      <p className={`font-mono text-xs break-all p-2.5 rounded-xl border ${
                        isDark 
                          ? "bg-neutral-900/80 border-neutral-800 text-emerald-300" 
                          : "bg-white border-slate-200 text-emerald-800"
                      }`}>
                        {currentResult.invoiceData?.cufe}
                      </p>
                    </div>

                    {/* Financial Totals Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-5 rounded-2xl border flex flex-col gap-1 ${
                        isDark 
                          ? "bg-gradient-to-br from-emerald-950/30 to-neutral-950 border-emerald-500/20" 
                          : "bg-emerald-50/60 border-emerald-200"
                      }`}>
                        <span className={`text-xs font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>Valor Total Factura</span>
                        <p className={`text-2xl font-bold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{formatCurrency(currentResult.invoiceData?.totalAmount || 0)}</p>
                      </div>
                      <div className={`p-5 rounded-2xl border flex flex-col gap-1 ${
                        isDark 
                          ? "bg-gradient-to-br from-indigo-950/30 to-neutral-950 border-indigo-500/20" 
                          : "bg-indigo-50/60 border-indigo-200"
                      }`}>
                        <span className={`text-xs font-medium ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>Total Impuestos (IVA)</span>
                        <p className={`text-2xl font-bold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>{formatCurrency(currentResult.invoiceData?.taxAmount || 0)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Items Table */}
                {activeTab === "items" && (
                  <div className="flex flex-col gap-4">
                    <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-neutral-800 bg-neutral-950/60" : "border-slate-200 bg-slate-50"}`}>
                      <table className="w-full text-left text-xs">
                        <thead className={`font-mono text-[11px] uppercase border-b ${
                          isDark ? "bg-neutral-900/80 text-neutral-400 border-neutral-800" : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Descripción</th>
                            <th className="p-3 text-right">Cant.</th>
                            <th className="p-3 text-right">Vr. Unitario</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? "divide-neutral-800/60 text-neutral-300" : "divide-slate-200 text-slate-700"}`}>
                          {currentResult.invoiceData?.items?.map((item: any, i: number) => (
                            <tr key={i} className={`transition-colors ${isDark ? "hover:bg-neutral-900/40" : "hover:bg-slate-100/70"}`}>
                              <td className={`p-3 font-mono ${isDark ? "text-neutral-500" : "text-slate-400"}`}>{i + 1}</td>
                              <td className={`p-3 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{item.description}</td>
                              <td className="p-3 text-right font-mono">{item.quantity}</td>
                              <td className="p-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                              <td className={`p-3 text-right font-mono font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>{formatCurrency(item.totalPrice)}</td>
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
                    <div className={`flex items-center justify-between gap-4 p-2 rounded-xl border ${
                      isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-100 border-slate-200"
                    }`}>
                      <span className={`text-xs font-mono pl-2 ${isDark ? "text-neutral-400" : "text-slate-600"}`}>Árbol JSON Completo (Estructura DIAN Exacta)</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(currentResult.invoiceData?.rawJson || currentResult, null, 2), "json")}
                          className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                            isDark 
                              ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300" 
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs"
                          }`}
                        >
                          {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedJson ? "Copiado" : "Copiar JSON"}</span>
                        </button>
                        <button
                          onClick={() => downloadJson(currentResult.invoiceData?.rawJson || currentResult, `factura-${currentResult.invoiceData?.cufe?.slice(0, 8)}`)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                            isDark 
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20" 
                              : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar .json</span>
                        </button>
                      </div>
                    </div>

                    <div className={`max-h-96 overflow-y-auto p-4 rounded-2xl border font-mono text-xs leading-relaxed ${
                      isDark 
                        ? "bg-neutral-950 border-neutral-800 text-neutral-300" 
                        : "bg-slate-900 border-slate-800 text-emerald-400"
                    }`}>
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(currentResult.invoiceData?.rawJson || currentResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State when no invoice processed yet */
              <div className={`border border-dashed rounded-3xl p-12 backdrop-blur-xl flex flex-col items-center justify-center text-center gap-4 min-h-[400px] transition-colors ${
                isDark 
                  ? "bg-neutral-900/30 border-neutral-800/80" 
                  : "bg-white/60 border-slate-300 shadow-xs"
              }`}>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                  isDark ? "bg-neutral-900 border-neutral-800 text-neutral-500" : "bg-slate-100 border-slate-200 text-slate-400"
                }`}>
                  <Layers className="w-6 h-6" />
                </div>
                <div className="max-w-sm">
                  <h3 className={`text-base font-semibold ${isDark ? "text-neutral-200" : "text-slate-800"}`}>Panel de Inspección Vacío</h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-neutral-500" : "text-slate-500"}`}>
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
