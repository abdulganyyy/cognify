# Product Requirements Document (PRD) — Cognify

**Versi:** 1.0 (Baseline Cleanup & Production Readiness)  
**Tanggal:** 2026-11-25  
**Status:** Draft untuk Review & Eksekusi  
**Target Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack React Query, Supabase (Auth, PostgreSQL + RLS, Storage), OpenRouter API (via OpenAI-compatible SDK), `pdf-parse`, Zod.

---

## 1. Ringkasan Produk (Product Overview)

**Cognify** adalah aplikasi web pembelajaran berbasis AI yang mengubah dokumen PDF (materi kuliah, buku teks, catatan akademik) menjadi paket belajar aktif (*active learning kit*) secara otomatis:
1. **AI Summary** — Ringkasan terstruktur (ringkasan penuh, pendek, dan per bagian).
2. **Key Topics** — Peta topik utama beserta deskripsi dan skor urgensi/kepentingan.
3. **Flashcards** — Kartu tanya-jawab otomatis (plus kartu buatan user) untuk *active recall*.
4. **Document AI Chat (Tutor)** — Tanya jawab interaktif yang jawabannya bersumber langsung dari isi dokumen (*grounded Q&A* dengan referensi bagian dokumen).
5. **Learning Workspace** — Dashboard untuk melanjutkan sesi belajar terakhir, pencarian dokumen, riwayat aktivitas, dan bookmark materi penting.

### Tujuan Proyek Saat Ini
Merapikan codebase yang saat ini terpecah antara UI *placeholder/dummy*, file scaffold kosong, dan skema database Supabase yang sudah ada, menjadi aplikasi **end-to-end yang terhubung, stabil, aman, dan siap di-deploy ke production** (mis. Vercel + Supabase).

---

## 2. Audit Kondisi Project Saat Ini (As-Is State)

Berdasarkan pemeriksaan langsung terhadap codebase di workspace:

### A. Yang Sudah Ada & Berfungsi Sebagian
- **Landing Page (`app/(marketing)/*`)**: UI marketing lengkap (Navbar, Hero, DashboardPreview, FeaturesSection, HowItWorksSection, CTA, Footer).
- **Halaman Auth (`app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`)**: Form UI dan integrasi dasar Supabase `signInWithPassword` / `signUp` di `LoginFormClient.tsx` & `RegisterFormClient.tsx`.
- **UI Shell & Komponen (`components/shell/*`, `components/ui/*`, `components/shared/*`, `components/documents/*`)**: Layout `AppShell`, sidebar, topbar, kartu dokumen, summary card, dan topics section sudah tersedia.
- **Database Schema & RLS (`supabase/migrations/*`)**:
  - 10 tabel sudah terdefinisi: `profiles`, `documents`, `document_sections`, `document_summaries`, `document_topics`, `flashcards`, `chat_sessions`, `chat_messages`, `bookmarks`, `activity_logs`.
  - RLS aktif pada seluruh 10 tabel dengan policy berbasis kepemilikan `auth.uid()`.
  - Bucket storage `documents` dengan policy folder `users/{user_id}/...`.
- **Supabase Client Helpers**: `lib/supabase/browser.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, serta `proxy.ts` (session refresh).

### B. Kesenjangan & Masalah Kritis yang Ditemukan
1. **Backend & Domain Layer Masih Kosong (0 bytes)**:
   - Seluruh API route di `app/api/**` masih kosong (`0 bytes`): `auth/logout`, `documents`, `documents/[documentId]/{process,status,summary,topics,flashcards,chat}`, dan `uploads/signed-url/routes.ts`.
   - Seluruh modul di `lib/ai/*`, `lib/pdf/*`, `lib/auth/guards.ts`, `lib/constants/*`, `lib/db/types.ts`, `lib/query/*`, `lib/storage/documents.ts`, `lib/validations/*`, `lib/utils/{dates,errors,logger,text}.ts`, dan `types/*` masih kosong (`0 bytes`).
2. **Frontend Belum Terhubung ke Data Asli**:
   - `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/documents/page.tsx`, dan `app/(dashboard)/documents/[documentsId]/page.tsx` seluruhnya masih menggunakan `DUMMY_*` / `mockDocument`.
3. **Bug Routing, Naming, & Auth**:
   - **Typo API filename**: `app/api/uploads/signed-url/routes.ts` (seharusnya `route.ts`).
   - **Mismatch dynamic route param**: Folder bernama `[documentsId]` (jamak), sedangkan props komponen menggunakan `params.documentId` (tunggal) dan `layout.tsx` membaca `params?.docId`. (Di Next.js 16, `params` juga bersifat Promise/`async`).
   - **Callback Auth mismatch**: `RegisterFormClient.tsx` mengarahkan `emailRedirectTo` ke `/auth/callback`, padahal route yang ada adalah `app/(auth)/callback/route.ts` (URL `/callback`) dan masih kosong.
   - **Route Guard belum aktif**: `proxy.ts` hanya memanggil `supabase.auth.getUser()` tanpa proteksi redirect untuk rute terproteksi (`/dashboard`, `/documents`, `/bookmarks`) maupun redirect user login dari `/login` & `/register`.
4. **Fitur UI yang Belum Tersedia**:
   - Belum ada **Upload PDF Modal / Dropzone** yang terhubung ke signed URL & trigger proses.
   - Belum ada **Flashcards UI** (deck viewer, flip card, filter/generate/tambah kartu).
   - Belum ada **Document Chat UI** (sesi chat, riwayat pesan, sitasi sumber section).
   - Belum ada halaman **Bookmarks** (`/bookmarks`) meski ada link/handler `handleViewAllBookmarks`.
   - Belum ada halaman/aksi **Delete / Rename / Retry Processing** dokumen yang berfungsi.
5. **Celah Skema Database & Environment**:
   - Belum ada trigger auto-insert ke `public.profiles` saat user baru mendaftar di `auth.users` (padahal `documents.user_id` merujuk FK ke `public.profiles(id)` — user baru akan gagal upload jika baris `profiles` belum dibuat).
   - Constraint `bookmarks_type_check` hanya mengizinkan `('section', 'topic', 'flashcard', 'text')`, belum mencakup bookmark level dokumen (`document`) atau ringkasan (`summary`) seperti yang ada di UI.
   - Tabel `document_sections` belum memiliki kolom vector (`pgvector`) untuk semantic search; hanya ada `embedding_status`.
   - `.env.local` baru berisi variabel Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), belum memiliki `OPENROUTER_API_KEY`.
   - Bahasa UI masih campur antara Inggris (Landing, Auth, Dashboard) dan Indonesia (Documents, Detail, pesan error). **Keputusan:** seluruh UI distandarisasi ke **Bahasa Indonesia**.

---

## 3. Target Pengguna & Persona

- **Mahasiswa / Pelajar (Utama)**: Membaca paper, modul PDF, slide perkuliahan yang diekspor ke PDF, dan buku teks hingga 10 MB; membutuhkan ringkasan cepat, pemetaan topik ujian, flashcard untuk hafalan, dan asisten tanya jawab.
- **Pembelajar Mandiri / Peneliti Pemula**: Membutuhkan cara cepat membedah dokumen teknis dan menyimpan bagian penting (*bookmarks*).

---

## 4. Lingkup Produk (Scope)

### In-Scope (MVP Siap Pakai & Deploy)
1. **Autentikasi & Profil Lengkap**: Register (verifikasi email & auto-create profile), Login, Logout, Auth Callback, proteksi route, dan manajemen sesi.
2. **Manajemen & Upload Dokumen PDF**: Upload PDF maksimal 10 MB langsung ke Supabase Storage via Signed URL, daftar dokumen, pencarian/filter, detail dokumen, retry jika gagal, dan hapus dokumen (DB + Storage).
3. **Pipeline Pemrosesan PDF + AI**:
   - Ekstraksi teks dari PDF (`pdf-parse`), pembersihan teks, dan pemecahan menjadi `document_sections` (dengan metadata halaman/urutan/token).
   - Generasi paralel/berurutan via OpenRouter API (model gratis seperti `openrouter/free`): **Summary** (`full` & `short`), **Key Topics**, dan **Flashcards**.
   - Pelacakan status bertahap per dokumen (`status`, `summary_status`, `topic_status`, `flashcard_status`) dan pencatatan `activity_logs`.
4. **Workspace Belajar Dokumen (`/documents/[documentId]`)**:
   - Tab/Bagian: **Summary**, **Topics**, **Flashcards** (mode belajar interaktif flip + tambah kartu manual), dan **AI Chat** (sesi chat persisten per dokumen dengan konteks section relevan & referensi sumber).
5. **Dashboard & Bookmarks**:
   - Dashboard terhubung ke data asli (greeting user, search dokumen, *Continue Learning* dari `last_opened_at` / aktivitas terbaru, *Recent Documents*, *Quick Bookmarks*).
   - Fitur bookmark & halaman `/bookmarks` untuk mengakses ulang item tersimpan.
6. **Konsistensi Bahasa & UX**: Seluruh antarmuka distandarisasi ke **Bahasa Indonesia** yang konsisten (Landing Page, Auth, Dashboard, Documents, hingga pesan error/toast), dilengkapi skeleton loading, empty states, dan toast feedback (`sonner`).

### Out-of-Scope (Post-MVP / V2)
- Support format non-PDF (DOCX, PPTX, OCR gambar untuk PDF hasil scan penuh).
- Collaborative workspace / sharing dokumen publik antar user.
- Spaced repetition scheduling (SM-2) dengan reminder notifikasi.
- Billing / subscription / quota tier berbayar.

---

## 5. Functional Requirements

### FR-1: Autentikasi, Sesi, & Profil
- **FR-1.1**: User dapat mendaftar dengan nama lengkap, email, dan password (`RegisterForm`).
- **FR-1.2**: Saat user mendaftar di `auth.users`, trigger database (dan/atau fallback di server) otomatis membuat baris di `public.profiles` (`id`, `full_name`).
- **FR-1.3**: Callback OAuth / konfirmasi email (`/auth/callback` atau `/callback` — distandarisasi ke `/auth/callback`) menukar `code` menjadi sesi valid dan mengarahkan ke `/dashboard`.
- **FR-1.4**: User dapat login dan logout (`POST /api/auth/logout`) dengan pembersihan cookie sesi.
- **FR-1.5**: Middleware/Proxy melindungi `/dashboard`, `/documents/**`, `/bookmarks` (redirect ke `/login` jika belum login) serta mengarahkan user yang sudah login dari `/login` & `/register` ke `/dashboard`.

### FR-2: Upload & Manajemen Dokumen PDF
- **FR-2.1**: User dapat mengunggah file PDF (validasi MIME `application/pdf`, ukuran `> 0` dan `<= 10 MB`).
- **FR-2.2**: Alur upload aman:
  1. Client meminta Signed Upload URL ke `POST /api/uploads/signed-url` (path `users/{userId}/{documentId}/{sanitizedFilename}`).
  2. Client mengunggah file langsung ke Supabase Storage bucket `documents`.
  3. Client mendaftarkan metadata dokumen ke `POST /api/documents` (judul opsional/dari nama file, `storage_path`, `file_size_bytes`).
  4. Client memicu pemrosesan `POST /api/documents/[documentId]/process`.
- **FR-2.3**: User dapat melihat daftar dokumen (`GET /api/documents`), mencari berdasarkan judul, melihat detail (`GET /api/documents/[documentId]`), menghapus dokumen (`DELETE /api/documents/[documentId]` — menghapus objek Storage + row DB cascade), dan memproses ulang jika status `failed`.

### FR-3: PDF Extraction & AI Processing Pipeline
- **FR-3.1**: Endpoint `POST /api/documents/[documentId]/process` memverifikasi kepemilikan dokumen, mengunduh PDF dari Storage menggunakan admin/server client, dan mengekstrak teks + jumlah halaman menggunakan `pdf-parse`.
- **FR-3.2**: Teks dibersihkan (`lib/pdf/clean.ts`) dan dipecah menjadi potongan terstruktur (`lib/pdf/sectioning.ts` / `chunk.ts`) lalu disimpan ke `document_sections`.
- **FR-3.3**: Pipeline menghasilkan secara terpisah dan idempotent (aman jika di-retry):
  - **Summary** (`document_summaries`: `full` dan `short`, menyimpan `model_name`, `version`, `is_active`).
  - **Topics** (`document_topics`: `name`, `description`, `topic_order`, `importance_score`, `section_id` opsional).
  - **Flashcards** (`flashcards`: `question`, `answer`, `difficulty`, `source_excerpt`, `card_order`, `created_by = 'ai'`).
- **FR-3.4**: Status per fitur (`summary_status`, `topic_status`, `flashcard_status`) dan status global dokumen (`uploaded` → `processing` → `ready` | `failed`) diperbarui secara atomik; jika terjadi error, `processing_error` diisi agar user melihat penyebabnya dan bisa klik *Retry*.
- **FR-3.5**: Frontend melakukan polling ringan ke `GET /api/documents/[documentId]/status` selama status masih `uploaded` / `processing` hingga `ready` atau `failed`.

### FR-4: AI Summary & Key Topics
- **FR-4.1**: Halaman detail dokumen menampilkan ringkasan aktif (toggle antara ringkasan singkat dan ringkasan lengkap) serta tombol *Regenerate* (`POST /api/documents/[documentId]/summary`).
- **FR-4.2**: Menampilkan daftar topik utama terurut berdasarkan `topic_order`/`importance_score`, dengan opsi bookmark per topik dan *Regenerate* (`POST /api/documents/[documentId]/topics`).

### FR-5: Interactive Flashcards
- **FR-5.1**: Menampilkan deck flashcard interaktif (mode *study/flip card*, navigasi Next/Prev, indikator progres sesi belajar di UI, filter difficulty).
- **FR-5.2**: User dapat membuat flashcard tambahan secara manual (`POST /api/documents/[documentId]/flashcards`), mengedit/menghapus flashcard milik sendiri, atau *Regenerate* deck AI.

### FR-6: Document AI Chat (Tutor)
- **FR-6.1**: Setiap dokumen memiliki `chat_sessions` (otomatis dibuat saat chat pertama atau bisa buat sesi baru).
- **FR-6.2**: User mengirim pertanyaan ke `POST /api/documents/[documentId]/chat`:
  - Sistem mengambil top-K `document_sections` yang paling relevan (menggunakan `pgvector` similarity jika diaktifkan, atau *lexical/BM25-style keyword & section scoring* di server sebagai baseline deterministik yang ringan dan tanpa dependensi tambahan).
  - Prompt LLM diinstruksikan untuk menjawab **hanya berdasarkan konteks section dokumen** (dan memberi tahu jika informasi tidak ada di dokumen).
  - Pesan user dan balasan assistant disimpan ke `chat_messages` lengkap dengan `source_section_ids`.
- **FR-6.3**: UI menampilkan riwayat chat persisten, indikator section sumber yang bisa diklik/diintip, serta status loading/error.

### FR-7: Dashboard & Bookmarks
- **FR-7.1**: Dashboard menampilkan data real-time dari user yang login: nama user, total dokumen, *Continue Learning* (berdasarkan dokumen dengan `last_opened_at` terbaru + status chat/flashcard), *Recent Documents*, dan *Quick Bookmarks*.
- **FR-7.2**: User dapat menandai/menghapus bookmark pada dokumen, topik, flashcard, atau section (`GET/POST/DELETE /api/bookmarks`), dan melihat semua bookmark di halaman `/bookmarks`.
- **FR-7.3**: Membuka dokumen memperbarui `documents.last_opened_at` dan mencatat event di `activity_logs`.

---

## 6. Arsitektur Teknis & Rencana Kontrak API

### Struktur Route Halaman
| Path | Akses | Keterangan |
| :--- | :--- | :--- |
| `/` | Publik | Landing page (`(marketing)/page.tsx`) |
| `/login`, `/register` | Publik (redirect ke `/dashboard` jika login) | Autentikasi |
| `/auth/callback` | Publik | Handler konfirmasi email / OAuth Supabase |
| `/dashboard` | Terproteksi | Ringkasan aktivitas belajar & akses cepat |
| `/documents` | Terproteksi | Daftar seluruh dokumen + upload PDF |
| `/documents/[documentId]` | Terproteksi | Workspace belajar (Summary, Topics, Flashcards, Chat, Status) |
| `/bookmarks` | Terproteksi | Daftar bookmark lintas dokumen |

### Kontrak API Endpoints (`app/api/**`)
Semua endpoint terproteksi memvalidasi user via `supabase.auth.getUser()` (401 jika tidak login) dan memvalidasi payload menggunakan **Zod** (400 jika invalid).

- `POST /api/auth/logout` — Sign out Supabase & clear cookies.
- `POST /api/uploads/signed-url` — Validasi nama file, ukuran (`<= 10MB`), tipe (`application/pdf`), kembalikan `{ signedUrl, path, documentId }`.
- `GET /api/documents` — List dokumen milik user (dengan query `q`, `status`, jumlah topic/flashcard).
- `POST /api/documents` — Simpan record dokumen baru setelah upload ke Storage berhasil.
- `GET /api/documents/[documentId]` — Detail lengkap dokumen (summary aktif, topics, flashcards count, chat session, status bookmark) + update `last_opened_at`.
- `PATCH /api/documents/[documentId]` — Update judul dokumen.
- `DELETE /api/documents/[documentId]` — Hapus file di Storage & row dokumen di DB.
- `POST /api/documents/[documentId]/process` — Jalankan pipeline ekstraksi PDF & AI generation.
- `GET /api/documents/[documentId]/status` — Polling status pemrosesan dokumen & sub-fitur.
- `GET / POST /api/documents/[documentId]/summary` — Ambil atau regenerate ringkasan.
- `GET / POST /api/documents/[documentId]/topics` — Ambil atau regenerate topik.
- `GET / POST /api/documents/[documentId]/flashcards` — Ambil, tambah manual, atau regenerate flashcards.
- `PATCH / DELETE /api/documents/[documentId]/flashcards/[flashcardId]` — Edit/hapus flashcard.
- `GET / POST /api/documents/[documentId]/chat` — Ambil riwayat chat session & kirim pesan ke AI tutor.
- `GET / POST / DELETE /api/bookmarks` — Kelola bookmark user.
- `GET /api/dashboard` — Agregasi data dashboard (profile, recent documents, continue learning, quick bookmarks).

---

## 7. Perubahan Database & Konfigurasi yang Diperlukan

Migrasi SQL tambahan di `supabase/migrations/`:
1. **Trigger Auto-Profile (`handle_new_user`)**:
   - Trigger `AFTER INSERT ON auth.users` untuk otomatis insert ke `public.profiles (id, full_name, avatar_url)`.
   - Backfill query untuk user yang mungkin sudah terdaftar di `auth.users` sebelum trigger dibuat.
2. **Trigger `updated_at`**:
   - Fungsi `set_updated_at()` pada tabel `profiles`, `documents`, `document_sections`, `document_summaries`, `document_topics`, `flashcards`, `chat_sessions`, `bookmarks`.
3. **Perluasan Constraint `bookmarks_type_check`**:
   - Tambahkan `'document'` dan `'summary'` ke allowed values `bookmark_type` (atau petakan secara konsisten antara DB & UI).
4. **(Opsional / Disarankan) Kolom `description` atau ringkasan singkat pada `documents`**, atau pastikan `DocumentCard` mengambil ringkasan singkat dari `document_summaries` (`summary_type = 'short'`).

---

## 8. Non-Functional Requirements & Deployment Checklist

- **Keamanan**:
  - Tidak pernah mengekspos `SUPABASE_SERVICE_ROLE_KEY` atau `OPENROUTER_API_KEY` ke client bundle.
  - Seluruh query database dari server route menggunakan Supabase Server Client (dengan session user sehingga RLS tetap menjadi lapis pengaman kedua) kecuali operasi background/storage download yang memerlukan hak khusus setelah verifikasi ownership eksplisit.
  - Sanitasi nama file upload untuk mencegah path traversal.
- **Performa & Reliability**:
  - Timeout serverless function diperhatikan saat memproses PDF (Vercel Hobby 10s–60s; gunakan `export const maxDuration = 60` pada route AI/process jika deploy di Vercel, serta pecah/batasi chunk input LLM dengan aman).
  - Validasi ukuran teks PDF (mis. penanganan PDF hasil scan tanpa layer teks → pesan error jelas *"PDF tidak memiliki teks yang dapat diekstrak"* alih-alih crash).
- **Environment Variables Wajib**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_MODEL` (opsional, default `openrouter/free`)
  - `OPENROUTER_BASE_URL` (opsional, default `https://openrouter.ai/api/v1`)
  - `NEXT_PUBLIC_APP_URL` (untuk redirect URL di production)
- **Quality Gates Sebelum Deploy**:
  - `npm run lint` lolos tanpa error.
  - `npx tsc --noEmit` lolos tanpa error TypeScript.
  - `npm run build` sukses 100%.
  - Uji alur end-to-end (Register → Login → Upload PDF → Processing Ready → Summary/Topics/Flashcards/Chat → Bookmark → Logout).

---

## 9. Roadmap Implementasi Bertahap

1. **Fase 1 — Cleanup, Konsistensi, & Pondasi Teknis**
   - Perbaiki routing mismatch (`[documentsId]` → `[documentId]`, `routes.ts` → `route.ts`, `/auth/callback`).
   - Lengkapi `types/` (`database.ts`, `domain.ts`, `api.ts`), `lib/constants/*`, `lib/validations/*`, `lib/utils/*`, `lib/query/*`.
   - Tambah migrasi SQL (`profiles` trigger, `updated_at` trigger, `bookmarks` constraint) dan sinkronkan `.env.example`.
2. **Fase 2 — Auth Flow & Proteksi Route**
   - Implementasikan `proxy.ts` route protection, `app/(auth)/auth/callback/route.ts`, `app/api/auth/logout/route.ts`, dan `lib/auth/guards.ts`.
   - Sambungkan `AppShell` / `SidebarUserArea` dengan data user asli dan fungsi sign out nyata.
3. **Fase 3 — PDF Upload & AI Processing Backend**
   - Implementasikan `lib/storage/documents.ts`, `lib/pdf/*`, `lib/ai/*`.
   - Implementasikan API `uploads/signed-url`, `documents`, `documents/[documentId]`, `process`, `status`, `summary`, `topics`, `flashcards`, `chat`, `bookmarks`, `dashboard`.
4. **Fase 4 — Frontend Integration & Fitur Belajar Lengkap**
   - Buat komponen Upload PDF Dialog/Dropzone.
   - Sambungkan `DashboardPage`, `DocumentsPage`, dan `DocumentDetailPage` ke React Query hooks (hapus seluruh dummy data).
   - Bangun UI **Flashcards** (study mode + CRUD), **Document AI Chat** (persisten + source section), dan halaman **Bookmarks**.
   - Standarisasi bahasa UI & microcopy.
5. **Fase 5 — Verifikasi, Polish, & Deployment Readiness**
   - Typecheck, ESLint, Production Build (`npm run build`), dan uji alur manual end-to-end.
   - Siapkan `README.md` & panduan deploy Vercel + Supabase.
