# Cognify

Platform pembelajaran berbasis AI untuk mengubah dokumen PDF (materi kuliah, buku teks, catatan akademik) menjadi paket belajar aktif: **Ringkasan AI**, **Topik Utama**, **Flashcards**, dan **Tutor AI Dokumen**.

Dokumen spesifikasi lengkap tersedia di [`docs/PRD.md`](docs/PRD.md).

## Stack Teknologi

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui, Lucide Icons, Sonner
- **State & Fetching**: TanStack React Query
- **Backend & Storage**: Supabase (Auth, PostgreSQL + RLS, Storage bucket `documents`)
- **PDF Parsing**: `pdf-parse`
- **AI Provider**: OpenRouter API (`openrouter/free` atau model gratis lainnya via OpenAI-compatible SDK)

## Persiapan & Menjalankan Lokal

1. **Instal dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi environment variables** (salin dari `.env.example` ke `.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   OPENROUTER_API_KEY=...
   OPENROUTER_MODEL=openrouter/free
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Jalankan migrasi Supabase**:
   Pastikan seluruh file di `supabase/migrations/` (termasuk `20261125000001_profiles_triggers_and_bookmarks.sql`) sudah diterapkan ke project Supabase kamu dan bucket Storage bernama `documents` (private) sudah dibuat.

4. **Jalankan server development**:
   ```bash
   npm run dev
   ```

## Verifikasi & Deploy

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Saat deploy ke Vercel, tambahkan seluruh environment variables di atas pada pengaturan Project Environment Variables dan daftarkan URL callback autentikasi (`https://<domain-kamu>/callback`) di Supabase Authentication URL Configuration.
