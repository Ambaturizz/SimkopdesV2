# Simkopdes V2

Sistem Informasi Manajemen Koperasi Desa (Simkopdes) V2 adalah platform digital yang dirancang untuk membantu pengelolaan dan administrasi koperasi desa secara modern, efisien, dan terintegrasi dengan teknologi AI.

## Arsitektur Teknologi

Aplikasi ini dibangun menggunakan arsitektur modern yang memisahkan antara antarmuka pengguna (Frontend) dan logika bisnis serta pengolahan data (Backend).

### Frontend (Client-side)
- **Teknologi Utama:** HTML5, CSS3, dan Vanilla JavaScript.
- **Mobile Integration:** Capacitor (untuk membungkus aplikasi web menjadi aplikasi native Android/iOS).
- **Desain:** Menggunakan pendekatan Glassmorphism dan Material Design dengan CSS Native.
- **Struktur Direktori:** Berada di dalam folder `www/`.

### Backend (Server-side)
- **Framework:** NestJS (Node.js / TypeScript).
- **ORM & Database:** TypeORM untuk manajemen entitas dengan sistem basis data relasional PostgreSQL. Mendukung ekstensi `pgvector` untuk pencarian vektor AI.
- **AI Integration:** Google GenAI SDK (`@google/genai`) terintegrasi di dalam layanan AI (Modul `src/ai`) untuk fitur KOPI (Koperasi Pintar).
- **Struktur Direktori:** Berada di dalam folder `backend/`.

### Infrastruktur & Deployment
- **Frontend Hosting:** Vercel (dikonfigurasi menggunakan `vercel.json`).
- **Backend Hosting:** Google Cloud Run (dibangun menggunakan `Dockerfile` khusus).
- **Containerization:** Docker.

---

## Panduan Instalasi dan Menjalankan Aplikasi (Installation Guide)

Panduan berikut akan membantu Anda menjalankan aplikasi Simkopdes V2 di lingkungan pengembangan lokal (localhost).

### Persyaratan Sistem
Pastikan perangkat Anda telah menginstal perangkat lunak berikut:
1. Node.js (versi 18 atau terbaru)
2. npm (Node Package Manager)
3. PostgreSQL Server (berjalan secara lokal atau layanan cloud seperti Supabase/Neon)

### 1. Kloning Repositori
Langkah pertama, kloning repositori ini ke komputer Anda:
```bash
git clone https://github.com/Ambaturizz/SimkopdesV2.git
cd SimkopdesV2
```

### 2. Menjalankan Frontend
Frontend Simkopdes V2 menggunakan file HTML statis yang berada di direktori `www/`.
1. Anda dapat menjalankan frontend dengan membuka file `www/index.html` secara langsung di browser web Anda.
2. Alternatif terbaik, gunakan ekstensi Live Server di VSCode atau web server statis:
   ```bash
   npx serve www
   ```
3. Akses melalui URL yang diberikan (biasanya `http://localhost:3000`).

### 3. Menyiapkan dan Menjalankan Backend (NestJS)
Backend beroperasi sebagai API gateway. Lakukan langkah-langkah berikut pada terminal terpisah:

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment:
   Secara default, file `.env` telah disiapkan. Pastikan kredensial basis data Anda di `.env` (berada di dalam folder `backend/`) sudah sesuai dengan server PostgreSQL Anda. Contoh isi `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/simkopdes"
   PORT=3942
   ```

4. Jalankan Seeder Database (Opsional):
   Untuk menginisialisasi skema tabel ke dalam database kosong Anda, jalankan:
   ```bash
   npm run db:seed
   ```

5. Jalankan Server:
   ```bash
   npm run start:dev
   ```
   Server backend akan berjalan dan dapat diakses pada `http://localhost:3942`. Anda dapat melakukan pengecekan status server pada `http://localhost:3942/health`.

### 4. Menjalankan Aplikasi Mobile (Capacitor)
Jika Anda ingin membangun atau menguji versi mobile (Android):
1. Pastikan Anda berada di direktori utama `SimkopdesV2`.
2. Sinkronisasi perubahan dari folder `www` ke proyek Android:
   ```bash
   npx cap sync
   ```
3. Buka Android Studio untuk menjalankan emulator:
   ```bash
   npx cap open android
   ```
