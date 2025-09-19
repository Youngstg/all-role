import type { Metadata } from "next";
import Link from "next/link";

import { ReceiptAutomationStudio } from "./components/ReceiptAutomationStudio";
import { FinancialLogBoard } from "./components/FinancialLogBoard";

export const metadata: Metadata = {
  title: "Bot Catatan Keuangan",
  description:
    "Studio otomasi ala n8n untuk membaca struk, menormalkan kategori, dan mencatat pengeluaran ke basis data pilihanmu.",
};

export default function CatatanKeuanganPage() {
  return (
    <div className="relative flex min-h-screen flex-col gap-16 pb-16 pt-12">
      <div className="pointer-events-none absolute inset-0 ai-pattern opacity-80" aria-hidden />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6">
        <ReceiptAutomationStudio />

        <FinancialLogBoard />

        <section className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
            <h3 className="text-base font-semibold text-white">Koneksikan ke n8n</h3>
            <p className="mt-2 text-sm text-slate-300">
              Bawa JSON hasil ekstraksi ke n8n dengan webhook node. Gunakan credential store untuk
              token Notion, Google Sheet, atau Slack agar aman.
            </p>
            <Link
              href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline"
            >
              Panduan webhook n8n
            </Link>
          </article>

          <article className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
            <h3 className="text-base font-semibold text-white">Kualitas struk terbaik</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              <li>Foto tegak lurus, cahaya cukup, tanpa pantulan.</li>
              <li>Pastikan mata uang terlihat untuk membantu deteksi otomatis.</li>
              <li>Gunakan resolusi minimal 1024px agar OCR lebih akurat.</li>
            </ul>
          </article>

          <article className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
            <h3 className="text-base font-semibold text-white">Checklist sebelum live</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              <li>Tambahkan validasi duplicate entry di database tujuan.</li>
              <li>Siapkan alert jika confidence berada di bawah 0.6 untuk review manual.</li>
              <li>Lakukan uji coba dengan 10 struk nyata lintas kategori.</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}





