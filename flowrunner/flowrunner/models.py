from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field


class ExpenseItem(BaseModel):
    label: str
    category: str
    amount: float
    confidence: float = Field(default=1.0, ge=0, le=1)


class ReceiptPayload(BaseModel):
    currency: Literal["IDR", "USD", "SGD", "EUR", "MYR"] | str = "IDR"
    total: float
    subtotal: float
    tax: float | None = None
    merchant: str | None = None
    transaction_time: datetime | None = None
    items: list[ExpenseItem]
    notes: list[str] = []
    source: str = Field(default="telegram", description="Sumber data (telegram / web / lainnya)")
    reference_id: str | None = None


class ReceiptContext(BaseModel):
    telegram_chat_id: int | None = None
    telegram_user: str | None = None
    raw_file_path: Path | None = None


class WorkflowResult(BaseModel):
    payload: ReceiptPayload
    context: ReceiptContext
    csv_row_index: int


class TelegramFileReference(BaseModel):
    file_id: str
    file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None


class TelegramMessage(BaseModel):
    message_id: int
    date: int
    chat: dict
    from_: dict | None = Field(default=None, alias="from")
    caption: str | None = None
    document: TelegramFileReference | None = None
    photo: list[TelegramFileReference] | None = None


class TelegramUpdate(BaseModel):
    update_id: int
    message: TelegramMessage | None = None

    model_config = {
        "populate_by_name": True,
    }
