from __future__ import annotations

import asyncio
import logging
import tempfile
from pathlib import Path

import httpx

from ..config import settings
from ..models import TelegramFileReference, TelegramUpdate

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org"


class TelegramClient:
    def __init__(self, token: str | None = None) -> None:
        self.token = token or settings.telegram_bot_token
        if not self.token:
            logger.warning("Token Telegram belum diset. Download file akan gagal sampai token tersedia.")

    async def download_file(self, file_ref: TelegramFileReference) -> Path:
        if not self.token:
            raise RuntimeError("Telegram bot token belum dikonfigurasi.")

        async with httpx.AsyncClient(timeout=30) as client:
            file_info = await self._get_file_info(client, file_ref.file_id)
            file_path = file_info["result"]["file_path"]
            url = f"{TELEGRAM_API_BASE}/file/bot{self.token}/{file_path}"
            logger.info("Mengunduh file dari %s", url)

            response = await client.get(url)
            response.raise_for_status()

            suffix = Path(file_info["result"]["file_path"]).suffix or ".bin"
            handle = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            handle.write(response.content)
            handle.flush()
            handle.close()

            return Path(handle.name)

    async def _get_file_info(self, client: httpx.AsyncClient, file_id: str) -> dict:
        url = f"{TELEGRAM_API_BASE}/bot{self.token}/getFile"
        response = await client.post(url, data={"file_id": file_id})
        response.raise_for_status()
        return response.json()


def extract_file_reference(update: TelegramUpdate) -> TelegramFileReference | None:
    if not update.message:
        return None

    if update.message.document:
        return update.message.document

    if update.message.photo:
        # Telegram mengirim array foto dengan resolusi berbeda, pakai yang terbesar.
        return update.message.photo[-1]

    return None
