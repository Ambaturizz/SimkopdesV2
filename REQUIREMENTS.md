# REQUIREMENTS.md — Spesifikasi Kebutuhan Teknis
## Modul Inovasi Simkopdes Mobile: SiPoin • SiForum • KOPI • SiKelas

| | |
|---|---|
| **Dokumen** | Technical Requirements Specification |
| **Versi** | 1.0 |
| **Tanggal** | 10 Juli 2026 |
| **Sumber** | Bab III — Technical Stack, AI Mechanism & Dataset, Proposal Inovasi Digital Simkopdes Mobile (Albert Timmothy Ariajaya, Juli 2026) |
| **Rujukan Fitur** | Lihat `FEATURE.md` untuk detail fungsional tiap modul |
| **Status** | Draft untuk Review |

---

## Daftar Isi
1. [Ringkasan Arsitektur](#1-ringkasan-arsitektur)
2. [Frontend Mobile](#2-frontend-mobile)
3. [Backend API](#3-backend-api)
4. [Database](#4-database)
5. [Caching & Queueing](#5-caching--queueing)
6. [Vector Database (AI)](#6-vector-database-ai)
7. [AI/LLM Mechanism (KOPI)](#7-aillm-mechanism-kopi)
8. [Infrastructure & Hosting](#8-infrastructure--hosting)
9. [Dataset Requirements](#9-dataset-requirements)
10. [Kebutuhan Non-Fungsional](#10-kebutuhan-non-fungsional)
11. [Keamanan & Kepatuhan Regulasi](#11-keamanan--kepatuhan-regulasi)
12. [Environment Variables](#12-environment-variables)
13. [Ringkasan Dependency per Layer](#13-ringkasan-dependency-per-layer)
14. [Checklist Kesiapan Infrastruktur](#14-checklist-kesiapan-infrastruktur)

---

## 1. Ringkasan Arsitektur

Empat modul inovasi (SiPoin, SiForum, KOPI, SiKelas) dibangun sebagai **penambahan (add-on)** terhadap Simkopdes Mobile eksisting, dengan arsitektur yang dirancang untuk tiga prioritas utama sesuai proposal:

1. **Skalabilitas** — mampu memproses puluhan ribu transaksi poin dan pemungutan suara secara real-time, untuk basis pengguna hingga 8–12 juta anggota pada fase awal (SOM).
2. **Keringanan performa di wilayah bersinyal terbatas** — aplikasi harus tetap berjalan mulus di smartphone kelas menengah-bawah dan koneksi internet desa yang tidak stabil.
3. **Keamanan data tingkat tinggi** — khususnya untuk data transaksi keuangan (SiPoin ledger), data identitas (NIK untuk e-voting SiForum), dan kepatuhan regulasi data instrumen layanan publik.

```
┌─────────────────────────────┐
│   Frontend Mobile            │  Flutter / React Native
│   (Low-end Android target)   │
└───────────────┬───────────────┘
                │ REST/GraphQL API
┌───────────────▼───────────────┐
│   Backend API                 │  Go (Golang) / Node.js (NestJS)
└───────┬───────────────┬───────┘
        │               │
┌───────▼──────┐ ┌──────▼───────┐
│  PostgreSQL   │ │    Redis      │  Data relasional & Cache/Queue
│ (+ pgvector)  │ │ (async jobs)  │
└───────┬───────┘ └──────────────┘
        │
┌───────▼───────────────┐
│  Vector Search          │  pgvector / FAISS
│  (basis pengetahuan     │
│   KOPI)                 │
└─────────────────────────┘
        │
┌───────▼───────────────┐
│  LLM Provider            │  GPT-4o-mini / Llama-3-8B
│  (via API atau self-host)│
└───────────────────────────┘
        │
┌───────▼───────────────┐
│  Cloud Lokal / BUMN Cloud │  Kepatuhan PP No. 71/2019
└───────────────────────────┘
```

---

## 2. Frontend Mobile

Proposal memberikan dua opsi framework; keduanya dipilih atas dasar performa ringan di perangkat kelas bawah.

### 2.1 Opsi A — Flutter

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Flutter SDK | 3.x (stable channel terbaru) |
| Dart SDK | Sesuai bundel Flutter 3.x (≥3.4) |
| Target Android | minSdkVersion 24 (Android 7.0) — menjangkau mayoritas perangkat low-end yang masih beredar di pedesaan |
| Target iOS (opsional) | iOS 13+ (prioritas sekunder, mayoritas pengguna target Android) |
| State Management | Riverpod atau Bloc (untuk skalabilitas maintenance tim) |
| Local Storage | `sqflite` atau `Hive` untuk cache offline-first (katalog SiKelas, draft utas SiForum) |
| Push Notification | Firebase Cloud Messaging (FCM) |
| Image/Asset Optimization | Kompresi gambar otomatis, lazy loading untuk konten SiKelas (video/gambar) |

### 2.2 Opsi B — React Native

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| React Native | 0.7x (versi arsitektur baru/New Architecture aktif) |
| Node.js (untuk tooling build) | 20 LTS atau 22 LTS |
| Target Android | minSdkVersion 24 (Android 7.0) |
| Target iOS (opsional) | iOS 13+ |
| State Management | Redux Toolkit atau Zustand |
| Local Storage | `react-native-mmkv` atau `AsyncStorage` (untuk dataset kecil) |
| Push Notification | Firebase Cloud Messaging (FCM) |
| Navigasi | React Navigation 6.x |

### 2.3 Kebutuhan Perangkat Target (Kedua Opsi)
- Mendukung perangkat Android dengan RAM 2GB dan penyimpanan terbatas (optimasi ukuran APK/bundle, hindari dependency berat yang tidak esensial).
- Aplikasi harus tetap fungsional pada koneksi 3G/edge yang tidak stabil (retry mechanism, offline caching untuk konten yang sudah pernah dimuat).
- Konsumsi baterai diminimalkan — hindari polling berlebihan, gunakan push notification alih-alih long-polling untuk update real-time (mis. notifikasi hasil voting).

---

## 3. Backend API

### 3.1 Opsi A — Go (Golang)

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Go Version | 1.22+ |
| Web Framework | Gin, Echo, atau Fiber |
| ORM/Query Builder | GORM atau sqlc (untuk query type-safe terhadap PostgreSQL) |
| Concurrency | Goroutine + channel untuk pemrosesan konkuren transaksi poin & voting |
| Validasi | `go-playground/validator` |
| Testing | `testing` bawaan Go + `testify` |

### 3.2 Opsi B — Node.js (NestJS)

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Node.js Version | 22 LTS |
| Framework | NestJS 10.x atau 11.x |
| Bahasa | TypeScript 5.x |
| ORM | Prisma atau TypeORM (koneksi ke PostgreSQL) |
| Validasi | `class-validator` + `class-transformer` |
| Testing | Jest |

### 3.3 Kebutuhan Umum Backend (Kedua Opsi)
- Arsitektur API modular per domain (`sipoin/`, `siforum/`, `kopi/`, `sikelas/`) agar mudah dikembangkan/diuji terpisah.
- Mendukung **konkurensi tinggi** untuk pemrosesan transaksi poin (SiPoin) dan pemungutan suara (SiForum) secara real-time — desain endpoint harus idempotent untuk mencegah duplikasi transaksi akibat retry jaringan tidak stabil.
- Autentikasi berbasis token (JWT) dengan refresh token, terhubung ke sistem identitas anggota Simkopdes eksisting.
- Rate limiting di level API gateway untuk mencegah penyalahgunaan (mis. spam voting, spam poin).
- Logging terstruktur (JSON logs) untuk mendukung audit transaksi finansial dan hasil voting.

---

## 4. Database

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Engine | PostgreSQL 16 atau 17 |
| Mode Konsistensi | ACID penuh — wajib untuk data transaksi keuangan, profil anggota, dan *point ledger* SiPoin |
| Extension wajib | `pgvector` (untuk pencarian semantik KOPI, lihat Bagian 6) |
| Backup | Automated daily backup + Point-in-Time Recovery (PITR) |
| Replikasi | Minimal 1 read replica untuk query laporan/analitik agar tidak membebani database transaksional utama |
| Connection Pooling | PgBouncer (mengingat potensi puluhan ribu koneksi konkuren dari basis pengguna nasional) |
| Skema Kunci | Tabel `point_ledger` (SiPoin), `forum_threads`/`votes` (SiForum), `knowledge_documents`/`chat_logs` (KOPI), `classes`/`certificates` (SiKelas) — didesain relasional dengan foreign key ke tabel anggota Simkopdes eksisting |

---

## 5. Caching & Queueing

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Engine | Redis 7.x |
| Mode | Redis Cluster (untuk skala nasional) atau Redis Sentinel (untuk high-availability skala menengah) |
| Fungsi Utama | Antrean kalkulasi poin asinkron (SiPoin), cache hasil pencarian semantik yang sering diakses (KOPI), cache hasil voting yang sedang berjalan (SiForum) |
| Library Queue | `asynq` (Go) atau `BullMQ` (Node.js/NestJS) |
| Retry Policy | Exponential backoff untuk job kalkulasi poin yang gagal, dengan dead-letter queue untuk investigasi manual |

---

## 6. Vector Database (AI)

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Opsi A | `pgvector` — extension PostgreSQL, direkomendasikan jika ingin menyatukan data relasional dan vektor dalam satu database (mengurangi kompleksitas infrastruktur) |
| Opsi B | FAISS — library pencarian similarity terpisah, cocok jika volume dokumen pengetahuan sangat besar dan butuh performa pencarian vektor yang sangat dioptimalkan di luar database utama |
| Dimensi Vektor | Menyesuaikan model embedding yang dipakai (lihat Bagian 7) |
| Index Type | HNSW (Hierarchical Navigable Small World) untuk pgvector — trade-off baik antara kecepatan pencarian dan akurasi |
| Update Index | Re-indexing terjadwal setiap ada dokumen pengetahuan baru/revisi (SOP, AD/ART, FAQ) ditambahkan ke knowledge base |

---

## 7. AI/LLM Mechanism (KOPI)

Mengikuti arsitektur **Retrieval-Augmented Generation (RAG)** yang dijabarkan di proposal (lihat `FEATURE.md` Bagian 3.5 untuk alur lengkap 6 tahap).

| Komponen | Spesifikasi |
|---|---|
| Model Embedding | `text-embedding-3-small` (atau model embedding ringan setara) — dipilih karena efisiensi biaya dan kecepatan untuk volume query tinggi |
| Large Language Model | `GPT-4o-mini` (via API) **atau** `Llama-3-8B` (self-hosted) — proposal memberi dua opsi tergantung kebutuhan biaya vs. kendali penuh atas data |
| Guardrails/Moderasi | Modul moderasi bahasa wajib diterapkan pada seluruh output LLM sebelum dikirim ke pengguna, untuk memfilter informasi palsu atau bahasa tidak patut |
| Prompt Template | Persona KOPI (asisten ramah pedesaan, santun, sederhana, lugas) harus konsisten disematkan dalam setiap prompt synthesis |
| Sumber Konteks | Hanya dokumen resmi terindeks (AD/ART, SOP, panduan aplikasi, regulasi Kemenkop) — **tidak diperkenankan** menjawab dari pengetahuan umum LLM tanpa konteks dokumen resmi, guna mencegah halusinasi |
| Latency Target | Respons diterima pengguna dalam hitungan detik (near real-time) |
| Fallback | Jika top-K dokumen relevan tidak ditemukan/skor kemiripan di bawah ambang batas, KOPI wajib mengakui keterbatasan dan mengarahkan ke petugas manusia, bukan menjawab dengan tebakan |

### 7.1 Pertimbangan Pemilihan LLM

| Opsi | Kelebihan | Pertimbangan |
|---|---|---|
| GPT-4o-mini (API) | Kualitas jawaban tinggi, tidak perlu kelola infrastruktur GPU sendiri, cepat diimplementasikan | Biaya per-token berjalan, data query terkirim ke penyedia pihak ketiga (perlu ditinjau terhadap kepatuhan PP 71/2019 untuk data sensitif) |
| Llama-3-8B (self-hosted) | Kendali penuh atas data (relevan untuk kepatuhan data lokal), tidak ada biaya per-token berkelanjutan | Butuh infrastruktur GPU/komputasi khusus untuk hosting dan inferensi, kompleksitas operasional lebih tinggi |

> **Catatan:** karena KOPI berpotensi memproses data terkait keuangan anggota (simulasi pinjaman), evaluasi lebih lanjut diperlukan untuk menentukan bagian mana dari pipeline yang boleh memakai API pihak ketiga vs. yang wajib self-hosted, sejalan dengan kepatuhan PP No. 71 Tahun 2019 (lihat Bagian 11).

---

## 8. Infrastructure & Hosting

| Kebutuhan | Spesifikasi |
|---|---|
| Penyedia | Cloud Server lokal (BUMN Cloud atau Cloud Provider lokal Indonesia) |
| Kepatuhan Regulasi | Wajib mematuhi **PP No. 71 Tahun 2019** tentang Penyelenggaraan Sistem dan Transaksi Elektronik — penempatan pusat data di dalam negeri untuk instrumen layanan publik |
| Orkestrasi | Container-based deployment (Docker + Kubernetes) direkomendasikan untuk skalabilitas menyesuaikan pertumbuhan dari SOM (40.000 unit) menuju SAM (80.000 unit) koperasi |
| CDN | Diperlukan untuk distribusi konten video SiKelas ke seluruh wilayah Indonesia dengan latency rendah |
| Monitoring | Stack observability (mis. Prometheus + Grafana) untuk memantau beban transaksi poin/voting real-time, terutama saat lonjakan (mis. periode e-RAT serentak) |
| Disaster Recovery | Rencana pemulihan bencana dengan RPO/RTO terdefinisi, mengingat data mencakup transaksi finansial dan hasil voting yang legally-binding untuk e-RAT |

---

## 9. Dataset Requirements

Lima kategori dataset yang harus disiapkan dan dikelola secara **anonim** untuk menjaga kerahasiaan data pribadi anggota:

| Dataset | Isi | Digunakan oleh Modul |
|---|---|---|
| Dataset Pengetahuan Koperasi (Knowledge Base) | AD/ART koperasi, SOP pengajuan pinjaman, SOP pembukaan simpanan, panduan penggunaan seluruh modul Simkopdes Mobile, dokumen regulasi resmi Kemenkop | KOPI |
| Dataset Transaksi & Aktivitas (Anonymized Activity Log) | Log transaksi simpanan, pinjaman, pembelian sembako, kehadiran RAT | SiPoin |
| Dataset Forum (SiForum Content Catalog) | Metadata utas diskusi, kategori topik, data polling, catatan hasil e-voting yang ditandatangani digital | SiForum |
| Dataset Edukasi (SiKelas LMS Data) | Video materi, ringkasan teks PDF, bank soal kuis, profil mentor, log penyelesaian kelas | SiKelas |
| Dataset Demografi Publik (BPS) | Statistik komoditas utama desa, pendapatan rata-rata desa, penetrasi internet desa | SiKelas (personalisasi materi) |

### 9.1 Kebutuhan Penanganan Data
- Seluruh dataset aktivitas/transaksi anggota wajib **dianonimkan** sebelum digunakan untuk analitik atau pelatihan/evaluasi model, kecuali untuk kebutuhan operasional langsung (mis. saldo poin milik anggota yang bersangkutan).
- Dataset Pengetahuan Koperasi harus melalui proses kurasi dan validasi oleh pengurus/legal sebelum diindeks ke vector database, untuk memastikan KOPI hanya menjawab dari sumber yang telah diverifikasi resmi.
- Diperlukan mekanisme *versioning* pada Dataset Pengetahuan Koperasi (SOP dan regulasi dapat berubah) agar KOPI selalu menjawab berdasarkan versi dokumen terbaru yang berlaku.

---

## 10. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| Skalabilitas Pengguna | Mendukung pertumbuhan dari basis SOM (8–12 juta anggota, 40.000 koperasi) menuju SAM (16–24 juta anggota, 80.000 koperasi) tanpa perombakan arsitektur besar. |
| Performa Jaringan Terbatas | Seluruh fitur inti (transaksi poin, buka utas forum, akses kelas) harus tetap dapat digunakan pada koneksi 3G/sinyal lemah khas wilayah pedesaan. |
| Performa Perangkat | Aplikasi harus ringan di perangkat Android kelas menengah-bawah (RAM 2GB), termasuk saat memuat konten video SiKelas (gunakan streaming adaptif/kompresi, bukan unduh penuh). |
| Konkurensi Transaksi | Sistem backend harus mampu memproses puluhan ribu transaksi poin dan suara voting secara bersamaan tanpa degradasi signifikan, terutama pada periode e-RAT serentak nasional. |
| Konsistensi Data | Transaksi SiPoin dan hasil SiForum (voting) wajib ACID-compliant — tidak boleh terjadi duplikasi poin atau suara ganda akibat race condition. |
| Ketersediaan | Target uptime tinggi (mis. 99.5%+) mengingat skala nasional dan sifat sebagian data yang legally-binding (hasil e-RAT). |
| Aksesibilitas AI | KOPI harus dapat diakses dan dipahami oleh pengguna dengan literasi digital rendah — respons singkat, bahasa sederhana, dukungan format suara/teks dapat dipertimbangkan pada iterasi lanjutan. |

---

## 11. Keamanan & Kepatuhan Regulasi

| Area | Kebutuhan |
|---|---|
| Lokasi Data | Wajib disimpan di pusat data dalam negeri (cloud lokal/BUMN) sesuai **PP No. 71 Tahun 2019**. |
| Verifikasi Identitas | Integrasi verifikasi **NIK** untuk sesi e-voting resmi di SiForum — memerlukan koneksi ke sumber data kependudukan yang sah dan aman. |
| Enkripsi | Enkripsi data at-rest (database) dan in-transit (TLS 1.2+ untuk seluruh komunikasi API). |
| Audit Trail | Seluruh transaksi SiPoin dan hasil voting SiForum tercatat dalam log audit yang tidak dapat diubah (immutable), mendukung akuntabilitas hasil e-RAT. |
| Tanda Tangan Digital | Hasil e-voting resmi (mendukung e-RAT) harus melalui mekanisme tanda tangan digital yang sah secara sistem. |
| Perlindungan Data Pribadi | Kepatuhan terhadap UU Perlindungan Data Pribadi (UU PDP) untuk seluruh data anggota yang diproses lintas modul. |
| Keamanan AI | Guardrails KOPI wajib mencegah kebocoran data pribadi anggota lain dalam jawaban (mis. tidak menampilkan data anggota lain saat menjawab pertanyaan tentang saldo/status). |

---

## 12. Environment Variables

Contoh variabel konfigurasi yang perlu disiapkan di setiap environment (dev/staging/production):

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/simkopdes
DATABASE_POOL_MAX=50

# Redis
REDIS_URL=redis://host:6379

# Vector Search
VECTOR_DB_PROVIDER=pgvector        # atau "faiss"
VECTOR_INDEX_NAME=kopi_knowledge_base

# AI / LLM
EMBEDDING_MODEL=text-embedding-3-small
LLM_PROVIDER=gpt-4o-mini            # atau "llama-3-8b-selfhosted"
LLM_API_KEY=
LLM_MAX_TOKENS=1000
GUARDRAILS_ENABLED=true

# Identitas & Voting
NIK_VERIFICATION_SERVICE_URL=
NIK_VERIFICATION_API_KEY=

# Notifikasi
FCM_SERVER_KEY=

# Infrastructure
CLOUD_REGION=id-jakarta             # cloud lokal
CDN_BASE_URL=

# Feature Flags
SIPOIN_ENABLED=true
SIFORUM_ENABLED=true
KOPI_ENABLED=true
SIKELAS_ENABLED=true
```

---

## 13. Ringkasan Dependency per Layer

| Layer | Pilihan Utama | Alternatif | Alasan Pemilihan |
|---|---|---|---|
| Frontend Mobile | Flutter 3.x | React Native 0.7x | Performa native-like ringan di perangkat low-end Android |
| Backend API | Go (Golang) 1.22+, Gin/Fiber | Node.js 22 LTS + NestJS 11.x | Konkurensi tinggi untuk transaksi real-time skala nasional |
| Database | PostgreSQL 16/17 | — | Konsistensi ACID untuk data finansial |
| Cache/Queue | Redis 7.x | — | Kalkulasi poin asinkron |
| Vector Search | pgvector (extension PostgreSQL) | FAISS (standalone) | Efisiensi infrastruktur (satu database) vs. performa maksimal (dataset sangat besar) |
| Embedding Model | text-embedding-3-small | — | Ringan & efisien biaya untuk volume query tinggi |
| LLM | GPT-4o-mini (API) | Llama-3-8B (self-hosted) | Trade-off kecepatan implementasi vs. kendali data |
| Hosting | Cloud lokal/BUMN Cloud | — | Wajib kepatuhan PP No. 71/2019 |

---

## 14. Checklist Kesiapan Infrastruktur

Sebelum memulai implementasi modul SiPoin/SiForum/KOPI/SiKelas, pastikan:

- [ ] Keputusan final dibuat antara Flutter vs. React Native (tidak mengerjakan dua-duanya paralel).
- [ ] Keputusan final dibuat antara Go vs. Node.js/NestJS untuk backend.
- [ ] Instance PostgreSQL dengan extension `pgvector` sudah terpasang dan diuji.
- [ ] Instance Redis untuk queue sudah tersedia (minimal untuk environment development).
- [ ] Akses ke cloud lokal/BUMN Cloud sudah dikonfirmasi untuk environment produksi (bukan cloud publik luar negeri).
- [ ] Kurasi awal Dataset Pengetahuan Koperasi (AD/ART, SOP, FAQ) sudah tersedia dalam bentuk dokumen digital untuk diindeks ke vector database.
- [ ] Mekanisme/API verifikasi NIK untuk kebutuhan e-voting SiForum sudah diidentifikasi sumbernya (integrasi dengan sistem kependudukan yang sah).
- [ ] Kebijakan pemilihan LLM (API pihak ketiga vs. self-hosted) sudah direview dari sisi kepatuhan data sebelum implementasi KOPI dimulai.
- [ ] Rencana disaster recovery dan backup sudah didefinisikan mengingat sifat data yang legally-binding (hasil e-RAT) dan finansial (SiPoin ledger).
