import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runSeed() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('password123')) {
    console.error('❌ ERROR: Silakan isi DATABASE_URL yang valid di file .env terlebih dahulu!');
    console.error('Contoh: postgresql://postgres:password_rahasia@localhost:5432/simkopdes');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    console.log('🔄 Menghubungkan ke PostgreSQL...');
    await client.connect();
    console.log('✅ Terhubung!');

    const schemaPath = path.join(__dirname, '../../database_schema.sql');
    console.log(`📖 Membaca file skema dari: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('File database_schema.sql tidak ditemukan di root proyek!');
    }

    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚡ Mengeksekusi query pembuatan tabel (ini mungkin butuh beberapa detik)...');
    await client.query(sqlScript);

    console.log('🎉 SEEDING BERHASIL! Seluruh tabel Simkopdes telah dibuat di database Anda.');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding:');
    console.error(error);
  } finally {
    await client.end();
    console.log('🔌 Koneksi ditutup.');
  }
}

runSeed();
