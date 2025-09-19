# Flowrunner

Service FastAPI ringan yang meniru alur kerja n8n untuk mengubah kiriman struk dari Telegram menjadi catatan keuangan dalam CSV.

## Fitur
- Menerima webhook Telegram dan mengunduh foto/dokumen struk
- Menjalankan workflow (stub parser + penyimpanan CSV)
- Endpoint debug manual untuk menjalankan workflow tanpa Telegram
- API `GET /receipts` untuk menampilkan isi CSV

## Arsitektur Singkat
```
Telegram -> /webhooks/telegram -> download file -> run_receipt_workflow -> CSV data/keuangan.csv -> dibaca oleh UI Next.js
```

## Konfigurasi
1. Pastikan Python 3.11+ tersedia.
2. Instal dependensi:
   ```bash
   pip install -e .
   ```
3. Set token bot Telegram di environment:
   ```bash
   set FLOWRUNNER_TELEGRAM_BOT_TOKEN=123456:ABCDEFG
   ```
4. Jalankan server:
   ```bash
   uvicorn flowrunner.main:app --reload --port 8001
   ```

File CSV default berada di `../data/keuangan.csv` relatif terhadap folder proyek ini.

## Integrasi Telegram
- Set webhook Telegram ke `<BASE_URL>/webhooks/telegram`.
- Bot harus memiliki akses untuk mengunduh file (`getFile`).

## Mengganti Parser Dummy
Ubah `flowrunner/workflow.py` agar memanggil API OCR/LLM yang Anda siapkan. Parser harus mengembalikan `ReceiptPayload`.

