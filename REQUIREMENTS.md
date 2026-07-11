# REQUIREMENTS.md — Spesifikasi Kebutuhan Teknis (Omnichannel)
## Modul Inovasi Simkopdes: SiPoin • SiForum • KOPI • SiKelas

| | |
|---|---|
| **Dokumen** | Technical Requirements Specification |
| **Versi** | 2.0 (Revisi Omnichannel Web + Mobile) |
| **Tanggal** | 11 Juli 2026 |
| **Sumber** | Pembaruan Arsitektur Hackathon — Transisi dari Mobile-Only ke Web + Capacitor |
| **Rujukan Fitur** | Lihat `FEATURE.md` untuk detail fungsional tiap modul |

---

## Daftar Isi
1. [Ringkasan Arsitektur Omnichannel](#1-ringkasan-arsitektur-omnichannel)
2. [Frontend (Web + Mobile via Capacitor)](#2-frontend-web--mobile-via-capacitor)
3. [Backend API (Unified API Gateway)](#3-backend-api-unified-api-gateway)
4. [Database & Skema](#4-database--skema)
5. [Caching & Queueing](#5-caching--queueing)
6. [Vector Database (AI)](#6-vector-database-ai)
7. [AI/LLM Mechanism (KOPI)](#7-aillm-mechanism-kopi)
8. [Infrastructure & Hosting](#8-infrastructure--hosting)
9. [Dataset Requirements](#9-dataset-requirements)
10. [Kebutuhan Non-Fungsional](#10-kebutuhan-non-fungsional)
11. [Keamanan & Kepatuhan Regulasi](#11-keamanan--kepatuhan-regulasi)
12. [Environment Variables](#12-environment-variables)

---

## 1. Ringkasan Arsitektur Omnichannel

Untuk mendukung aksesabilitas tertinggi bagi 8-12 juta anggota koperasi desa, Simkopdes kini mengusung arsitektur **Omnichannel**. Menggunakan satu basis kode antarmuka (UI), sistem ini dapat diakses secara langsung melalui Web Browser, sekaligus dapat diinstal sebagai Aplikasi Mobile Native (Android/iOS) melalui *wrapper* Capacitor.

```
┌──────────────────────────────────────────────┐
│   Frontend (HTML/CSS/JS Murni)               │
│   (Dibungkus dengan Capacitor untuk Mobile)  │
└──────────────────────┬───────────────────────┘
                       │ REST/GraphQL API & SSE
┌──────────────────────▼───────────────────────┐
│   Backend API (Unified API Gateway)          │  Go (Golang) / Node.js (NestJS)
└───────┬──────────────────────────────┬───────┘
        │                              │
┌───────▼─────────────┐ ┌──────────────▼───────┐
│  PostgreSQL 16      │ │    Redis 7.x         │  Data transaksional & Job Queue
│ (+ pgvector)        │ │ (async & cache)      │
└───────┬─────────────┘ └──────────────────────┘
        │
┌───────▼──────────────────────┐
│  Vector Search (pgvector)    │  (Basis pengetahuan KOPI)
└───────┬──────────────────────┘
        │
┌───────▼──────────────────────┐
│  LLM Provider (GPT-4o-mini)  │  (Generasi bahasa alami)
└───────┬──────────────────────┘
        │
┌───────▼──────────────────────┐
│  Cloud Lokal / BUMN Cloud    │  Kepatuhan PP No. 71/2019
└──────────────────────────────┘
```

---

## 2. Frontend (Web + Mobile via Capacitor)

Kerangka UI menggunakan pendekatan pengembangan berbasis web yang sangat ringan, didesain dengan konsep *Mobile-First*.

| Komponen | Spesifikasi |
|---|---|
| Basis UI | HTML5, CSS3 murni, dan Vanilla JavaScript (tanpa *heavy framework* untuk kecepatan maksimal) |
| Mobile Wrapper | **Capacitor / Ionic Engine** |
| Target Android | minSdkVersion 24 (Android 7.0) — mencakup perangkat *low-end* di pedesaan |
| Target iOS | iOS 13+ |
| Struktur Proyek | Terdesentralisasi dalam folder `/pages` (master, keuangan, bisnis, layanan, rat, inovasi) untuk skalabilitas pengembangan tim. |
| Push Notification | Menggunakan plugin Capacitor Push Notifications (terhubung ke Firebase/FCM) |

**Kelebihan Arsitektur Ini:**
- Pengembangan UI sangat cepat karena 100% desain web langsung berfungsi sebagai aplikasi mobile.
- Ukuran aplikasi mobile akhir (APK) sangat kecil sehingga hemat kuota dan ruang penyimpanan pengguna.

---

## 3. Backend API (Unified API Gateway)

Backend dirancang sebagai gerbang tunggal (Unified API) yang melayani permintaan dari antarmuka Web maupun Mobile tanpa perlu membuat *endpoint* yang berbeda.

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Tech Stack | Go (Golang 1.22+) atau Node.js (NestJS 11.x) |
| Protokol | RESTful API / GraphQL |
| Autentikasi | JWT (JSON Web Tokens) — dikirim via *Authorization Header* (Mobile) atau *Secure HttpOnly Cookie* (Web) |
| Konkurensi | Harus mendukung *high-concurrency* untuk pemrosesan SiPoin (klaim poin massal) dan SiForum (e-Voting). |

---

## 4. Database & Skema

Struktur database telah dioptimalkan ke dalam **satu DDL SQL Schema (`database_schema.sql`)** terpadu.

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Engine | PostgreSQL 16 atau 17 |
| Konsistensi | ACID penuh untuk `point_ledger` (SiPoin) dan hasil e-voting. |
| Skema Final | Merujuk pada file *auto-generated* `database_schema.sql` (hasil konversi dari metadata Hackathon) |
| Connection Pooling | PgBouncer (wajib untuk puluhan ribu koneksi konkuren) |

---

## 5. Caching & Queueing

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Engine | Redis 7.x (Mode Cluster) |
| Fungsi | - Antrean (*Job Queue*) untuk perhitungan SiPoin dari riwayat transaksi.<br>- Cache halaman profil dan skor.<br>- Rate-Limiting request API. |

---

## 6. Vector Database (AI)

| Kebutuhan | Spesifikasi Minimum |
|---|---|
| Engine | `pgvector` (Extension PostgreSQL) |
| Dimensi Vektor | Mengikuti dimensi model `text-embedding-3-small` (1536 dimensi). |
| Keuntungan | Menyatu langsung dengan PostgreSQL utama, mengurangi latensi jaringan antar-server database. |

---

## 7. AI/LLM Mechanism (KOPI)

KOPI menggunakan arsitektur *Retrieval-Augmented Generation (RAG)*. 

| Komponen | Spesifikasi |
|---|---|
| Komunikasi UI-Server | **Server-Sent Events (SSE) / WebSocket** agar *chat* KOPI muncul *real-time* (streaming kata-per-kata) di Web maupun Mobile. |
| Model Embedding | `text-embedding-3-small` |
| LLM | `GPT-4o-mini` (API sangat cepat, ideal untuk jaringan pedesaan). |
| Guardrails | Dilarang keras berhalusinasi di luar *knowledge base* AD/ART dan regulasi Kemenkop. |

---

## 8. Infrastructure & Hosting

| Kebutuhan | Spesifikasi |
|---|---|
| Penyedia | Cloud Server lokal (BUMN Cloud / Provider lokal) |
| Kepatuhan | Wajib mematuhi **PP No. 71 Tahun 2019** tentang Penyelenggaraan Sistem dan Transaksi Elektronik (Data WNI wajib di dalam negeri). |
| Orkestrasi | Docker + Kubernetes untuk *auto-scaling* beban web dan mobile. |

---

## 9. Dataset Requirements

Lima kategori dataset yang dikelola dalam PostgreSQL (tersedia strukturnya di `database_schema.sql`):
1. **Pengetahuan Koperasi:** AD/ART, SOP, Regulasi (KOPI).
2. **Transaksi Aktivitas:** Log simpan/pinjam teranonimisasi (SiPoin).
3. **Forum:** Metadata voting yang ditandatangani digital (SiForum).
4. **Edukasi:** Video materi, sertifikat digital (SiKelas).
5. **Demografi BPS:** Statistik komoditas desa untuk personalisasi konten.

---

## 10. Kebutuhan Non-Fungsional

1. **Jaringan Terbatas:** Capacitor harus dikonfigurasi dengan *Service Workers* agar halaman Web dapat diload dari cache offline (Progressive Web App) saat koneksi terputus.
2. **Skalabilitas:** API backend harus mampu melayani beban dari 80.000 koperasi di seluruh Indonesia.

---

## 11. Keamanan & Kepatuhan Regulasi

1. **Lokasi Data:** BUMN Cloud (PP No. 71/2019).
2. **Verifikasi NIK:** Pemungutan suara SiForum membutuhkan integrasi API Dukcapil/Identitas Digital untuk validitas e-RAT.
3. **Enkripsi:** TLS 1.2+ untuk seluruh jalur komunikasi REST API dan WebSocket.

---

## 12. Environment Variables

*Contoh variabel .env untuk backend Unified API:*

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/simkopdes

# Redis
REDIS_URL=redis://host:6379

# Capacitor / CORS
ALLOWED_ORIGINS=https://app.simkopdes.id, capacitor://localhost, http://localhost

# AI / LLM
EMBEDDING_MODEL=text-embedding-3-small
LLM_PROVIDER=gpt-4o-mini
LLM_API_KEY=your_key_here

# Kependudukan & Notifikasi
NIK_API_KEY=
FCM_SERVER_KEY=
```
