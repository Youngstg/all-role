from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    telegram_bot_token: str | None = Field(
        default=None,
        description="Token bot Telegram, diperlukan untuk mengunduh file dari update webhook.",
    )
    csv_path: Path = Field(
        default=Path("..") / "data" / "keuangan.csv",
        description="Lokasi file CSV tempat catatan keuangan disimpan.",
    )

    class Config:
        env_prefix = "FLOWRUNNER_"
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
