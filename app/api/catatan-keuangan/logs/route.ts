import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const headers = [
  "timestamp",
  "merchant",
  "category",
  "item",
  "amount",
  "currency",
  "confidence",
  "notes",
  "source",
  "reference_id",
] as const;

export type ExpenseRow = Record<(typeof headers)[number], string>;

function parseCsv(content: string): ExpenseRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const [, ...rows] = lines; // buang header

  return rows.map((row) => {
    const values = row.split(",");
    const record: Partial<ExpenseRow> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return record as ExpenseRow;
  });
}

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "keuangan.csv");

  try {
    const file = await fs.readFile(filePath, "utf-8");
    const rows = parseCsv(file);

    const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return NextResponse.json({ rows, total, count: rows.length });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ rows: [], total: 0, count: 0 });
    }

    console.error("Gagal membaca CSV", error);
    return NextResponse.json({ message: "Gagal membaca CSV" }, { status: 500 });
  }
}
