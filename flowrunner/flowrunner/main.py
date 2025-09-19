from __future__ import annotations

import logging
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, HTTPException

from . import csv_store
from .clients.telegram import TelegramClient, extract_file_reference
from .config import settings
from .models import ReceiptContext, TelegramUpdate
from .workflow import run_receipt_workflow

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Flowrunner", version="0.1.0")


def _build_context(update: TelegramUpdate, file_path: Path) -> ReceiptContext:
    message = update.message
    chat = message.chat if message else {}
    user = message.from_ if message else {}
    username = user.get("username") if isinstance(user, dict) else None

    return ReceiptContext(
        telegram_chat_id=chat.get("id") if isinstance(chat, dict) else None,
        telegram_user=username or user.get("first_name") if isinstance(user, dict) else None,
        raw_file_path=file_path,
    )


@app.on_event("startup")
async def ensure_storage():
    csv_store.ensure_csv(settings.csv_path)
    logger.info("CSV siap di %s", settings.csv_path.resolve())


@app.get("/healthz")
async def healthcheck():
    return {"status": "ok"}


@app.get("/receipts")
async def list_receipts():
    rows = csv_store.read_receipts(settings.csv_path)
    return {"rows": rows, "count": len(rows)}


@app.post("/webhooks/telegram")
async def telegram_webhook(update: TelegramUpdate, background_tasks: BackgroundTasks):
    file_ref = extract_file_reference(update)
    if not file_ref:
        raise HTTPException(status_code=400, detail="Update tidak memuat dokumen atau foto struk.")

    caption = update.message.caption if update.message else None

    client = TelegramClient()

    async def process_receipt():
        # Unduh file dari Telegram, jalankan workflow, hapus file tmp setelah selesai.
        file_path = await client.download_file(file_ref)
        context = _build_context(update, file_path)
        try:
            await run_receipt_workflow(file_path=file_path, caption=caption, context=context)
        finally:
            try:
                file_path.unlink(missing_ok=True)
            except Exception as exc:  # pragma: no cover
                logger.warning("Gagal menghapus file sementara %s: %s", file_path, exc)

    background_tasks.add_task(process_receipt)

    return {"status": "accepted"}


@app.post("/workflows/receipts/run")
async def run_workflow_stub():
    # Endpoint manual untuk testing tanpa Telegram
    dummy_file = settings.csv_path.parent / "dummy-receipt.jpg"
    dummy_file.touch(exist_ok=True)
    result = await run_receipt_workflow(file_path=dummy_file, caption="Demo via API")
    return result
