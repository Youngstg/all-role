"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ExpenseLine = {
  id: string;
  label: string;
  amount: number;
  category: string;
  confidence: number;
};

type ParseResponse = {
  currency: string;
  subtotal: number;
  total: number;
  tax: number | null;
  detectedDate?: string;
  merchant?: string;
  items: ExpenseLine[];
  notes?: string[];
};

type AutomationStep = {
  title: string;
  description: string;
  icon: string;
  highlight?: string;
};

const automationBlueprint: AutomationStep[] = [
  {
    title: "Ekstraksi OCR",
    description: "Gunakan Vision + LLM untuk mengubah struk menjadi JSON berstruktur.",
    icon: "OCR",
    highlight: "Langkah awal",
  },
  {
    title: "Normalisasi Kategori",
    description: "Samakan label dan kategori dengan tabel referensi tim keuangan.",
    icon: "MAP",
  },
  {
    title: "Simpan ke Database",
    description: "Kirim data ke Notion, Airtable, atau Supabase untuk pencatatan resmi.",
    icon: "DB",
  },
  {
    title: "Kirim Notifikasi",
    description: "Beritahu tim finance di Slack atau email untuk proses reimbursement.",
    icon: "MSG",
  },
];

type SyncToggles = {
  notion: boolean;
  sheet: boolean;
  slack: boolean;
};

const initialToggles: SyncToggles = {
  notion: true,
  sheet: false,
  slack: false,
};

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function ReceiptAutomationStudio() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParseResponse | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncTargets, setSyncTargets] = useState<SyncToggles>(initialToggles);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    setParsed(null);
    setError(null);

    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (nextFile) {
      if (!nextFile.type.startsWith("image/")) {
        setError("Format file harus berupa gambar (JPG/PNG).");
        return;
      }
      handleFileChange(nextFile);
    }
  };

  const parseReceipt = async () => {
    if (!selectedFile) {
      setError("Pilih foto struk terlebih dahulu.");
      return;
    }

    try {
      setIsParsing(true);
      setError(null);
      setParsed(null);
      setExecutionLog((prev) => [
        `START #${prev.length + 1} - Memproses ${selectedFile.name}`,
        ...prev,
      ]);

      const payload = new FormData();
      payload.append("file", selectedFile);
      payload.append("targets", JSON.stringify(syncTargets));

      const response = await fetch("/api/catatan-keuangan/extract", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Gagal memproses struk. Coba ulangi.");
      }

      const data: ParseResponse = await response.json();
      setParsed(data);
      setExecutionLog((prev) => [
        `DONE - ${selectedFile.name} diproses dan siap disinkronkan`,
        ...prev,
      ]);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Terjadi kesalahan tidak terduga.");
      setExecutionLog((prev) => [
        `FAIL - ${selectedFile?.name ?? "file"} gagal diproses`,
        ...prev,
      ]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0] ?? null;
    if (nextFile) {
      if (!nextFile.type.startsWith("image/")) {
        setError("Format file harus berupa gambar (JPG/PNG).");
        return;
      }
      handleFileChange(nextFile);
    }
  };

  const preventDefaults: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
  };

  const totalAmount = useMemo(() => parsed?.total ?? 0, [parsed]);
  const currency = parsed?.currency ?? "IDR";

  const toggleSyncTarget = (key: keyof SyncToggles) => () => {
    setSyncTargets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
          Catatan Keuangan Otomatis
        </span>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">
          Otomatiskan pencatatan struk dengan workflow gaya n8n
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300">
          Unggah strukmu, biarkan pipeline AI membaca item belanja, menghitung total,
          dan mengirimkan data ke alat pilihanmu. Satu klik untuk ekspor ke Notion,
          Sheet, atau pemberitahuan Slack.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">1. Unggah struk</h2>
              <p className="text-sm text-slate-300">Foto jelas dengan seluruh item akan meningkatkan akurasi.</p>
            </div>
          </header>

          <label
            onDrop={handleDrop}
            onDragOver={preventDefaults}
            className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-cyan-400/60 bg-slate-900/40 p-8 text-center transition hover:border-cyan-300 hover:bg-slate-900/80"
          >
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-200">Upload</span>
            <span className="text-sm font-medium text-white">
              {selectedFile ? selectedFile.name : "Tarik & letakkan foto struk atau klik untuk pilih"}
            </span>
            <span className="text-xs text-slate-400">PNG, JPG maksimal 10MB</span>
            <input type="file" accept="image/*" className="hidden" onChange={onInputChange} />
          </label>

          {previewUrl && (
            <figure className="relative overflow-hidden rounded-xl border border-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Pratinjau struk" className="w-full object-cover" />
            </figure>
          )}

          <button
            type="button"
            onClick={parseReceipt}
            disabled={isParsing || !selectedFile}
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isParsing ? "Memproses..." : "Proses & catat pengeluaran"}
          </button>

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-white">Sinkronisasi</h3>
            <p className="mt-1 text-xs text-slate-400">
              Pilih tujuan otomatis setelah data struk berhasil dibaca.
            </p>
            <div className="mt-3 grid gap-2 text-sm text-white">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncTargets.notion}
                  onChange={toggleSyncTarget("notion")}
                  className="size-4 rounded border border-white/30 bg-transparent"
                />
                <span>Notion Database</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncTargets.sheet}
                  onChange={toggleSyncTarget("sheet")}
                  className="size-4 rounded border border-white/30 bg-transparent"
                />
                <span>Google Sheet</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncTargets.slack}
                  onChange={toggleSyncTarget("slack")}
                  className="size-4 rounded border border-white/30 bg-transparent"
                />
                <span>Slack Finance Channel</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">2. Review data terstruktur</h2>
                <p className="text-sm text-slate-300">Periksa item sebelum sinkron otomatis.</p>
              </div>
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200">
                Total {formatCurrency(totalAmount, currency)}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {parsed ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <span>Merchant</span>
                    <span className="text-right text-white">{parsed.merchant ?? "-"}</span>
                    <span>Tanggal</span>
                    <span className="text-right text-white">{parsed.detectedDate ?? "-"}</span>
                    <span>Subtotal</span>
                    <span className="text-right text-white">{formatCurrency(parsed.subtotal, currency)}</span>
                    {parsed.tax !== null && (
                      <>
                        <span>Pajak</span>
                        <span className="text-right text-white">{formatCurrency(parsed.tax, currency)}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
                        <tr>
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3">Kategori</th>
                          <th className="px-4 py-3 text-right">Jumlah</th>
                          <th className="px-4 py-3 text-right">Perkiraan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 bg-slate-950/40">
                        {parsed.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-white">{item.label}</td>
                            <td className="px-4 py-3 text-slate-300">{item.category}</td>
                            <td className="px-4 py-3 text-right text-white">
                              {formatCurrency(item.amount, currency)}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-400">
                              {(item.confidence * 100).toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {parsed.notes && parsed.notes.length > 0 && (
                    <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-500/10 p-4 text-xs text-yellow-100">
                      <span className="font-semibold">Catatan AI:</span>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {parsed.notes.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
                  <span className="font-mono text-base text-cyan-200">DATA PENDING</span>
                  <p>Hasil ekstraksi akan muncul di sini setelah kamu memproses struk.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">3. Cetak alur automation</h2>
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200">
                Blueprint
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {automationBlueprint.map((step, index) => (
                <div key={step.title} className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 text-xs font-semibold text-cyan-200">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{index + 1}. {step.title}</h3>
                      {step.highlight && (
                        <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                          {step.highlight}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Log eksekusi</h2>
          <p className="text-sm text-slate-300">Pantau setiap langkah workflow yang berjalan otomatis.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-300">
          <ul className="space-y-2">
            {executionLog.length > 0 ? (
              executionLog.map((log, index) => (
                <li key={index} className="rounded bg-white/5 px-3 py-2 text-slate-200">
                  {log}
                </li>
              ))
            ) : (
              <li className="text-slate-500">Belum ada log. Jalankan satu struk untuk melihat aktivitas.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}




