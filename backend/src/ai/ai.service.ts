import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    // Inisialisasi Gemini API
    // Pastikan GEMINI_API_KEY diset di file .env
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async chatWithKOPI(message: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `Kamu adalah KOPI (Koperasi Pintar), asisten virtual cerdas untuk aplikasi Simkopdes. 
            Jawablah pesan pengguna berikut ini dengan ramah dan ringkas: 
            Pesan Pengguna: ${message}` }],
          }
        ],
      });

      return response.text;
    } catch (error) {
      console.error('Error KOPI Chat:', error);
      return 'Maaf, KOPI sedang mengalami gangguan jaringan. Silakan coba lagi nanti.';
    }
  }

  // Placeholder untuk fungsi RAG Vector Search yang akan diintegrasikan dengan PostgreSQL pgvector
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      return response.embeddings[0].values;
    } catch (error) {
      console.error('Error Embedding:', error);
      return [];
    }
  }
}
