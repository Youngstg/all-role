import { NextResponse } from "next/server";

type SyncTargets = {
  notion?: boolean;
  sheet?: boolean;
  slack?: boolean;
};

type ExpenseLine = {
  id: string;
  label: string;
  amount: number;
  category: string;
  confidence: number;
};

type ExtractResponse = {
  currency: string;
  subtotal: number;
  total: number;
  tax: number | null;
  detectedDate?: string;
  merchant?: string;
  items: ExpenseLine[];
  notes: string[];
};

const SAMPLE_ITEMS: ExpenseLine[] = [
  {
    id: "line-1",
    label: "Kopi susu dingin",
    amount: 28000,
    category: "F&B",
    confidence: 0.92,
  },
  {
    id: "line-2",
    label: "Sandwich tuna",
    amount: 42000,
    category: "F&B",
    confidence: 0.87,
  },
  {
    id: "line-3",
    label: "Biaya layanan",
    amount: 8000,
    category: "Biaya Operasional",
    confidence: 0.75,
  },
];

function buildNotes(syncTargets: SyncTargets): string[] {
  const notes: string[] = [
    "Langkah normalisasi kategori selesai. Gunakan mapping tambahan jika diperlukan.",
    "Pastikan nomor struk diisi sebelum posting ke sistem akuntansi.",
  ];

  if (syncTargets.notion) {
    notes.push("Payload siap dikirim ke Notion database finance.");
  }
  if (syncTargets.sheet) {
    notes.push("Sheet sinkron akan diperbarui pada tab pengeluaran harian.");
  }
  if (syncTargets.slack) {
    notes.push("Siapkan ringkasan untuk #finance-updates setelah konfirmasi data.");
  }

  return notes;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: "File struk tidak ditemukan." }, { status: 400 });
  }

  const targetsRaw = formData.get("targets");
  let syncTargets: SyncTargets = {};
  if (typeof targetsRaw === "string") {
    try {
      syncTargets = JSON.parse(targetsRaw) as SyncTargets;
    } catch {
      return NextResponse.json({ message: "Format tujuan sinkronisasi tidak valid." }, { status: 400 });
    }
  }

  // Dummy inference: gunakan ukuran file untuk sedikit memanipulasi total sehingga demo terasa dinamis.
  const fileSizeKb = Math.max(1, Math.round(file.size / 1024));
  const dynamicAdjustment = Math.min(15000, fileSizeKb * 120);

  const subtotal = SAMPLE_ITEMS.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax + dynamicAdjustment;

  const payload: ExtractResponse = {
    currency: "IDR",
    subtotal,
    total,
    tax,
    detectedDate: new Date().toISOString().slice(0, 10),
    merchant: "Demo Coffee",
    items: SAMPLE_ITEMS.map((item, index) => ({
      ...item,
      id: `${item.id}-${index}`,
    })),
    notes: buildNotes(syncTargets),
  };

  return NextResponse.json(payload);
}

