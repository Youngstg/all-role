from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Protocol

from .config import settings
from .csv_store import append_receipt
from .models import ReceiptContext, ReceiptPayload, WorkflowResult

logger = logging.getLogger(__name__)


class ReceiptParser(Protocol):
    async def extract(self, *, file_path: Path, caption: str | None = None) -> ReceiptPayload:
        ...


class DummyReceiptParser:
    async def extract(self, *, file_path: Path, caption: str | None = None) -> ReceiptPayload:
        # Placeholder logic. Replace with panggilan OCR/LLM sungguhan.
        notes = [
            "Parser dummy digunakan. Sambungkan ke API LLM/OCR untuk data aktual.",
        ]
        if caption:
            notes.append(f"Caption: {caption}")

        return ReceiptPayload(
            currency="IDR",
            subtotal=95000,
            total=95000,
            tax=None,
            merchant="Warung Demo",
            transaction_time=datetime.utcnow(),
            items=[
                {
                    "label": "Nasi goreng",
                    "category": "Makan",
                    "amount": 45000,
                    "confidence": 0.88,
                },
                {
                    "label": "Es teh",
                    "category": "Minuman",
                    "amount": 15000,
                    "confidence": 0.9,
                },
                {
                    "label": "Pajak layanan",
                    "category": "Pajak",
                    "amount": 35000,
                    "confidence": 0.65,
                },
            ],
            notes=notes,
        )


async def run_receipt_workflow(
    *,
    file_path: Path,
    caption: str | None,
    parser: ReceiptParser | None = None,
    context: ReceiptContext | None = None,
) -> WorkflowResult:
    parser = parser or DummyReceiptParser()
    context = context or ReceiptContext(raw_file_path=file_path)

    logger.info("Memulai ekstraksi struk %s", file_path)
    payload = await parser.extract(file_path=file_path, caption=caption)

    row_index = append_receipt(settings.csv_path, payload)
    result = WorkflowResult(payload=payload, context=context, csv_row_index=row_index)

    logger.info("Berhasil menyimpan catatan keuangan di baris CSV %s", row_index)
    return result
