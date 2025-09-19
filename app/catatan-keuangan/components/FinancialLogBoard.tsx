"use client";

import { useEffect, useMemo, useState } from "react";

export type ExpenseRow = {
  timestamp: string;
  merchant: string;
  category: string;
  item: string;
  amount: string;
  currency: string;
  confidence: string;
  notes: string;
  source: string;
  reference_id: string;
};

type ApiResponse = {
  rows: ExpenseRow[];
  total: number;
  count: number;
};

function groupByCategory(rows: ExpenseRow[]) {
  const bucket = new Map<string, number>();
  rows.forEach((row) => {
    const value = Number(row.amount || 0);
    const key = row.category || "Lainnya";
    bucket.set(key, (bucket.get(key) ?? 0) + value);
  });
  return [...bucket.entries()].sort((a, b) => b[1] - a[1]);
}

export function FinancialLogBoard() {
  const [data, setData] = useState<ApiResponse>({ rows: [], total: 0, count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/catatan-keuangan/logs", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Gagal memuat catatan keuangan.");
        }
        const payload = (await response.json()) as ApiResponse;
        if (mounted) {
          setData(payload);
        }
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError instanceof Error ? fetchError.message : "Terjadi kesalahan tidak terduga.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const categoryBreakdown = useMemo(() => groupByCategory(data.rows), [data.rows]);

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Ringkasan catatan keuangan</h2>
          <p className="text-sm text-slate-300">Sinkron otomatis dari workflow Telegram & bot AI.</p>
        </div>
        <div className="flex gap-3">
          <StatCard label="Total transaksi" value={data.count.toString()} />
          <StatCard label="Total pengeluaran" value={formatCurrency(data.total)} emphasis />
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <CategoryList data={categoryBreakdown} isLoading={isLoading} />
        <RecentTable rows={data.rows.slice(-6).reverse()} isLoading={isLoading} />
      </div>
    </section>
  );
}

function StatCard({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/10 px-4 py-2 text-right ${emphasis ? "bg-cyan-500/20" : "bg-slate-950/40"}`}>
      <span className="block text-xs uppercase tracking-wide text-slate-300">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function CategoryList({ data, isLoading }: { data: [string, number][]; isLoading: boolean }) {
  if (isLoading) {
    return <SkeletonBox />;
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-slate-400">
        Belum ada kategori yang tercatat.
      </div>
    );
  }

  const top = data.slice(0, 5);

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
      <h3 className="text-sm font-semibold text-white">Kategori teratas</h3>
      <ul className="mt-3 space-y-3 text-sm">
        {top.map(([category, amount]) => (
          <li key={category} className="flex items-center justify-between text-slate-200">
            <span>{category}</span>
            <span className="font-semibold text-white">{formatCurrency(amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentTable({ rows, isLoading }: { rows: ExpenseRow[]; isLoading: boolean }) {
  if (isLoading) {
    return <SkeletonBox />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-slate-400">
        Belum ada transaksi terbaru.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
          <tr>
            <th className="px-4 py-3">Waktu</th>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3 text-right">Nilai</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-slate-200">
          {rows.map((row) => (
            <tr key={`${row.timestamp}-${row.item}`} className="hover:bg-slate-900/60">
              <td className="px-4 py-3 text-xs text-slate-400">{formatDate(row.timestamp)}</td>
              <td className="px-4 py-3">
                <span className="block font-medium text-white">{row.item}</span>
                <span className="text-xs text-slate-400">{row.merchant}</span>
              </td>
              <td className="px-4 py-3 text-slate-300">{row.category}</td>
              <td className="px-4 py-3 text-right font-semibold text-white">{formatCurrency(Number(row.amount || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonBox() {
  return <div className="animate-pulse rounded-xl border border-white/10 bg-slate-900/40 p-6 text-sm text-slate-400">Memuat data...</div>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
