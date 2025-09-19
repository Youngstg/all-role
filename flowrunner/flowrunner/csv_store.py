from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path
from typing import Iterable

from .models import ExpenseItem, ReceiptPayload

CSV_HEADERS = [
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
]


def ensure_csv(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(CSV_HEADERS)


def append_receipt(path: Path, payload: ReceiptPayload) -> int:
    ensure_csv(path)
    timestamp = payload.transaction_time or datetime.utcnow()

    rows: list[list[str]] = [
        _build_row(timestamp, payload, item) for item in payload.items
    ]

    previous_line_count = max(_count_lines(path), 1)
    with path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerows(rows)

    return previous_line_count


def read_receipts(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return list(reader)


def _build_row(timestamp: datetime, payload: ReceiptPayload, item: ExpenseItem) -> list[str]:
    return [
        timestamp.isoformat(),
        payload.merchant or "-",
        item.category,
        item.label,
        f"{item.amount:.2f}",
        payload.currency,
        f"{item.confidence:.2f}",
        " | ".join(payload.notes) if payload.notes else "",
        payload.source,
        payload.reference_id or "",
    ]


def _count_lines(path: Path) -> int:
    if not path.exists():
        return 0
    with path.open("r", encoding="utf-8") as handle:
        return sum(1 for _ in handle)
